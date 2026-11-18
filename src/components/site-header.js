"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";
import { useAuth } from "./auth-provider";

export function SiteHeader() {
  const { itemCount } = useCart();
  const { user, loading, signOut } = useAuth();

  return (
    <header className="site-header">
      <div className="header-inner">
        <nav className="primary-nav" aria-label="주요 메뉴">
          <Link href="/#products">세럼</Link>
          <Link href="/#brand">브랜드</Link>
          <Link className="nav-guide" href="/#one-bottle">한 병 루틴</Link>
        </nav>
        <Link className="wordmark" href="/" aria-label="MaryenB 홈">
          <Image
            src="/images/logo/logo_2.png"
            alt="MaryenB"
            width={180}
            height={36}
            priority
          />
        </Link>
        <div className="header-account">
          {!loading && (user ? <div className="account-status"><span>{user.guest ? "게스트 체험 중" : `${user.name}님`}</span><button type="button" onClick={signOut}>로그아웃</button></div> : <Link className="login-link" href="/login">로그인 · 회원가입</Link>)}
        <Link className="cart-link" href="/cart" aria-label={`장바구니 ${itemCount}개`}>
          <ShoppingBag size={19} strokeWidth={1.6} />
          <span>장바구니</span>
          <span className="cart-count">{itemCount}</span>
        </Link>
        </div>
      </div>
    </header>
  );
}
