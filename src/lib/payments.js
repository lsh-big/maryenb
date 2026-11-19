import { prisma } from "./prisma";
import { catalogConfirmed, configuredShippingFee } from "./sales-config";
import { lockOrder, settleOrder, validatePayment } from "./payment-lifecycle";

export const paymentMethods = {
  naver: { label: "네이버페이", env: "PORTONE_NAVER_CHANNEL_KEY", payMethod: "EASY_PAY", provider: "NAVERPAY" },
  kakao: { label: "카카오페이", env: "PORTONE_KAKAO_CHANNEL_KEY", payMethod: "EASY_PAY", provider: "KAKAOPAY" },
  toss: { label: "토스페이", env: "PORTONE_TOSS_CHANNEL_KEY", payMethod: "EASY_PAY", provider: "TOSSPAY" },
  inicis: { label: "KG이니시스 · 카드", env: "PORTONE_INICIS_CHANNEL_KEY", payMethod: "CARD" },
};

export function paymentReady(method) {
  return Boolean(process.env.CHECKOUT_ENABLED === "true" && catalogConfirmed()
    && process.env.SALES_POLICIES_PUBLISHED === "true" && process.env.DATABASE_URL
    && process.env.PORTONE_STORE_ID && process.env.PORTONE_API_SECRET && process.env.PORTONE_WEBHOOK_SECRET
    && process.env.PAYMENT_RECONCILE_SECRET && process.env[paymentMethods[method]?.env] && configuredShippingFee() !== null);
}

function paymentUrl(id) {
  return `https://api.portone.io/payments/${encodeURIComponent(id)}`;
}

export async function lookupPayment(order) {
  const storeId = order.storeId || process.env.PORTONE_STORE_ID;
  if (!process.env.PORTONE_API_SECRET || !storeId) throw new Error("결제 조회 설정을 확인해 주세요.");
  const query = new URLSearchParams({ storeId });
  const response = await fetch(`${paymentUrl(order.orderNumber)}?${query}`, {
    headers: { Authorization: `PortOne ${process.env.PORTONE_API_SECRET}` },
    cache: "no-store", signal: AbortSignal.timeout(8_000),
  });
  if (response.status === 404 && (await response.json()).type === "PAYMENT_NOT_FOUND") return null;
  if (!response.ok) throw new Error("결제 조회에 실패했습니다. 잠시 후 다시 확인해 주세요.");
  const payment = await response.json();
  validatePayment(order, payment, storeId);
  return payment;
}

export async function verifyPayment(paymentId, { ownerId, webhook } = {}) {
  return prisma.$transaction(async (tx) => {
    const order = await lockOrder(tx, paymentId);
    if (!order || (ownerId && order.ownerId !== ownerId)) return null;
    if (webhook) {
      if (webhook.storeId !== (order.storeId || process.env.PORTONE_STORE_ID)) return null;
      const event = await tx.paymentWebhookEvent.createMany({
        data: [{ id: webhook.id, type: webhook.type, paymentId }], skipDuplicates: true,
      });
      if (!event.count) return order;
    }

    const payment = await lookupPayment(order);
    if (webhook && (!payment || ["READY", "PENDING", "PAY_PENDING"].includes(payment.status))) {
      // Keep the event retryable while the transaction is not yet visible in the API.
      throw new Error("결제사 상태 확인 대기 중");
    }
    return settleOrder(tx, order, payment);
  }, { maxWait: 5_000, timeout: 12_000 });
}

export async function requestFullCancellation(order) {
  const response = await fetch(`${paymentUrl(order.orderNumber)}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `"refund-${order.orderNumber}"`,
    },
    body: JSON.stringify({ storeId: order.storeId || process.env.PORTONE_STORE_ID, reason: "판매자 전액 취소" }),
    signal: AbortSignal.timeout(65_000),
  });
  if (!response.ok) throw new Error("결제사 취소 결과를 확인해 주세요.");
}
