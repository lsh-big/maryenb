"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Script from "next/script";
import { useCart } from "../../components/cart-provider";
import { formatPrice } from "../../lib/products";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [config, setConfig] = useState(null);
  const [method, setMethod] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(null);
  const [pending, setPending] = useState("");
  const [sdkReady, setSdkReady] = useState(false);

  async function confirm(paymentId) {
    const response = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    setPaid(result);
    setPending("");
    clearCart();
  }

  useEffect(() => {
    fetch("/api/checkout").then((r) => r.json()).then(setConfig).catch(() => setError("결제 설정을 불러오지 못했습니다. 새로고침해 주세요."));
    const params = new URLSearchParams(window.location.search);
    const id = params.get("paymentId");
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
    setError(""); setBusy(true);
    try {
      const data = new FormData(event.currentTarget);
      const customer = Object.fromEntries(["name", "email", "phone", "postalCode", "address", "addressDetail"].map((key) => [key, data.get(key)]));
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ method, customer, consent: data.get("consent") === "on", items: items.map(({ slug, quantity }) => ({ slug, quantity })) }) });
      const payment = await response.json();
      if (!response.ok) throw new Error(payment.error);
      if (payment.virtual) {
        setPaid(payment);
        clearCart();
        return;
      }
      setPending(payment.paymentId);
      const result = await window.PortOne.requestPayment({ ...payment, redirectUrl: `${window.location.origin}/checkout` });
      if (result?.code) throw new Error(result.message || "결제가 취소되었습니다.");
      await confirm(payment.paymentId);
    } catch (e) { setError(e.message || "결제 중 문제가 발생했습니다."); }
    finally { setBusy(false); }
  }

  if (paid) return <section className="checkout-shell checkout-success"><p className="eyebrow">THANK YOU FOR YOUR ORDER</p><h1>당신의 루틴에 함께할게요.</h1><p>{paid.virtual ? "가상 주문이 완료되었습니다. 실제 결제나 배송은 진행되지 않습니다." : "결제가 완료되었습니다."}</p><p>주문번호: {paid.orderNumber}</p><strong>{formatPrice(paid.total)}원</strong><Link className="button button-dark" href="/">쇼핑 계속하기</Link></section>;

  return <section className="checkout-shell">
    {config && !config.virtual && <Script src="https://cdn.portone.io/v2/browser-sdk.js" onReady={() => setSdkReady(true)} onError={() => setError("결제 모듈을 불러오지 못했습니다. 새로고침해 주세요.")} />}
    <p className="eyebrow">YOUR NEXT DAILY RITUAL</p><h1>주문 · 결제</h1><p className="checkout-intro">나를 위한 작은 선물, 마지막 한 단계만 남았어요.</p>
    {config?.virtual && <p className="payment-alert">가상 구매 체험 모드입니다. 실제 결제·배송은 발생하지 않습니다. 배송정보에는 예시 값을 입력해 주세요.</p>}
    {error && <p className="payment-alert" role="alert">{error}</p>}
    {pending && <div className="payment-alert"><p>주문번호: {pending}</p><p>결제창을 닫았거나 확인이 지연되면 결제 상태를 다시 확인해 주세요. 중복 결제하지 마세요.</p><button className="button" type="button" disabled={busy} onClick={async () => { setBusy(true); try { await confirm(pending); } catch (e) { setError(e.message); } finally { setBusy(false); } }}>결제 상태 다시 확인</button></div>}
    {!items.length ? <div className="cart-empty"><p>장바구니에 상품을 담아 주세요.</p><Link className="button button-dark" href="/#products">세럼 둘러보기</Link></div> : <form onSubmit={submit} className="checkout-layout">
      <div className="checkout-form"><h2><span>01</span> 받으실 분</h2><div className="checkout-fields">
        {[['name','이름','text','name'],['email','이메일','email','email'],['phone','연락처','tel','tel'],['postalCode','우편번호','text','postal-code'],['address','주소','text','street-address'],['addressDetail','상세주소 (선택)','text','address-line2']].map(([name,label,type,autoComplete]) => <label key={name}>{label}<input name={name} type={type} autoComplete={autoComplete} required={name !== 'addressDetail'} maxLength={200} pattern={name === 'postalCode' ? '[0-9]{5}' : undefined} /></label>)}
      </div><h2><span>02</span> 결제 방법</h2><div className="payment-methods">{config?.methods.map((entry) => <label className={`payment-method payment-${entry.id}${method === entry.id ? ' selected' : ''}`} key={entry.id}><input type="radio" name="paymentMethod" value={entry.id} checked={method === entry.id} onChange={() => setMethod(entry.id)} disabled={!entry.enabled || busy || Boolean(pending)} required /><strong>{entry.label}</strong><small>{config.virtual ? '가상 결제 체험' : entry.enabled ? '안전 결제' : '가맹점 연동 준비 중'}</small></label>)}</div>{config && !config.methods.some((m) => m.enabled) && <p className="payment-alert">결제 서비스 연동을 준비하고 있습니다. 지금은 결제 및 개인정보 전송이 진행되지 않습니다.</p>}
      <label className="checkout-consent"><input name="consent" type="checkbox" required /> 주문 상품·금액과 <Link href="/policies" target="_blank">판매 및 개인정보 안내</Link>를 확인하고 동의합니다.</label></div>
      <aside className="order-summary"><h2>나의 주문</h2>{items.map((item) => <div key={item.id}><span>{item.name} × {item.quantity}</span><strong>{formatPrice(item.price * item.quantity)}원</strong></div>)}<div><span>상품 금액</span><span>{formatPrice(subtotal)}원</span></div><div><span>배송비</span><span>{config?.shippingFee == null ? '설정 확인 중' : `${formatPrice(config.shippingFee)}원`}</span></div><div className="summary-total"><strong>예상 결제 금액</strong><strong>{config?.shippingFee == null ? '확인 중' : `${formatPrice(subtotal + config.shippingFee)}원`}</strong></div><button className="button button-dark checkout-button" disabled={busy || (!config?.virtual && !sdkReady) || !method || Boolean(pending)}>{busy ? '주문 처리 중…' : config?.virtual ? '가상 주문 완료하기' : '안전하게 결제하기'}</button><p className="checkout-note">{config?.virtual ? "가상 DB에 주문과 재고를 저장합니다. 결제사로 정보가 전송되지 않습니다." : "최종 금액은 서버에서 확정되며 결제정보는 결제사 창에서 입력합니다."}</p></aside>
    </form>}
  </section>;
}
