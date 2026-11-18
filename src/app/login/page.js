"use client";

import { apiFetch, withBasePath } from "../../lib/client-api";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [guestEnabled, setGuestEnabled] = useState(true);

  async function submit(event, action) {
    event?.preventDefault();
    setBusy(true); setError("");
    try {
      const fields = event ? Object.fromEntries(new FormData(event.currentTarget)) : {};
      const response = await apiFetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, action, consent: fields.consent === "on" }) });
      const data = await response.json();
      if (!response.ok) { if (action === "guest") setGuestEnabled(false); throw new Error(data.error); }
      const next = new URLSearchParams(window.location.search).get("next") || "/";
      const target = new URL(next, window.location.origin);
      window.location.assign(target.origin === window.location.origin ? withBasePath(target.pathname + target.search + target.hash) : withBasePath("/"));
    } catch (e) { setError(e.message); setBusy(false); }
  }

  return <section className="auth-shell"><p className="eyebrow">WELCOME TO YOUR DAILY RITUAL</p><h1>{signup ? "마리엔비와 함께해요" : "다시 만나 반가워요"}</h1><p className="auth-description">장바구니와 가상 주문은 회원가입 없이 이용할 수 있어요.</p>
    <div className="auth-tabs"><button type="button" aria-pressed={!signup} onClick={() => { setSignup(false); setError(""); }}>로그인</button><button type="button" aria-pressed={signup} onClick={() => { setSignup(true); setError(""); }}>회원가입</button></div>
    {error && <p className="payment-alert" role="alert">{error}</p>}
    <form className="auth-form" onSubmit={(event) => submit(event, signup ? "signup" : "login")}>
      {signup && <label>이름<input name="name" autoComplete="name" maxLength={40} required /></label>}
      <label>이메일<input name="email" type="email" autoComplete="email" maxLength={200} required /></label>
      <label>비밀번호<input name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={8} maxLength={128} required /><small>8자 이상 입력해 주세요.</small></label>
      {signup && <label className="auth-agreement"><input name="consent" type="checkbox" required /> 시연용 계정의 이름·이메일 저장에 동의합니다. 실제 사용하는 비밀번호는 입력하지 마세요.</label>}
      <button className="button button-dark" disabled={busy}>{busy ? "처리 중…" : signup ? "가입하고 시작하기" : "로그인"}</button>
    </form>
    {guestEnabled && <button className="button auth-guest" type="button" disabled={busy} onClick={() => submit(null, "guest")}>회원가입 없이 게스트로 체험하기 →</button>}
    <p className="checkout-note">{process.env.NEXT_PUBLIC_PAGES_DEMO === "true" ? "이 브라우저에서만 사용하는 시연용 계정입니다. 실제 개인정보·비밀번호는 사용하지 마세요. 다른 기기와 계정·주문이 공유되지 않습니다." : "시연용 계정과 가상 주문입니다. 실제 결제는 발생하지 않습니다."}</p><Link className="text-link" href="/#products">상품 먼저 둘러보기</Link>
  </section>;
}
