import { verifyPayment } from "../../../../lib/payments";

export async function POST(request) {
  try {
    const { paymentId } = await request.json();
    if (typeof paymentId !== "string" || !/^mb-[a-f0-9-]{36}$/.test(paymentId)) throw new Error("잘못된 주문번호입니다.");
    return Response.json(await verifyPayment(paymentId));
  } catch (error) {
    return Response.json({ error: error.code ? "결제 확인을 다시 시도해 주세요." : error.message }, { status: 400 });
  }
}
