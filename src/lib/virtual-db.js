import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import catalog from "../data/products.json";
import { optionName, withDemoInventory } from "./product-market";
import { linePrice, MAX_ORDER_QUANTITY } from "./product-price";
import { validPaymentId } from "./payment-lifecycle";

const directory = path.resolve(process.env.DEMO_DATA_DIRECTORY || ".data");
const filename = path.join(directory, "virtual-db.json");
const state = globalThis.__maryenbVirtualDatabase ??= { queue: Promise.resolve() };

async function read() {
  try {
    const database = JSON.parse(await readFile(filename, "utf8"));
    return { ...database, products: withDemoInventory(catalog, database.products) };
  }
  catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { products: withDemoInventory(catalog), orders: [] };
  }
}

export async function getVirtualProducts() {
  await state.queue;
  return (await read()).products;
}

export async function getVirtualOrders(userId) {
  await state.queue;
  return (await read()).orders.filter((order) => order.userId === userId).slice(-50).reverse();
}

export function validVirtualOrderNumber(number) {
  return typeof number === "string" && number.startsWith("demo-") && validPaymentId(`mb-${number.slice(5)}`);
}

export async function getVirtualManagedOrders(number, limit) {
  await state.queue;
  const { orders } = await read();
  return orders.filter((order) => !number || order.orderNumber === number).reverse().slice(0, limit).map((order) => ({
    orderNumber: order.orderNumber, status: "SIMULATED", createdAt: new Date(order.createdAt), total: order.total,
    subtotal: order.total - (order.shippingFee ?? 0), shippingFee: order.shippingFee ?? 0,
    items: order.items.map(({ name, quantity }) => ({ productName: name, quantity })),
  }));
}

export async function createVirtualOrder(items, method, userId) {
  const task = state.queue.then(async () => {
    const database = await read();
    const lines = items.map((item) => {
      const product = database.products.find((p) => p.slug === item.slug && p.isActive);
      if (!product || product.koreaSalesNote || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_ORDER_QUANTITY || product.stock < item.quantity) throw new Error("상품 재고 또는 수량을 확인해 주세요.");
      const total = linePrice(product, item.quantity);
      if (total == null) throw new Error("선택한 수량의 판매가를 확인해 주세요.");
      return { slug: product.slug, name: optionName(product), quantity: item.quantity, price: product.price, lineTotal: total };
    });
    for (const item of lines) database.products.find((p) => p.slug === item.slug).stock -= item.quantity;
    const total = lines.reduce((sum, item) => sum + item.lineTotal, 0);
    const order = { virtual: true, orderNumber: `demo-${randomUUID()}`, status: "SIMULATED", userId, method, total, shippingFee: 0, items: lines, createdAt: new Date().toISOString() };
    // Demo orders intentionally omit names, phone numbers and delivery addresses.
    database.orders.push(order);
    await mkdir(directory, { recursive: true });
    const temporary = `${filename}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(database, null, 2), "utf8");
    await rename(temporary, filename);
    return order;
  });
  state.queue = task.catch(() => {});
  return task;
}
