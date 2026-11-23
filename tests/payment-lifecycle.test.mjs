import assert from "node:assert/strict";
import catalog from "../src/data/products.json" with { type: "json" };
import { familyCode, overseasOnly, sizeLabel, withDemoInventory } from "../src/lib/product-market.js";
import { extraUnitPrice, linePrice, MAX_ORDER_QUANTITY } from "../src/lib/product-price.js";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { settleOrder, validatePayment } from "../src/lib/payment-lifecycle.js";
import { verifiedWebhookId } from "../src/lib/webhook-signature.js";
import { hasSameOrigin } from "../src/lib/request-origin.js";
import { configuredShippingFee, publicStoreProduct } from "../src/lib/sales-config.js";

const now = new Date("2026-11-19T01:00:00Z");

function reservation(overrides = {}) {
  let stock = 7;
  let order = {
    id: 1, orderNumber: "mb-test", total: 15700, status: "PENDING",
    reservationExpiresAt: now, items: [{ productId: 3, quantity: 2 }], ...overrides,
  };
  const tx = {
    order: { update: async ({ data }) => (order = { ...order, ...data }) },
    product: { update: async ({ data }) => { stock += data.stock.increment; } },
  };
  return {
    apply: (status, extra) => settleOrder(tx, order, status && { status, ...extra }, now),
    stock: () => stock,
  };
}

test("verified failures release the reservation once across repeated checks", async () => {
  const attempt = reservation();
  const result = await attempt.apply("FAILED");
  assert.equal(result.status, "CANCELLED");
  assert.deepEqual(result.inventoryReleasedAt, now);
  await attempt.apply("FAILED");
  await attempt.apply("CANCELLED");
  assert.equal(attempt.stock(), 9);
});

test("no provider record and nonterminal statuses hold inventory after reservation deadline", async () => {
  const attempt = reservation();
  for (const providerStatus of [null, "READY", "PENDING", "PAY_PENDING", "VIRTUAL_ACCOUNT_ISSUED"]) {
    const result = await attempt.apply(providerStatus);
    assert.equal(result.status, "PENDING");
    assert.ok(result.nextPaymentCheckAt > now);
    assert.equal(attempt.stock(), 7);
  }
});

test("approval wins over a later failure lookup and repeats leave stock reserved", async () => {
  const attempt = reservation();
  assert.equal((await attempt.apply("PAID")).status, "PAID");
  assert.equal((await attempt.apply("FAILED")).status, "PAID");
  assert.equal((await attempt.apply("PAID")).status, "PAID");
  assert.equal(attempt.stock(), 7);
});

test("late approval enters operator review and its refund never restores stock twice", async () => {
  const attempt = reservation();
  await attempt.apply("FAILED");
  const late = await attempt.apply("PAID");
  assert.equal(late.status, "PAYMENT_REVIEW");
  assert.equal(late.paymentIssue, "LATE_APPROVAL");
  assert.equal((await attempt.apply("CANCELLED")).status, "REFUNDED");
  assert.equal(attempt.stock(), 9);
});

test("full refund restores an unshipped reservation only", async () => {
  const unshipped = reservation({ status: "REFUND_PENDING" });
  const shipped = reservation({ status: "SHIPPED", shippedAt: now });
  assert.equal((await unshipped.apply("CANCELLED")).status, "REFUNDED");
  assert.equal((await shipped.apply("CANCELLED")).status, "REFUNDED");
  assert.equal(unshipped.stock(), 9);
  assert.equal(shipped.stock(), 7);
});

test("partial cancellation goes to review without restoring stock", async () => {
  const attempt = reservation({ status: "PAID" });
  assert.equal((await attempt.apply("PARTIAL_CANCELLED")).paymentIssue, "PARTIAL_CANCELLED");
  assert.equal(attempt.stock(), 7);
});

test("payment lookup requires order ID, amount, currency and store to match", () => {
  const order = { orderNumber: "mb-test", total: 15700 };
  const valid = { id: "mb-test", amount: { total: 15700 }, currency: "KRW", storeId: "store-fixture" };
  assert.doesNotThrow(() => validatePayment(order, valid, "store-fixture"));
  for (const mismatch of [{ id: "other" }, { amount: { total: 1 } }, { currency: "USD" }, { storeId: "other" }]) {
    assert.throws(() => validatePayment(order, { ...valid, ...mismatch }, "store-fixture"));
  }
});

test("webhook verifies the exact bytes, a valid versioned signature and the timestamp", () => {
  const id = "fixture-event";
  const timestamp = Math.floor(now.getTime() / 1000);
  const raw = Buffer.from('{"message":"결제"}');
  const key = Buffer.from("maryenb-test-webhook-key");
  const signature = createHmac("sha256", key).update(`${id}.${timestamp}.`).update(raw).digest("base64");
  const headers = new Headers({ "webhook-id": id, "webhook-timestamp": String(timestamp), "webhook-signature": `v2,ignored v1,${signature}` });
  const secret = `whsec_${key.toString("base64")}`;
  assert.equal(verifiedWebhookId(raw, headers, secret, now.getTime()), id);
  assert.equal(verifiedWebhookId(Buffer.concat([raw, Buffer.from(" ")]), headers, secret, now.getTime()), null);
  assert.equal(verifiedWebhookId(raw, headers, secret, now.getTime() + 301_000), null);
  headers.delete("webhook-signature");
  assert.equal(verifiedWebhookId(raw, headers, secret, now.getTime()), null);
});

