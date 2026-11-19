import { getUser } from "../../../../lib/auth";
import { isVirtualDatabase } from "../../../../lib/database-mode";
import { validPaymentId } from "../../../../lib/payment-lifecycle";
import { verifyPayment } from "../../../../lib/payments";
import { hasSameOrigin } from "../../../../lib/request-origin";

export async function POST(request) {
  if (isVirtualDatabase()) return new Response(null, { status: 404 });
  if (!hasSameOrigin(request)) return new Response(null, { status: 403 });
  try {
    const user = await getUser();
    if (!user || user.guest) return Response.json({ error: "주문 계정으로 로그인해 주세요." }, { status: 401 });
    const { paymentId } = await request.json();
    if (!validPaymentId(paymentId)) return Response.json({ error: "잘못된 주문번호입니다." }, { status: 400 });
    const order = await verifyPayment(paymentId, { ownerId: user.id });
    if (!order) return Response.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
    return Response.json({ orderNumber: order.orderNumber, total: Number(order.total), status: order.status, paymentIssue: order.paymentIssue });
  } catch {
    return Response.json({ error: "결제사 상태를 확인하지 못했습니다. 잠시 후 다시 확인해 주세요." }, { status: 503 });
  }
}
