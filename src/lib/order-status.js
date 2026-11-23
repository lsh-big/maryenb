const labels = {
  SIMULATED: "가상 주문 완료", PENDING: "결제 확인 중", PAID: "결제 완료", PREPARING: "발송 준비 중",
  SHIPPED: "발송 완료", DELIVERED: "배송 완료", CANCELLED: "주문 종료", REFUNDED: "환불 완료",
  PAYMENT_REVIEW: "결제 확인 필요", REFUND_PENDING: "환불 확인 중",
};

export function orderStatusLabel(order) {
  return order.paymentIssue ? labels.PAYMENT_REVIEW : labels[order.status] ?? order.status;
}
