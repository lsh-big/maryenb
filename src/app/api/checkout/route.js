import { randomUUID } from "node:crypto";
import { prisma } from "../../../lib/prisma";
import { paymentMethods, paymentReady } from "../../../lib/payments";
import { reservationDuration } from "../../../lib/payment-lifecycle";
import { configuredShippingFee } from "../../../lib/sales-config";
import { isVirtualDatabase } from "../../../lib/database-mode";
import { createVirtualOrder } from "../../../lib/virtual-db";
import { getUser } from "../../../lib/auth";
import { hasSameOrigin } from "../../../lib/request-origin";

export async function GET() {
  if (isVirtualDatabase()) return Response.json({ virtual: true, methods: Object.entries(paymentMethods).map(([id, method]) => ({ id, label: method.label, enabled: true })), shippingFee: 0 });
  return Response.json({ methods: Object.entries(paymentMethods).map(([id, method]) => ({ id, label: method.label, enabled: paymentReady(id) })), shippingFee: configuredShippingFee() });
}

export async function POST(request) {
  if (!hasSameOrigin(request)) return Response.json({ error: "잘못된 요청입니다." }, { status: 403 });
  try {
    const user = await getUser();
    if (!user || (user.guest && !isVirtualDatabase())) return Response.json({ error: "로그인 또는 게스트 입장 후 주문해 주세요." }, { status: 401 });
    const body = await request.json();
    const { method, customer, items, consent } = body;
    if (!Object.hasOwn(paymentMethods, method)) throw new Error("결제수단을 선택해 주세요.");
    if (!isVirtualDatabase() && !paymentReady(method)) return Response.json({ error: "이 결제수단은 가맹점 설정 후 이용할 수 있습니다." }, { status: 503 });
    if (!consent || !customer || !Array.isArray(items) || !items.length || items.length > 30) throw new Error("주문 정보를 확인해 주세요.");
    for (const key of ["name", "email", "phone", "postalCode", "address"]) {
      if (typeof customer[key] !== "string" || !customer[key].trim() || customer[key].length > 200) throw new Error("배송 정보를 확인해 주세요.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) || !/^\d{5}$/.test(customer.postalCode) || !/^[\d+() -]{9,20}$/.test(customer.phone)) throw new Error("이메일, 전화번호, 우편번호를 확인해 주세요.");
    if (customer.addressDetail && (typeof customer.addressDetail !== "string" || customer.addressDetail.length > 200)) throw new Error("상세주소를 확인해 주세요.");
    const seen = new Set();
    for (const item of items) {
      if (typeof item.slug !== "string" || !/^[a-z0-9-]{1,100}$/.test(item.slug) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 || seen.has(item.slug)) throw new Error("상품 수량을 확인해 주세요.");
      seen.add(item.slug);
    }
    if (isVirtualDatabase()) return Response.json(await createVirtualOrder(items, method, user.id));
    const shippingFee = configuredShippingFee();
    const storeId = process.env.PORTONE_STORE_ID;
    const expiresAt = new Date(Date.now() + reservationDuration);
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { slug: { in: [...seen] }, isActive: true } });
      const lines = [];
      if (products.length !== items.length) throw new Error("구매할 수 없는 상품이 있습니다.");
      for (const product of products.sort((a, b) => a.id - b.id)) {
        const item = items.find(({ slug }) => slug === product.slug);
        if (!product || product.price === null || Number(product.price) < 1 || product.koreaSalesNote) throw new Error("구매할 수 없는 상품이 있습니다.");
        const reserved = await tx.product.updateMany({ where: { id: product.id, isActive: true, price: product.price, koreaSalesNote: null, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
        if (!reserved.count) throw new Error(`${product.name}: 재고가 부족합니다.`);
        lines.push({ productId: product.id, productName: product.name, unitPrice: product.price, quantity: item.quantity });
      }
      const subtotal = lines.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
      return tx.order.create({ data: { orderNumber: `mb-${randomUUID()}`, ownerId: user.id, storeId,
        reservationExpiresAt: expiresAt, nextPaymentCheckAt: expiresAt, customerEmail: customer.email, recipientName: customer.name,
        phone: customer.phone, postalCode: customer.postalCode, address: customer.address, addressDetail: customer.addressDetail || "",
        subtotal, shippingFee, total: subtotal + shippingFee, items: { create: lines } } });
    });
    const config = paymentMethods[method];
    return Response.json({ storeId: process.env.PORTONE_STORE_ID, channelKey: process.env[config.env], paymentId: order.orderNumber, orderName: "MaryenB 세럼 주문", totalAmount: Number(order.total), currency: "KRW", payMethod: config.payMethod, ...(config.provider ? { easyPay: { easyPayProvider: config.provider } } : {}), customer: { fullName: customer.name, email: customer.email, phoneNumber: customer.phone } });
  } catch (error) {
    const inputError = error?.constructor === Error && !error.code;
    return Response.json({ error: inputError ? error.message : "주문 저장에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: inputError ? 400 : 503 });
  }
}
