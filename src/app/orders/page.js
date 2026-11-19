"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/client-api";
import { formatPrice } from "../../lib/products";

const labels = {
  SIMULATED: "가상 주문 완료", PENDING: "결제 확인 중", PAID: "결제 완료", PREPARING: "발송 준비 중",
  SHIPPED: "발송 완료", DELIVERED: "배송 완료", CANCELLED: "주문 종료", REFUNDED: "환불 완료",
  PAYMENT_REVIEW: "결제 확인 필요", REFUND_PENDING: "환불 확인 중",
};

async function readOrders(path) {
  const response = await apiFetch(path, { cache: "no-store" });
  if (response.status === 401) return { loginRequired: true };
  if (!response.ok) throw new Error("주문 내역을 불러오지 못했습니다.");
  return response.json();
}

export default function OrdersPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [manage, setManage] = useState(false);
  const [number, setNumber] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    readOrders("/api/orders").then(setData).catch((failure) => setError(failure.message));
  }, []);

  const path = number ? `/api/orders/manage?number=${encodeURIComponent(number)}` : "/api/orders/manage";

  async function load(nextPath, nextManage = manage) {
    setBusy(true);
    setError("");
    try {
      const result = await readOrders(nextPath);
      setData(result);
      setManage(nextManage);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  async function operate(event, order) {
    event.preventDefault();
    const action = event.nativeEvent.submitter?.value;
    if (!action || busy) return;
    if (action === "refund" && !window.confirm("발송 전 주문을 전액 취소할까요?")) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const response = await apiFetch("/api/orders/manage", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: order.orderNumber, action, carrier: fields.get("carrier"), trackingNumber: fields.get("trackingNumber") }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "주문 처리를 확인해 주세요.");
      setData(await readOrders(path));
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  async function checkCustomerPayment(order) {
    setBusy(true);
    setError("");
    try {
      const response = await apiFetch("/api/payments/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: order.orderNumber }),
      });
      if (!response.ok) throw new Error("결제사 상태를 확인하지 못했습니다. 잠시 후 다시 확인해 주세요.");
      setData(await readOrders("/api/orders"));
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="checkout-shell order-history">
    <h1>{manage ? "판매자 주문 관리" : "주문·배송 조회"}</h1>
    {error && <p className="payment-alert" role="alert">{error}</p>}
    {data?.loginRequired && <Link className="button button-dark" href="/login?next=%2Forders">로그인 후 주문 조회</Link>}
    {data?.canManage && <button className="button button-dark" type="button" disabled={busy} onClick={() => load(path, true)}>판매자 주문 관리</button>}
    {manage && <form className="order-search" onSubmit={(event) => { event.preventDefault(); load(path); }}>
      <label>주문번호 <input value={number} onChange={(event) => setNumber(event.target.value.trim())} /></label>
      <button className="button" disabled={busy}>조회</button>
      <button className="button" type="button" disabled={busy} onClick={() => { setNumber(""); load("/api/orders/manage"); }}>최근 주문</button>
      <button className="button" type="button" disabled={busy} onClick={() => load("/api/orders", false)}>내 주문</button>
    </form>}
    {!data && !error && <p role="status">주문 내역을 불러오고 있습니다.</p>}
    {data?.orders?.length === 0 && <p>조회할 주문이 없습니다.</p>}
    {data?.orders?.map((order) => {
      const canShip = ["PAID", "PREPARING"].includes(order.status) && !order.paymentIssue;
      return <article className="order-history-card" key={order.orderNumber}>
        <h2>{order.paymentIssue ? "결제 확인 필요" : labels[order.status] || order.status}</h2>
        <p>{new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: "Asia/Seoul" }).format(new Date(order.createdAt))} · {order.orderNumber}</p>
        <ul>{order.items.map((item, index) => <li key={index}>{item.name} × {item.quantity}</li>)}</ul>
        <strong>{formatPrice(order.total)}원</strong>
        {order.carrier && <p>택배사 {order.carrier} · 송장번호 {order.trackingNumber}</p>}
        {order.recipientName && <p>{order.recipientName} · {order.phone}<br />{order.deliveryAddress}</p>}
        {!manage && ["PENDING", "REFUND_PENDING"].includes(order.status) && <div className="order-actions">
          <button className="button" type="button" disabled={busy} onClick={() => checkCustomerPayment(order)}>결제 상태 다시 확인</button>
        </div>}
        {manage && <form className="order-actions" onSubmit={(event) => operate(event, order)}>
          {canShip && <div className="order-search">
            <label>택배사 <input name="carrier" maxLength={40} /></label>
            <label>송장번호 <input name="trackingNumber" maxLength={40} /></label>
            <button className="button button-dark" value="ship" disabled={busy}>송장 등록 및 발송 처리</button>
          </div>}
          <button className="button" value="check" disabled={busy}>결제사 상태 확인</button>
          {canShip && order.status === "PAID" && <button className="button" value="prepare" disabled={busy}>발송 준비</button>}
          {order.status === "SHIPPED" && <button className="button" value="delivered" disabled={busy}>배송 완료 처리</button>}
          {(canShip || ["PAYMENT_REVIEW", "REFUND_PENDING"].includes(order.status)) && <button className="button" value="refund" disabled={busy}>발송 전 전액 취소</button>}
        </form>}
      </article>;
    })}
  </section>;
}
