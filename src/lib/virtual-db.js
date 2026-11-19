import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import catalog from "../data/products.json";

const directory = path.resolve(process.env.DEMO_DATA_DIRECTORY || ".data");
const filename = path.join(directory, "virtual-db.json");
const state = globalThis.__maryenbVirtualDatabase ??= { queue: Promise.resolve() };

async function read() {
  try { return JSON.parse(await readFile(filename, "utf8")); }
  catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { products: catalog.map((p) => ({ ...p, id: p.slug, stock: 100 })), orders: [] };
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

export async function createVirtualOrder(items, method, userId) {
  const task = state.queue.then(async () => {
    const database = await read();
    const lines = items.map((item) => {
      const product = database.products.find((p) => p.slug === item.slug && p.isActive);
      if (!product || product.koreaSalesNote || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 || product.stock < item.quantity) throw new Error("상품 재고 또는 수량을 확인해 주세요.");
      if (!Number.isFinite(product.price) || product.price <= 0) throw new Error("판매가를 확인해 주세요.");
      return { slug: product.slug, name: product.name, quantity: item.quantity, price: product.price };
    });
    for (const item of lines) database.products.find((p) => p.slug === item.slug).stock -= item.quantity;
    const total = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
