"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/client-api";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { ProductArt } from "../../components/product-art";
import { useCart } from "../../components/cart-provider";
import { formatPrice } from "../../lib/products";
import { QuantitySelector } from "../../components/quantity-selector";

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity, ready, hasUnavailable } = useCart();

  const [shippingFee, setShippingFee] = useState(null);
  useEffect(() => {
    apiFetch("/api/checkout").then((response) => response.ok ? response.json() : {}).then((settings) => setShippingFee(settings.shippingFee ?? null)).catch(() => {});
  }, []);

  return (
    <section className="cart-shell">
      <h1>장바구니</h1>
      {!ready ? <p role="status">장바구니를 확인하고 있습니다.</p> : items.length === 0 ? (
        <div className="cart-empty">
          <p>장바구니가 비어 있어요.</p>
          <span>마리엔비의 데일리 케어를 만나보세요.</span>
          <Link className="button button-dark" href="/#products">
            제품 둘러보기
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <Link
                  className="cart-item-art"
                  href={`/products/${item.slug}`}
                  aria-label={`${item.name} 상세 보기`}
                >
                  <ProductArt imageUrl={item.imageUrl} category="MARYENB" />
                </Link>
                <div className="cart-item-info">
                  <Link href={`/products/${item.slug}`}>{item.name}</Link>
                  <span>
                    {item.price === null
                      ? "판매가 확인 중"
                      : `${formatPrice(item.price)}원`}
                  </span>
                  {item.stock === 0 ? <span>품절</span> : item.quantity > item.stock ? <span>재고 {item.stock}개 · 수량을 줄여 주세요</span> : null}
                  <QuantitySelector value={item.quantity} onChange={(value) => updateQuantity(item.id, value)} disabled={item.stock === 0 || item.unavailable} max={item.stock ?? 99} label={`${item.name} 수량`} />
                </div>
                <div className="cart-item-total">
                  <strong>
                    {item.price === null
                      ? "판매가 확인 중"
                      : `${formatPrice(item.price * item.quantity)}원`}
                  </strong>
                  <button
                    className="remove-item"
                    type="button"
                    aria-label={`${item.name} 삭제`}
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <aside className="order-summary">
            <h2>주문 요약</h2>
            <div>
              <span>상품 금액</span>
              <span>{subtotal === null ? "판매가 확인 중" : `${formatPrice(subtotal)}원`}</span>
            </div>
            <div><span>배송비</span><span>{shippingFee === null ? "주문서에서 확인" : `${formatPrice(shippingFee)}원`}</span></div>
            <div className="summary-total">
              <strong>총 결제 금액</strong>
              <strong>{subtotal == null || shippingFee == null ? "주문서에서 확인" : `${formatPrice(subtotal + shippingFee)}원`}</strong>
            </div>
            {hasUnavailable ? <p role="status">상품의 재고와 수량을 확인해 주세요.</p> : <Link className="button button-dark checkout-button" href="/checkout">주문서 작성하기</Link>}
            <p className="checkout-note">네이버페이 · 카카오페이 · 토스페이 · KG이니시스<br />최종 금액과 재고는 결제 전에 다시 확인합니다.</p>
          </aside>
        </div>
      )}
    </section>
  );
}
