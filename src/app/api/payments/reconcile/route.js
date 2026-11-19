import { createHash, timingSafeEqual } from "node:crypto";
import { isVirtualDatabase } from "../../../../lib/database-mode";
import { settlementRetryDelay } from "../../../../lib/payment-lifecycle";
import { verifyPayment } from "../../../../lib/payments";
import { prisma } from "../../../../lib/prisma";

const hash = (value) => createHash("sha256").update(value).digest();

export async function POST(request) {
  const secret = process.env.PAYMENT_RECONCILE_SECRET;
  if (isVirtualDatabase() || !secret) return new Response(null, { status: 404 });
  if (!timingSafeEqual(hash(request.headers.get("authorization") || ""), hash(`Bearer ${secret}`))) {
    return new Response(null, { status: 401 });
  }
  const due = await prisma.order.findMany({
    where: { status: { in: ["PENDING", "REFUND_PENDING"] }, nextPaymentCheckAt: { lte: new Date() } },
    orderBy: [{ nextPaymentCheckAt: "asc" }, { id: "asc" }],
    take: 5,
    select: { id: true, orderNumber: true, nextPaymentCheckAt: true },
  });
  const results = await Promise.allSettled(due.map(async (order) => {
    try {
      return (await verifyPayment(order.orderNumber))?.status;
    } catch (error) {
      await prisma.order.updateMany({
        where: { id: order.id, nextPaymentCheckAt: order.nextPaymentCheckAt, status: { in: ["PENDING", "REFUND_PENDING"] } },
        data: { nextPaymentCheckAt: new Date(Date.now() + settlementRetryDelay) },
      });
      throw error;
    }
  }));
  const errors = results.filter(({ status }) => status === "rejected").length;
  const pending = results.filter((result) => result.status === "fulfilled" && ["PENDING", "REFUND_PENDING"].includes(result.value)).length;
  return Response.json({ checked: due.length, pending, errors }, { status: errors ? 503 : 200 });
}