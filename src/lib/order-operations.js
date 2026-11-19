import { prisma } from "./prisma";
import { lockOrder } from "./payment-lifecycle";
import { requestFullCancellation, verifyPayment } from "./payments";

export function isOrderOperator(user) {
  return Boolean(user && !user.guest && (process.env.ORDER_OPERATOR_IDS || "").split(",").map((id) => id.trim()).includes(user.id));
}

export function orderForCustomer(order) {
  return {
    orderNumber: order.orderNumber, status: order.status, paymentIssue: order.paymentIssue,
    createdAt: order.createdAt, total: Number(order.total), carrier: order.carrier,
    trackingNumber: order.trackingNumber, shippedAt: order.shippedAt,
    items: order.items.map((item) => ({ name: item.productName, quantity: item.quantity })),
  };
}

export async function manageOrder(paymentId, operatorId, action, shipment) {
  if (action === "check") {
    const order = await verifyPayment(paymentId);
    if (order) await prisma.orderOperation.create({ data: { orderId: order.id, operatorId, action } });
    return order;
  }
  if (action === "refund") {
    const order = await verifyPayment(paymentId);
    if (!order || order.status === "REFUNDED") return order;
  }
  if (action === "ship" && !(await verifyPayment(paymentId))) return null;

  const order = await prisma.$transaction(async (tx) => {
    const current = await lockOrder(tx, paymentId);
    if (!current) return null;
    const sellableOrder = ["PAID", "PREPARING"].includes(current.status) && !current.paymentIssue;
    let data;
    if (action === "prepare" && current.status === "PAID" && sellableOrder) {
      data = { status: "PREPARING" };
    } else if (action === "ship" && sellableOrder) {
      data = { ...shipment, shippedAt: new Date(), status: "SHIPPED" };
    } else if (action === "delivered" && current.status === "SHIPPED") {
      data = { status: "DELIVERED" };
    } else if (action === "refund" && !current.shippedAt && (
      sellableOrder || ["PAYMENT_REVIEW", "REFUND_PENDING"].includes(current.status)
    )) {
      const now = new Date();
      const requestedAt = current.refundRequestedAt || now;
      if (current.paymentIssue === "PARTIAL_CANCELLED" || now - requestedAt >= 170 * 60_000) {
        throw new Error("포트원 콘솔에서 취소 요청을 대조한 후 주문 상태를 다시 확인해 주세요.");
      }
      data = { status: "REFUND_PENDING", refundRequestedAt: requestedAt, nextPaymentCheckAt: now };
    } else {
      throw new Error("현재 상태에서는 이 작업을 진행할 수 없습니다.");
    }
    await tx.orderOperation.create({ data: { orderId: current.id, operatorId, action } });
    return tx.order.update({ where: { id: current.id }, data });
  });

  if (action !== "refund" || !order) return order;
  try {
    await requestFullCancellation(order);
  } catch {
    const latest = await verifyPayment(paymentId).catch(() => null);
    if (latest?.status === "REFUNDED") return latest;
    throw new Error("환불 결과 확인이 필요합니다. 상태를 다시 조회해 주세요.");
  }
  return verifyPayment(paymentId);
}
