import { verifyPayment } from "../../../../lib/payments";

export async function POST(request) {
  try {
    const body = await request.json();
    const id = body.data?.paymentId;
    if (typeof id !== "string" || !/^mb-[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 400 });
    // Never trust webhook status/amount; fetch the authoritative transaction using the secret.
    if (body.type === "Transaction.Paid") await verifyPayment(id);
    return new Response(null, { status: 200 });
  } catch {
    return new Response(null, { status: 503 });
  }
}
