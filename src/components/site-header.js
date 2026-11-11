"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <header className="site-header">
      <div className="header-inner">
        <nav className="primary-nav" aria-label="주요 메뉴">
          <Link href="/#products">SHOP</Link>
          <Link href="/#brand">BRAND</Link>
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
        <Link className="cart-link" href="/cart" aria-label={`장바구니 ${itemCount}개`}>
          <ShoppingBag size={19} strokeWidth={1.6} />
          <span>장바구니</span>
          <span className="cart-count">{itemCount}</span>
        </Link>
      </div>
    </header>
  );
}
