"use client";

import { apiFetch } from "../../lib/client-api";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { useAuth } from "../../components/auth-provider";
import { useCart } from "../../components/cart-provider";
import { formatPrice } from "../../lib/products";

const exampleCustomer = {
  name: "예시 수령인",
  email: "demo@example.com",
  phone: "010-0000-0000",
  postalCode: "00000",
  address: "예시시 예시로 1",
  addressDetail: "시연용 주소",
};

export default function CheckoutPage() {
  return <Suspense fallback={<p role="status">주문서를 불러오고 있습니다.</p>}><Checkout /></Suspense>;
}

function Checkout() {
  const search = useSearchParams();
  const slug = search.get("buy");
  const rawQuantity = search.get("quantity");
  const quantity = /^[1-9][0-9]?$/.test(rawQuantity || "") ? Number(rawQuantity) : 0;
  const direct = slug !== null;
  const selectionKey = direct ? `${slug}:${rawQuantity}` : "";
  return <CheckoutForm key={selectionKey} slug={slug} quantity={quantity} direct={direct} />;
}

function CheckoutForm({ slug, quantity, direct }) {
  const cart = useCart();
  const [inventoryRevision, setInventoryRevision] = useState(0);
  const [selection, setSelection] = useState({ ready: !direct, item: null });
  const items = direct ? (selection.item ? [selection.item] : []) : cart.items;
  const subtotal = direct ? (selection.item ? selection.item.price * quantity : null) : cart.subtotal;
  const ready = direct ? selection.ready : cart.ready;
  const hasUnavailable = direct ? !selection.item : cart.hasUnavailable;
  const checkoutPath = direct ? `/checkout?${new URLSearchParams({ buy: slug, quantity: String(quantity) })}` : "/checkout";

  useEffect(() => {
    if (!direct) return;
    if (!/^[a-z0-9-]{1,100}$/.test(slug) || !quantity) {
      setSelection({ ready: true, item: null });
      return;
    }
    let active = true;
    apiFetch("/api/products", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : [])
      .then((products) => {
        const product = products.find((p) => p.slug === slug);
        const item = product && product.price > 0 && product.stock >= quantity && !product.koreaSalesNote
          ? { ...product, quantity } : null;
        if (active) setSelection({ ready: true, item });
      })
      .catch(() => { if (active) setSelection({ ready: true, item: null }); });
    return () => { active = false; };
  }, [direct, slug, quantity, inventoryRevision]);
  const { user, loading, startGuest } = useAuth();
  const formRef = useRef(null);
  const errorRef = useRef(null);
  const submitting = useRef(false);
  const [config, setConfig] = useState(null);
  const needsAccount = !user || (!config?.virtual && user.guest);
  const orderTotal = config?.shippingFee == null || subtotal == null ? null : subtotal + config.shippingFee;
  const [method, setMethod] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(null);
  const [pending, setPending] = useState("");
  const [sdkReady, setSdkReady] = useState(false);
  const pendingKey = `maryenb-pending:${checkoutPath}`;

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  function clearPending() {
    setPending("");
    try { sessionStorage.removeItem(pendingKey); } catch {}
    const url = new URL(window.location.href);
    if (url.searchParams.has("paymentId")) {
      for (const key of ["paymentId", "txId", "code", "message"]) url.searchParams.delete(key);
      window.history.replaceState(window.history.state, "", url);
    }
  }

  async function confirm(paymentId) {
    const response = await apiFetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId }) });
    const result = await response.json().catch(() => ({}));
    if (response.status === 404) clearPending();
    if (!response.ok) throw new Error(result.error || "주문 상태를 확인하지 못했습니다.");
    if (result.status === "PENDING") throw new Error("결제사 최종 상태를 기다리고 있습니다. 잠시 후 다시 확인해 주세요.");
    if (result.paymentIssue || ["PAYMENT_REVIEW", "REFUND_PENDING"].includes(result.status)) {
      throw new Error("주문 상태를 확인하고 있습니다. 주문·배송 조회에서 진행 상황을 확인해 주세요.");
    }
    clearPending();
    if (["PAID", "PREPARING", "SHIPPED", "DELIVERED"].includes(result.status)) {
      setPaid(result);
      if (!direct) cart.clearCart();
    } else {
      setInventoryRevision((revision) => revision + 1);
      if (!direct) cart.refreshInventory();
      setError(result.status === "REFUNDED" ? "환불이 확인되었습니다." : "결제가 종료되었습니다. 판매 가능한 수량을 다시 확인해 주세요.");
    }
  }

  useEffect(() => {
    apiFetch("/api/checkout").then((r) => { if (!r.ok) throw new Error(); return r.json(); }).then(setConfig).catch(() => setError("결제 설정을 불러오지 못했습니다. 새로고침해 주세요."));
    const params = new URLSearchParams(window.location.search);
    let id = params.get("paymentId");
    if (!id) {
      try { id = sessionStorage.getItem(pendingKey); } catch {}
    }
    if (id) {
      setPending(id);
      setBusy(true);
      // Confirmation always goes through the server, including mobile redirects.
      confirm(id).catch((e) => setError(e.message)).finally(() => setBusy(false));
    }
    // Run once for the provider redirect; cart state changes must not repeat verification.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (submitting.current || !config || pending || !ready || !user || (!config.virtual && user.guest) || hasUnavailable) return;
    submitting.current = true;
    setError(""); setBusy(true);
    try {
      const data = new FormData(event.currentTarget);
      const customer = Object.fromEntries(["name", "email", "phone", "postalCode", "address", "addressDetail"].map((key) => [key, data.get(key)]));
      let response;
      let payment;
      try {
        response = await apiFetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method, customer, consent: data.get("consent") === "on", items: items.map(({ slug, quantity }) => ({ slug, quantity })) }),
        });
        payment = await response.json();
      } catch {
        throw new Error("주문 서버 응답을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
      if (!response.ok) throw new Error(payment.error || "주문 처리에 실패했습니다.");
      if (payment.virtual) {
        setPaid(payment);
        if (!direct) cart.clearCart();
        return;
      }
      setPending(payment.paymentId);
      try { sessionStorage.setItem(pendingKey, payment.paymentId); } catch {}
      try {
        await window.PortOne.requestPayment({ ...payment, redirectUrl: new URL(checkoutPath, window.location.origin).href });
      } catch {
        // The authoritative lookup also runs when the payment window closes or the SDK rejects.
      }
      await confirm(payment.paymentId);
    } catch (e) { setError(e.message || "결제 중 문제가 발생했습니다."); }
    finally { submitting.current = false; setBusy(false); }
  }

  if (paid) return <section className="checkout-shell checkout-success"><h1>{paid.virtual ? "가상 주문 완료" : "주문 완료"}</h1><p>{paid.virtual ? "가상 주문이 완료되었습니다. 실제 결제나 배송은 진행되지 않습니다." : "결제가 완료되었습니다."}</p><p>주문번호: {paid.orderNumber}</p><strong>{formatPrice(paid.total)}원</strong><Link className="button button-dark" href="/orders">주문·배송 조회</Link><Link className="text-link" href="/">쇼핑 계속하기</Link></section>;

  return <section className="checkout-shell">
    {config && !config.virtual && config.methods.some((entry) => entry.enabled) && <Script src="https://cdn.portone.io/v2/browser-sdk.js" onReady={() => setSdkReady(true)} onError={() => setError("결제 모듈을 불러오지 못했습니다. 새로고침해 주세요.")} />}
    <h1>{config?.virtual ? "가상 주문서" : "주문 · 결제"}</h1>
    {direct && selection.item && <p className="checkout-direct-note">{selection.item.name} {quantity}개 바로 구매</p>}
    {config?.virtual && <p className="payment-alert">가상 구매 체험 모드입니다. 실제 결제·배송은 발생하지 않습니다. 배송정보에는 예시 값을 입력해 주세요.</p>}
    {error && <p className="payment-alert" role="alert" tabIndex={-1} ref={errorRef}>{error}</p>}
    {pending && <div className="payment-alert"><p>주문번호: {pending}</p><p>결제창을 닫았거나 확인이 지연되면 결제 상태를 다시 확인해 주세요. 중복 결제하지 마세요.</p><button className="button" type="button" disabled={busy} onClick={async () => { setBusy(true); try { await confirm(pending); } catch (e) { setError(e.message); } finally { setBusy(false); } }}>결제 상태 다시 확인</button></div>}
    {ready && config && items.length > 0 && <section className={`checkout-mobile-summary${needsAccount && !loading ? " checkout-entry-summary" : ""}`} aria-labelledby="checkout-mobile-summary-title">
      <h2 id="checkout-mobile-summary-title">주문 요약</h2>
      <ul>{items.map(({ slug, name, quantity }) => <li key={slug}><span>{name}</span><strong>{quantity}개</strong></li>)}</ul>
      <dl>
        <dt>{config.virtual ? "가상 주문 금액" : "결제 예정 금액"}</dt>
        <dd>{hasUnavailable ? "상품 확인 필요" : orderTotal == null ? "확인 중" : `${formatPrice(orderTotal)}원`}</dd>
      </dl>
    </section>}
    {!ready || loading || !config ? !error && <p role="status">주문서를 불러오고 있습니다.</p> : !items.length ? <div className="cart-empty"><p>{direct ? "선택한 상품의 판매 상태와 수량을 확인해 주세요." : "장바구니에 상품을 담아 주세요."}</p><Link className="button button-dark" href={direct && /^[a-z0-9-]{1,100}$/.test(slug) ? `/products/${slug}` : "/#products"}>{direct ? "상품 다시 선택하기" : "세럼 둘러보기"}</Link></div> : needsAccount ? (
      <div className="checkout-entry">
        <h2>{config.virtual ? "어떻게 주문할까요?" : "로그인 후 주문할 수 있어요"}</h2>
        {config.virtual && <button className="button button-dark" type="button" disabled={busy} onClick={async () => {
          setBusy(true); setError("");
          try { await startGuest(); } catch (e) { setError(e.message); } finally { setBusy(false); }
        }}>비회원 가상 주문</button>}
        <Link className={config.virtual ? "text-link" : "button button-dark"} href={`/login?next=${encodeURIComponent(checkoutPath)}`}>로그인하고 계속하기</Link>
        {!config.virtual && <p>로그인 후 같은 상품과 수량으로 주문을 계속할 수 있어요.</p>}
      </div>
    ) : <form ref={formRef} onSubmit={submit} className="checkout-layout">
      <div className="checkout-form"><h2>배송정보</h2>
        {config?.virtual && <button className="button demo-fill" type="button" onClick={() => {
          for (const [name, value] of Object.entries(exampleCustomer)) formRef.current.elements.namedItem(name).value = value;
        }}>예시 배송정보 채우기</button>}<div className="checkout-fields">
        {[['name','이름','text','name'],['email','이메일','email','email'],['phone','연락처','tel','tel'],['postalCode','우편번호','text','postal-code'],['address','주소','text','street-address'],['addressDetail','상세주소 (선택)','text','address-line2']].map(([name,label,type,autoComplete]) => <label key={name}>{label}<input name={name} type={type} autoComplete={config?.virtual ? "off" : autoComplete} required={name !== 'addressDetail'} maxLength={200} pattern={name === 'postalCode' ? '[0-9]{5}' : undefined} /></label>)}
      </div><h2>{config?.virtual ? "가상 결제수단" : "결제 방법"}</h2><div className="payment-methods">{config?.methods.map((entry) => <label className={`payment-method payment-${entry.id}${method === entry.id ? ' selected' : ''}`} key={entry.id}><input type="radio" name="paymentMethod" value={entry.id} checked={method === entry.id} onChange={() => setMethod(entry.id)} disabled={!entry.enabled || busy || Boolean(pending)} required /><strong>{entry.label}</strong><small>{config.virtual ? '가상 결제 체험' : entry.enabled ? '안전 결제' : '가맹점 연동 준비 중'}</small></label>)}</div>{config && !config.methods.some((m) => m.enabled) && <p className="payment-alert">결제 서비스 연동을 준비하고 있습니다. 지금은 결제 및 개인정보 전송이 진행되지 않습니다.</p>}
      <label className="checkout-consent"><input name="consent" type="checkbox" required /> 주문 상품·금액과 <Link href="/policies" target="_blank">판매 및 개인정보 안내</Link>를 확인하고 동의합니다.</label></div>
      <aside className="order-summary"><h2>{direct ? "바로 구매 상품" : "장바구니 주문"}</h2>{items.map((item) => <div key={item.id}><span>{item.name} × {item.quantity}</span><strong>{item.price == null ? "판매가 확인 중" : `${formatPrice(item.price * item.quantity)}원`}</strong></div>)}<div><span>상품 금액</span><span>{subtotal == null ? "확인 중" : `${formatPrice(subtotal)}원`}</span></div><div><span>배송비</span><span>{config?.shippingFee == null ? '설정 확인 중' : `${formatPrice(config.shippingFee)}원`}</span></div><Link className="text-link" href="/policies#delivery">발송·교환·반품 안내</Link><div className="summary-total"><strong>{config?.virtual ? "가상 주문 금액" : "최종 결제 금액"}</strong><strong>{orderTotal == null ? "확인 중" : `${formatPrice(orderTotal)}원`}</strong></div><button className="button button-dark checkout-button" disabled={busy || hasUnavailable || !user || config?.shippingFee == null || (!config.virtual && !sdkReady) || !method || Boolean(pending)}>{busy ? '주문 처리 중…' : config?.virtual ? '가상 주문 완료하기' : '안전하게 결제하기'}</button>{hasUnavailable && <p role="status">구매할 수 없는 상품 또는 재고를 초과한 수량이 있습니다. <Link href="/cart">장바구니에서 확인</Link></p>}<p className="checkout-note">{config?.virtual ? "예시 배송정보는 저장하지 않습니다." : "최종 금액은 서버에서 확정되며 결제정보는 결제사 창에서 입력합니다."}</p></aside>
    </form>}
  </section>;
}
