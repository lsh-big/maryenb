"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/client-api";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { ProductArt } from "../../components/product-art";
import { useCart } from "../../components/cart-provider";
import { formatPrice } from "../../lib/products";
import { optionName } from "../../lib/product-market";
import { linePrice, MAX_ORDER_QUANTITY } from "../../lib/product-price";
import { QuantitySelector } from "../../components/quantity-selector";
import { useAuth } from "../../components/auth-provider";

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity, ready, hasUnavailable } = useCart();
  const { user, loading } = useAuth();

  const [checkout, setCheckout] = useState(null);
  useEffect(() => {
    apiFetch("/api/checkout").then((response) => response.ok ? response.json() : null).then(setCheckout).catch(() => {});
  }, []);
  const shippingFee = checkout?.shippingFee ?? null;
  const paymentLabels = checkout?.methods.filter(({ enabled }) => enabled).map(({ label }) => label).join(" · ");
  const needsLogin = checkout && !checkout.virtual && !loading && (!user || user.guest);

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
                  aria-label={`${optionName(item)} 상세 보기`}
                >
                  <ProductArt imageUrl={item.imageUrl} category="MARYENB" />
                </Link>
                <div className="cart-item-info">
                  <Link href={`/products/${item.slug}`}>{optionName(item)}</Link>
                  <span>
                    {item.salesNote || (item.price === null
                      ? "판매가 확인 중"
                      : `${formatPrice(item.price)}원`)}
                  </span>
                  {!item.unavailable && (item.stock === 0 ? <span>품절</span> : item.quantity > Math.min(item.stock, MAX_ORDER_QUANTITY) ? <span>최대 {Math.min(item.stock, MAX_ORDER_QUANTITY)}개까지 선택할 수 있어요.</span> : null)}
                  <QuantitySelector value={item.quantity} onChange={(value) => updateQuantity(item.id, value)} disabled={item.stock === 0 || item.unavailable} max={item.stock} label={`${optionName(item)} 수량`} />
                </div>
                <div className="cart-item-total">
                  <strong>
                    {item.unavailable ? "구매 불가" : linePrice(item, item.quantity) == null
                      ? "금액 확인 필요"
                      : `${formatPrice(linePrice(item, item.quantity))}원`}
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
              <strong>{checkout?.virtual ? "가상 주문 금액" : "총 결제 금액"}</strong>
              <strong>{subtotal == null || shippingFee == null ? "주문서에서 확인" : `${formatPrice(subtotal + shippingFee)}원`}</strong>
            </div>
            {hasUnavailable ? <p role="status">구매할 수 없는 상품을 삭제하거나 재고에 맞춰 수량을 조정해 주세요.</p> : <Link className="button button-dark checkout-button" href="/checkout">주문서 작성하기</Link>}
            {(checkout?.virtual || needsLogin) && <p className="checkout-note">{checkout.virtual ? "로그인 없이 가상 주문을 체험할 수 있어요." : "로그인 후 장바구니 상품으로 주문을 계속할 수 있어요."}</p>}
            {checkout && !checkout.virtual && paymentLabels && <p className="checkout-note">{paymentLabels}</p>}
            <Link className="text-link" href="/policies#delivery">배송·교환·반품 정책</Link>
          </aside>
        </div>
      )}
    </section>
  );
}
