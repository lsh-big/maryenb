import { getUser } from "../../../lib/auth";
import { isVirtualDatabase } from "../../../lib/database-mode";
import { isOrderOperator, orderForCustomer } from "../../../lib/order-operations";
import { prisma } from "../../../lib/prisma";
import { getVirtualOrders } from "../../../lib/virtual-db";
import { isLocalDemoAdmin } from "../../../lib/local-demo-admin";

export async function GET(request) {
  const headers = { "Cache-Control": "private, no-store" };
  const user = await getUser();
  if (!user) return Response.json({ error: "주문 계정으로 로그인해 주세요." }, { status: 401, headers });
  if (isVirtualDatabase()) return Response.json({
    orders: await getVirtualOrders(user.id), canManage: isLocalDemoAdmin(request, user),
  }, { headers });
  if (user.guest) return Response.json({ error: "주문 계정으로 로그인해 주세요." }, { status: 401, headers });
  const orders = await prisma.order.findMany({
    where: { ownerId: user.id }, orderBy: { createdAt: "desc" }, take: 50, include: { items: true },
  });
  return Response.json({ orders: orders.map(orderForCustomer), canManage: isOrderOperator(user) }, { headers });
}
