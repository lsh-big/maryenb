export const reservationDuration = 15 * 60_000;
export const settlementRetryDelay = 5 * 60_000;
export const validPaymentId = (value) => typeof value === "string" && /^mb-[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(value);

export async function lockOrder(tx, paymentId) {
  await tx.$queryRaw`SELECT id FROM "Order" WHERE "orderNumber" = ${paymentId} FOR UPDATE`;
  return tx.order.findUnique({ where: { orderNumber: paymentId }, include: { items: true } });
}

export function validatePayment(order, payment, storeId) {
  if (!storeId || payment.id !== order.orderNumber || payment.storeId !== storeId
    || payment.currency !== "KRW" || payment.amount?.total !== Number(order.total)) {
    throw new Error("결제 정보가 주문과 일치하지 않습니다.");
  }
}

export async function settleOrder(tx, order, payment, now = new Date()) {
  const providerStatus = payment?.status;
  const paid = providerStatus === "PAID";
  const failed = providerStatus === "FAILED";
  const cancelled = providerStatus === "CANCELLED";
  const pending = order.status === "PENDING";
  const shipped = Boolean(order.shippedAt) || ["SHIPPED", "DELIVERED"].includes(order.status);
  const changes = {};

  if (paid && pending) {
    changes.status = "PAID";
    changes.paymentIssue = null;
  } else if (paid && ["CANCELLED", "REFUNDED"].includes(order.status)) {
    changes.status = "PAYMENT_REVIEW";
    changes.paymentIssue = "LATE_APPROVAL";
    if (!order.inventoryReleasedAt && !shipped) changes.inventoryReleasedAt = now;
  } else if (providerStatus === "PARTIAL_CANCELLED") {
    changes.paymentIssue = "PARTIAL_CANCELLED";
  } else if (cancelled || (failed && pending && !order.paymentIssue)) {
    if (order.paymentIssue) changes.paymentIssue = null;
    if (order.status !== "REFUNDED" && order.status !== "CANCELLED") {
      changes.status = pending && !payment.paidAt && !order.paymentIssue ? "CANCELLED" : "REFUNDED";
    }
    if (!order.inventoryReleasedAt && !shipped && !["CANCELLED", "REFUNDED"].includes(order.status)) {
      for (const item of [...order.items].sort((a, b) => a.productId - b.productId)) {
        if (item.productId != null) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        }
      }
      changes.inventoryReleasedAt = now;
    }
  }

  const status = changes.status ?? order.status;
  if (["PENDING", "REFUND_PENDING"].includes(status)) {
    const retry = new Date(now.getTime() + settlementRetryDelay);
    changes.nextPaymentCheckAt = status === "PENDING" && order.reservationExpiresAt > retry ? order.reservationExpiresAt : retry;
  } else if (order.nextPaymentCheckAt) {
    changes.nextPaymentCheckAt = null;
  }
  if (!Object.keys(changes).length) return order;
  return tx.order.update({ where: { id: order.id }, data: changes });
}