test("same-origin checkout accepts the browser host when Next normalizes the request URL", (context) => {
  const configured = process.env.SHOP_ORIGIN;
  delete process.env.SHOP_ORIGIN;
  context.after(() => {
    if (configured !== undefined) process.env.SHOP_ORIGIN = configured;
  });
  const request = (origin) => new Request("http://localhost:3167/api/checkout", {
    headers: { host: "127.0.0.1:3167", origin },
  });
  assert.equal(hasSameOrigin(request("http://127.0.0.1:3167")), true);
  assert.equal(hasSameOrigin(request("http://localhost:3167")), false);
  assert.equal(hasSameOrigin(request("http://127.0.0.1:3000")), false);
});

test("unconfirmed sale prices and stock are suppressed and explicit free shipping is recognized", (context) => {
  const configuration = { SALES_CATALOG_CONFIRMED: process.env.SALES_CATALOG_CONFIRMED, SHIPPING_FEE: process.env.SHIPPING_FEE };
  context.after(() => {
    for (const [name, value] of Object.entries(configuration)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });
  const product = { code: "RNT", price: 15700, compareAtPrice: 17000, stock: 100 };
  process.env.SALES_CATALOG_CONFIRMED = "false";
  assert.deepEqual(publicStoreProduct(product), { code: "RNT", price: null, compareAtPrice: null, stock: 0, purchaseUnavailable: true });
  process.env.SALES_CATALOG_CONFIRMED = "true";
  assert.equal(publicStoreProduct(product), product);
  const overseas = publicStoreProduct({ ...product, code: "ANC5" });
  assert.equal(overseas.price, null);
  assert.equal(overseas.stock, 0);
  assert.match(overseas.koreaSalesNote, /해외 전용/);
  delete process.env.SHIPPING_FEE;
  assert.equal(configuredShippingFee(), null);
  process.env.SHIPPING_FEE = "0";
  assert.equal(configuredShippingFee(), 0);
});

test("legacy demo inventory preserves domestic stock and adopts the current market and sizes", () => {
  const inventory = withDemoInventory(catalog, [
    { slug: "anc5-azelaic-acid-serum", price: 15700, stock: 99 },
    { slug: "rnt-retinol-serum", stock: 97 },
  ]);
  assert.deepEqual(inventory.filter(overseasOnly).map(({ code }) => code).sort(), ["ANC10", "ANC5", "VNC15"]);
  assert.ok(inventory.filter(overseasOnly).every(({ price, stock, koreaSalesNote }) => price === null && stock === 0 && koreaSalesNote));
  for (const code of ["RNT", "TNA5", "NTZ20"]) {
    const sizes = inventory.filter((product) => familyCode(product.code) === code);
    assert.deepEqual(sizes.map(sizeLabel), ["30ml", "60ml"]);
    assert.notEqual(sizes[0].slug, sizes[1].slug);
  }
  assert.equal(inventory.find(({ code }) => code === "RNT").stock, 97);
  const rnt60 = inventory.find(({ code }) => code === "RNT-60ML");
  assert.equal(withDemoInventory([rnt60], [{ ...rnt60, price: null, stock: 0 }])[0].stock, 100);
});

test("each domestic size keeps the bundle totals and charges the same amount for each bottle above three", () => {
  const expected = {
    RNT: [13200, 25740, 37120], "RNT-60ML": [16530, 32190, 46300],
    TNA5: [15120, 29480, 42520], "TNA5-60ML": [18330, 35690, 51340],
    NTZ20: [14460, 28200, 40680], "NTZ20-60ML": [17700, 34450, 49560],
  };
  for (const [code, amounts] of Object.entries(expected)) {
    const product = catalog.find((item) => item.code === code);
    assert.deepEqual([1, 2, 3].map((quantity) => linePrice(product, quantity)), amounts);
    assert.equal(product.price, amounts[0]);
    const additional = Math.round(amounts[2] / 3);
    assert.equal(extraUnitPrice(product), additional);
    assert.equal(linePrice(product, 4), amounts[2] + additional);
    assert.equal(linePrice(product, 5), amounts[2] + 2 * additional);
    assert.equal(linePrice(product, MAX_ORDER_QUANTITY), amounts[2] + 96 * additional);
    assert.equal(linePrice(product, MAX_ORDER_QUANTITY + 1), null);
  }
  assert.equal(linePrice({ price: 14000, bundlePrices: [] }, 2), 28000);
  assert.equal(linePrice({ price: 14000, bundlePrices: [] }, 4), 56000);
});
