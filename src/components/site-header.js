"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";
import { useAuth } from "./auth-provider";

export function SiteHeader() {
  const { itemCount } = useCart();
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const headerRef = useRef(null);
  const [hideOnScroll, setHideOnScroll] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 760px)");
    let lastY = window.scrollY;

    function updateOnScroll() {
      const y = Math.max(0, window.scrollY);
      if (y <= (headerRef.current?.offsetHeight || 98)) {
        lastY = y;
        setHideOnScroll(false);
        return;
      }
      const movement = y - lastY;
      if (Math.abs(movement) < 8) return;
      lastY = y;
      setHideOnScroll(movement > 0);
    }

    function syncViewport() {
      lastY = window.scrollY;
      setHideOnScroll(false);
      window.removeEventListener("scroll", updateOnScroll);
      if (mobile.matches) window.addEventListener("scroll", updateOnScroll, { passive: true });
    }

    syncViewport();
    mobile.addEventListener("change", syncViewport);
    return () => {
      window.removeEventListener("scroll", updateOnScroll);
      mobile.removeEventListener("change", syncViewport);
    };
  }, [pathname]);

  return (
    <header ref={headerRef} className="site-header" data-scroll-hidden={hideOnScroll ? "" : undefined}>
      <div className="header-inner">
        <nav className="primary-nav" aria-label="주요 메뉴">
          <Link href="/#products">국내 판매 세럼</Link>
          <Link href="/#brand">브랜드</Link>
          <Link className="nav-guide" href="/#one-bottle">내 세럼 찾기</Link>
          <Link className="support-nav-link" href="/support">고객지원</Link>
          <Link className="orders-link-mobile" href="/orders">주문조회</Link>
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
        <Link className="orders-link-desktop" href="/orders">주문·배송 조회</Link>
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
