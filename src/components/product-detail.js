"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-provider";
import { formatPrice } from "../lib/products";
import { ProductArt } from "./product-art";
import { QuantitySelector } from "./quantity-selector";
import { apiFetch } from "../lib/client-api";
import { ProductAdvantage } from "./product-advantage";

export function ProductDetail({ product: initialProduct }) {
  const [localProduct, setLocalProduct] = useState(null);
  const product = { ...initialProduct, ...localProduct };
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PAGES_DEMO !== "true") return;
    apiFetch("/api/products").then((r) => r.json()).then((products) => setLocalProduct(products.find((p) => p.slug === initialProduct.slug) || { stock: 0, price: null, purchaseUnavailable: true })).catch(() => {});
  }, [initialProduct.slug]);
  const { addItem, items, ready } = useCart();
  const router = useRouter();
  const inCart = items.find((item) => item.slug === product.slug)?.quantity || 0;
  const maxQuantity = Math.min(product.stock, 99);
  const available = product.stock > 0 && Number.isFinite(product.price) && product.price > 0 && !product.koreaSalesNote && !product.purchaseUnavailable;
  const canBuy = available;
  const buyLabel = product.stock < 1 ? "품절" : !available ? "구매 준비 중" : "바로 구매하기";
  function buyNow() {
    const selection = new URLSearchParams({ buy: product.slug, quantity: String(selectedQuantity) });
    router.push(`/checkout?${selection}`);
  }
  const [quantity, setQuantity] = useState(1);
  const selectedQuantity = Math.max(1, Math.min(quantity, maxQuantity));
  const canAdd = ready && available && inCart + selectedQuantity <= maxQuantity;
  const guide = product.guide;
  const [added, setAdded] = useState(false);
  const gallery = product.galleryUrls?.length
    ? product.galleryUrls
    : [product.imageUrl].filter(Boolean);
  const [activeImage, setActiveImage] = useState(gallery[0]);

  return (
    <section className="detail-shell" style={{ "--product-accent": guide?.accent, "--product-wash": guide?.wash }}>
      <Link className="back-link" href="/#products">
        <ArrowLeft size={15} /> 제품 목록
      </Link>
      <div className="detail-layout">
        <div className="detail-gallery">
          <div className="detail-image-stage">
            <ProductArt
              imageUrl={activeImage}
              category={product.category}
              code={product.code}
              alt={`${product.name} 제품 사진`}
              className="detail-art"
            />
          </div>
          {gallery.length > 1 && (
            <div className="detail-thumbnails" aria-label="제품 사진 선택">
              {gallery.map((image, index) => (
                <button
                  className={`detail-thumbnail${activeImage === image ? " is-active" : ""}`}
                  key={image}
                  type="button"
                  aria-label={`${product.name} 사진 ${index + 1}`}
                  aria-pressed={activeImage === image}
                  onClick={() => setActiveImage(image)}
                >
                  <ProductArt
                    imageUrl={image}
                    category={product.category}
                    code={product.code}
                    alt=""
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            <span className={`ingredient-swatch swatch-${product.code.toLowerCase()}`} />
            {product.code} · {product.category}
          </p>
          <h1>{product.name}</h1>
          {guide && <p className="detail-headline">{guide.focus}</p>}
          <p className="detail-volume">{product.volume} · {product.stock < 1 ? "품절" : available ? "재고 있음" : "구매 준비 중"}</p>
          <div className="detail-price">
            <strong>
              {product.price === null
                ? formatPrice(product.price)
                : `${formatPrice(product.price)}원`}
            </strong>
            {product.compareAtPrice && (
              <del>{formatPrice(product.compareAtPrice)}원</del>
            )}
          </div>
          <a className="text-link" href="#detail-delivery" onClick={() => { document.getElementById("detail-delivery").open = true; }}>배송비·교환·반품 안내</a>
          <div className="detail-quantity"><div><span>구매 수량</span><small>{inCart > 0 ? `장바구니에 ${inCart}개 담겨 있어요` : `최대 ${Math.min(product.stock, 99)}개 선택 가능`}</small></div><QuantitySelector value={selectedQuantity} onChange={(value) => { setQuantity(value); setAdded(false); }} max={maxQuantity} disabled={!canBuy} label={`${product.name} 수량`} /></div>
          <div className="detail-selected-total" aria-live="polite"><span>선택 상품 금액 · {selectedQuantity}개</span><strong>{product.price === null ? "판매가 확인 중" : `${formatPrice(product.price * selectedQuantity)}원`}</strong></div>
          <div className="detail-actions">
            <button className="button detail-add" type="button" disabled={!canAdd} onClick={() => { if (addItem(product, selectedQuantity)) setAdded(true); }}>
              <ShoppingBag size={17} /> 장바구니 담기
            </button>
            <button className="button button-dark detail-add" type="button" disabled={!canBuy} onClick={buyNow}>{buyLabel}</button>
          </div>
          {ready && available && !canAdd && <p className="stock-note">선택 수량을 더하면 장바구니에 담을 수 있는 재고를 초과합니다.</p>}
          {added && <p className="stock-note" role="status">장바구니에 담았습니다. <Link href="/cart">장바구니 보기 →</Link></p>}
        </div>
      </div>
      <section className="product-faq">
        <h2>제품과 주문 안내</h2>
        <p className="detail-description">{guide?.summary || product.description}</p>
        {guide && <div className="formula-highlights" aria-label="공식 안내 기준 주요 배합">{guide.points.map(([amount, ingredient]) => <div key={ingredient}><strong>{amount}</strong><span>{ingredient}</span></div>)}</div>}
        <details><summary>전성분 및 라벨 표기</summary>
          <h3>제공 라벨의 주요 성분과 함량</h3>
          <p>{product.ingredients}</p>
          {guide?.fullIngredients && <>
            <h3>공식 제품 페이지의 전성분</h3>
            <p>{guide.fullIngredients}</p>
            <a className="text-link" href={guide.ingredientsSource} target="_blank" rel="noreferrer">공식 전성분 원문 ↗</a>
          </>}
          <p>구매 전 실제 제품 포장의 최신 표시를 확인해 주세요.</p>
          {guide?.labelNote && <p>{guide.labelNote}</p>}
        </details>
        {guide && <details><summary>사용법·주의사항</summary>
          <dl className="routine-facts">
            <div><dt>사용 시간</dt><dd>{guide.timing}</dd></div>
            <div><dt>시작 빈도</dt><dd>{guide.frequency}</dd></div>
            <div><dt>사용 순서</dt><dd>세안 → 세럼 → 보습제{product.code !== "RNT" && " → 낮에는 자외선 차단제"}</dd></div>
          </dl>
          <p>{guide.tip}</p><p>{guide.caution}</p>
          <a className="text-link" href={guide.source} target="_blank" rel="noreferrer">공식 사용 안내 ↗</a>
        </details>}
        <details id="detail-delivery">
          <summary>배송·교환·반품</summary>
          <p>배송비는 주문서에서 확인할 수 있습니다. 가상 주문에서는 배송이 진행되지 않으며 실제 판매 조건은 확정 후 안내됩니다.</p>
          <Link className="text-link" href="/policies#delivery">발송·반품 안내 확인 →</Link>
        </details>
        {guide && <details><summary>{guide.faq[0]}</summary><p>{guide.faq[1]}</p></details>}
      </section>
      <ProductAdvantage code={product.code} />
      <div className="detail-guide-navigation"><Link className="text-link" href="/#compare">6종 성분·사용법 비교하기 →</Link><Link className="text-link" href="/#routine">처음 시작하는 루틴 보기 →</Link></div>
      <div className="mobile-buy">
        <div><span>{product.price == null ? "판매가 확인 중" : `${selectedQuantity}개 상품 금액`}</span><strong>{product.price == null ? "가격 미정" : `${formatPrice(product.price * selectedQuantity)}원`}</strong></div>
        <button className="button button-dark" type="button" disabled={!canBuy} onClick={buyNow}>{buyLabel}</button>
      </div>
    </section>
  );
}
