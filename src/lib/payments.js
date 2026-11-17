import { prisma } from "./prisma";
import { isVirtualDatabase } from "./database-mode";

export const paymentMethods = {
  naver: { label: "네이버페이", env: "PORTONE_NAVER_CHANNEL_KEY", payMethod: "EASY_PAY", provider: "NAVERPAY" },
  kakao: { label: "카카오페이", env: "PORTONE_KAKAO_CHANNEL_KEY", payMethod: "EASY_PAY", provider: "KAKAOPAY" },
  toss: { label: "토스페이", env: "PORTONE_TOSS_CHANNEL_KEY", payMethod: "EASY_PAY", provider: "TOSSPAY" },
  inicis: { label: "KG이니시스 · 카드", env: "PORTONE_INICIS_CHANNEL_KEY", payMethod: "CARD" },
};

export function paymentReady(method) {
  return Boolean(process.env.CHECKOUT_ENABLED === "true" && process.env.DATABASE_URL && process.env.PORTONE_STORE_ID && process.env.PORTONE_API_SECRET && process.env[paymentMethods[method]?.env] && /^\d+$/.test(process.env.SHIPPING_FEE || ""));
}

// This endpoint is also called by the webhook: a browser redirect is never proof of payment.
export async function verifyPayment(paymentId) {
  if (isVirtualDatabase()) throw new Error("가상 주문은 실제 결제 승인 조회를 사용하지 않습니다.");
  const order = await prisma.order.findUnique({ where: { orderNumber: paymentId } });
  if (!order) throw new Error("주문을 찾을 수 없습니다.");
  const response = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `PortOne ${process.env.PORTONE_API_SECRET}` }, cache: "no-store",
  });
  if (!response.ok) throw new Error("결제 조회에 실패했습니다. 잠시 후 다시 확인해 주세요.");
  const payment = await response.json();
  if (payment.status !== "PAID") throw new Error("결제가 완료되지 않았습니다.");
  if (payment.amount?.total !== Number(order.total) || payment.currency !== "KRW" || payment.storeId !== process.env.PORTONE_STORE_ID) throw new Error("결제 정보가 주문과 일치하지 않습니다.");
  await prisma.order.updateMany({ where: { id: order.id, status: "PENDING" }, data: { status: "PAID" } });
  return { orderNumber: order.orderNumber, total: Number(order.total), status: "PAID" };
}
