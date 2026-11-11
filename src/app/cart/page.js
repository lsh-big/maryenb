"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { ProductArt } from "../../components/product-art";
import { useCart } from "../../components/cart-provider";
import { formatPrice } from "../../lib/products";

export default function CartPage() {
  const { items, subtotal, removeItem } = useCart();

  return (
    <section className="cart-shell">
      <p className="eyebrow">YOUR SHOPPING BAG</p>
      <h1>장바구니</h1>
      {items.length === 0 ? (
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
                  <span>{item.quantity}개</span>
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
            <div><span>배송비</span><span>판매 조건 확정 후 안내</span></div>
            <div className="summary-total">
              <strong>총 결제 금액</strong>
              <strong>판매가 확인 중</strong>
            </div>
            <button className="button button-dark checkout-button" type="button" disabled>
              판매 준비 중
            </button>
            <p className="checkout-note">
              국내 판매 가격과 판매 조건이 확정되면 주문 기능을 안내합니다.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
