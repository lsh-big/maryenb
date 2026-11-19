import { isVirtualDatabase } from "../../../../lib/database-mode";
import { validPaymentId } from "../../../../lib/payment-lifecycle";
import { verifyPayment } from "../../../../lib/payments";
import { verifiedWebhookId } from "../../../../lib/webhook-signature";

const events = new Set(["Transaction.Paid", "Transaction.Failed", "Transaction.Cancelled", "Transaction.PartialCancelled"]);

export async function POST(request) {
  if (isVirtualDatabase()) return new Response(null, { status: 404 });
  const secret = process.env.PORTONE_WEBHOOK_SECRET;
  if (!secret) return new Response(null, { status: 503 });
  const raw = Buffer.from(await request.arrayBuffer());
  const id = verifiedWebhookId(raw, request.headers, secret);
  if (!id) return new Response(null, { status: 401 });
  let event;
  try { event = JSON.parse(raw); }
  catch { return new Response(null, { status: 400 }); }
  if (!events.has(event?.type) || !validPaymentId(event?.data?.paymentId)) return new Response(null, { status: 200 });
  try {
    await verifyPayment(event.data.paymentId, { webhook: { id, type: event.type, storeId: event.data.storeId } });
    return new Response(null, { status: 200 });
  } catch {
    return new Response(null, { status: 503 });
  }
}