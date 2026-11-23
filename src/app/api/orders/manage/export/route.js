import { getUser } from "../../../../../lib/auth";
import { isVirtualDatabase } from "../../../../../lib/database-mode";
import { isOrderOperator } from "../../../../../lib/order-operations";
import { createOrderWorkbook } from "../../../../../lib/order-workbook";
import { validPaymentId } from "../../../../../lib/payment-lifecycle";
import { prisma } from "../../../../../lib/prisma";
import { isLocalDemoAdmin } from "../../../../../lib/local-demo-admin";
import { getVirtualManagedOrders, validVirtualOrderNumber } from "../../../../../lib/virtual-db";

const headers = { "Cache-Control": "private, no-store" };
const batchSize = 500;
const exportFields = {
  id: true, orderNumber: true, createdAt: true, status: true, paymentIssue: true,
  subtotal: true, shippingFee: true, total: true, carrier: true, trackingNumber: true, shippedAt: true,
  items: { orderBy: { id: "asc" }, select: { productName: true, quantity: true } },
};

async function readRealOrders(number) {
  const orders = [];
  let beforeId;
  for (;;) {
    const batch = await prisma.order.findMany({
      where: { ...(number && { orderNumber: number }), ...(beforeId && { id: { lt: beforeId } }) },
      select: exportFields, orderBy: { id: "desc" }, take: batchSize,
    });
    orders.push(...batch);
    if (batch.length < batchSize) return orders;
    beforeId = batch.at(-1).id;
  }
}

export async function GET(request) {
  const virtual = isVirtualDatabase();
  const user = await getUser();
  if (virtual ? !isLocalDemoAdmin(request, user) : !isOrderOperator(user)) return new Response(null, { status: 404, headers });
  const number = new URL(request.url).searchParams.get("number");
  if (number && !(virtual ? validVirtualOrderNumber(number) : validPaymentId(number))) return Response.json({ error: "주문번호를 확인해 주세요." }, { status: 400, headers });
  try {
    const orders = virtual ? await getVirtualManagedOrders(number) : await readRealOrders(number);
    const workbook = await createOrderWorkbook(orders);
    const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
    const filename = `maryenb-orders-${number || date}.xlsx`;
    return new Response(workbook, {
      headers: {
        ...headers, "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`, "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json({ error: "주문 내역을 엑셀로 내려받지 못했습니다." }, { status: 503, headers });
  }
}
