import { getUser } from "../../../../lib/auth";
import { isVirtualDatabase } from "../../../../lib/database-mode";
import { lockOrder } from "../../../../lib/payment-lifecycle";
import { prisma } from "../../../../lib/prisma";
import { familyCode } from "../../../../lib/product-market";
import { hasSameOrigin } from "../../../../lib/request-origin";
import { readReview, ReviewInputError } from "../../../../lib/review-upload";
import { reviewableOrder, reviewPurchaseFilter, reviewSelection, validReviewId } from "../../../../lib/reviews";

const headers = { "Cache-Control": "private, no-store" };
const pageSize = 10;
const failure = (error, status) => Response.json({ error }, { status, headers });
const available = () => !isVirtualDatabase() && Boolean(process.env.DATABASE_URL);

async function getProduct(params, active = true) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null;
  const product = await prisma.product.findUnique({
    where: { slug, ...(active && { isActive: true }) }, select: { id: true, code: true },
  });
  if (!product) return null;
  const code = familyCode(product.code);
  const family = await prisma.product.findMany({
    where: { code: { in: [code, `${code}-60ML`] } }, select: { id: true, code: true },
  });
  return { id: family.find((item) => item.code === code)?.id ?? product.id, purchaseIds: family.map(({ id }) => id) };
}

export async function GET(request, { params }) {
  if (!available()) return failure("구매 후기 서비스가 준비 중입니다.", 404);
  const cursor = new URL(request.url).searchParams.get("cursor");
  if (cursor && !validReviewId(cursor)) return failure("후기 위치를 확인해 주세요.", 400);
  try {
    const product = await getProduct(params);
    if (!product) return failure("상품을 찾을 수 없습니다.", 404);
    const where = { productId: product.id, order: reviewableOrder };
    // Use the last visible row as a position, including when it was refunded between requests.
    const position = cursor && await prisma.productReview.findUnique({
      where: { id: cursor, productId: product.id }, select: { id: true, createdAt: true },
    });
    if (cursor && !position) return failure("후기 목록을 다시 불러와 주세요.", 404);
    const [reviews, reviewCount] = await Promise.all([
      prisma.productReview.findMany({
        where: position ? { ...where, OR: [
          { createdAt: { lt: position.createdAt } },
          { createdAt: position.createdAt, id: { lt: position.id } },
        ] } : where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: pageSize + 1, select: reviewSelection,
      }),
      prisma.productReview.count({ where }),
    ]);
    let permission = "login";
    const user = await getUser();
    if (user && !user.guest) {
      const existing = await prisma.productReview.findUnique({
        where: { productId_ownerId: { productId: product.id, ownerId: user.id } }, select: { id: true },
      });
      const purchased = !existing && await prisma.order.findFirst({
        where: reviewPurchaseFilter(product.purchaseIds, user.id), select: { id: true },
      });
      permission = existing ? "written" : purchased ? "write" : "purchase";
    }
    return Response.json({
      reviews: reviews.slice(0, pageSize), permission, reviewCount,
      nextCursor: reviews.length > pageSize ? reviews[pageSize - 1].id : null,
    }, { headers });
  } catch {
    return failure("후기를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.", 503);
  }
}

export async function POST(request, { params }) {
  if (!available()) return failure("구매 후기 서비스가 준비 중입니다.", 404);
  if (!hasSameOrigin(request)) return failure("잘못된 요청입니다.", 403);
  try {
    const user = await getUser();
    if (!user || user.guest) return failure("구매한 회원 계정으로 로그인해 주세요.", 401);
    const product = await getProduct(params);
    if (!product) return failure("상품을 찾을 수 없습니다.", 404);
    const purchase = reviewPurchaseFilter(product.purchaseIds, user.id);
    const order = await prisma.order.findFirst({
      where: purchase, orderBy: { id: "desc" }, select: { orderNumber: true },
    });
    if (!order) return failure("이 상품의 결제가 확인된 회원만 후기를 쓸 수 있습니다.", 403);
    const existing = await prisma.productReview.findUnique({
      where: { productId_ownerId: { productId: product.id, ownerId: user.id } }, select: { id: true },
    });
    if (existing) return failure("이미 이 상품에 후기를 남겼습니다.", 409);
    const { rating, body, photo } = await readReview(request);
    const review = await prisma.$transaction(async (tx) => {
      const lockedOrder = await lockOrder(tx, order.orderNumber);
      if (!lockedOrder || !await tx.order.findFirst({ where: { ...purchase, id: lockedOrder.id }, select: { id: true } })) return null;
      return tx.productReview.create({
        data: { productId: product.id, orderId: lockedOrder.id, ownerId: user.id, rating, body,
          ...(photo && { photo: { create: photo } }),
        },
        select: reviewSelection,
      });
    });
    if (!review) return failure("이 상품의 결제가 확인된 회원만 후기를 쓸 수 있습니다.", 403);
    return Response.json({ review }, { status: 201, headers });
  } catch (error) {
    if (error instanceof ReviewInputError) return failure(error.message, error.status);
    if (error.code === "P2002") return failure("이미 이 상품에 후기를 남겼습니다.", 409);
    return failure("후기를 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.", 503);
  }
}

export async function DELETE(request, { params }) {
  if (!available()) return failure("구매 후기 서비스가 준비 중입니다.", 404);
  if (!hasSameOrigin(request)) return failure("잘못된 요청입니다.", 403);
  try {
    const user = await getUser();
    if (!user || user.guest) return failure("로그인해 주세요.", 401);
    const product = await getProduct(params, false);
    if (!product) return failure("상품을 찾을 수 없습니다.", 404);
    const deleted = await prisma.productReview.deleteMany({ where: { productId: product.id, ownerId: user.id } });
    return deleted.count ? new Response(null, { status: 204, headers }) : failure("후기를 찾을 수 없습니다.", 404);
  } catch {
    return failure("후기를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.", 503);
  }
}
