import { getUser } from "../../../../lib/auth";
import { isVirtualDatabase } from "../../../../lib/database-mode";
import { isOrderOperator, manageOrder, orderForCustomer } from "../../../../lib/order-operations";
import { validPaymentId } from "../../../../lib/payment-lifecycle";
import { prisma } from "../../../../lib/prisma";
import { hasSameOrigin } from "../../../../lib/request-origin";
import { isLocalDemoAdmin } from "../../../../lib/local-demo-admin";
import { getVirtualManagedOrders, validVirtualOrderNumber } from "../../../../lib/virtual-db";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(request) {
  const virtual = isVirtualDatabase();
  const user = await getUser();
  if (virtual ? !isLocalDemoAdmin(request, user) : !isOrderOperator(user)) return new Response(null, { status: 404, headers });
  const search = new URL(request.url).searchParams.get("number");
  if (search && !(virtual ? validVirtualOrderNumber(search) : validPaymentId(search))) return Response.json({ error: "주문번호를 확인해 주세요." }, { status: 400, headers });
  if (virtual) return Response.json({ orders: (await getVirtualManagedOrders(search, 50)).map(orderForCustomer) }, { headers });
  const orders = await prisma.order.findMany({
    where: search ? { orderNumber: search } : undefined,
    orderBy: { createdAt: "desc" }, take: 50, include: { items: true },
  });
  const shippingOrder = search && orders.find((order) => ["PAID", "PREPARING"].includes(order.status) && !order.paymentIssue);
  if (shippingOrder) {
    await prisma.orderOperation.create({ data: { orderId: shippingOrder.id, operatorId: user.id, action: "view-shipping-address" } });
  }
  return Response.json({ orders: orders.map((order) => ({
    ...orderForCustomer(order), reservationExpiresAt: order.reservationExpiresAt,
    ...(shippingOrder?.id === order.id ? {
      recipientName: order.recipientName, phone: order.phone,
      deliveryAddress: [order.postalCode, order.address, order.addressDetail].filter(Boolean).join(" "),
    } : {}),
  })) }, { headers });
}

export async function POST(request) {
  if (isVirtualDatabase() || !hasSameOrigin(request)) return new Response(null, { status: 403, headers });
  const user = await getUser();
  if (!isOrderOperator(user)) return new Response(null, { status: 404, headers });
  try {
    const { paymentId, action, carrier, trackingNumber } = await request.json();
    if (!validPaymentId(paymentId) || !["check", "prepare", "ship", "delivered", "refund"].includes(action)) {
      return Response.json({ error: "주문과 처리 작업을 확인해 주세요." }, { status: 400, headers });
    }
    if (action === "ship" && (typeof carrier !== "string" || !carrier.trim() || carrier.length > 40
      || typeof trackingNumber !== "string" || !/^[a-zA-Z0-9-]{4,40}$/.test(trackingNumber))) {
      return Response.json({ error: "택배사와 송장번호를 확인해 주세요." }, { status: 400, headers });
    }
    const order = await manageOrder(paymentId, user.id, action, action === "ship" ? { carrier: carrier.trim(), trackingNumber } : undefined);
    if (!order) return new Response(null, { status: 404, headers });
    return Response.json({ orderNumber: order.orderNumber, status: order.status }, { headers });
  } catch (error) {
    const operationError = error?.constructor === Error && !error.code;
    return Response.json({ error: operationError ? error.message : "주문 상태를 다시 확인해 주세요." }, { status: operationError ? 409 : 503, headers });
  }
}
