"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-provider";
import { formatPrice } from "../lib/products";
import { ProductArt } from "./product-art";
import { QuantitySelector } from "./quantity-selector";
import { SkinComparison } from "./skin-comparison";
import { apiFetch } from "../lib/client-api";

export function ProductDetail({ product: initialProduct }) {
  const [localProduct, setLocalProduct] = useState(null);
  const product = { ...initialProduct, ...localProduct };
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PAGES_DEMO !== "true") return;
    apiFetch("/api/products").then((r) => r.json()).then((products) => setLocalProduct(products.find((p) => p.slug === initialProduct.slug))).catch(() => {});
  }, [initialProduct.slug]);
  const { addItem, items } = useCart();
  const router = useRouter();
  const inCart = items.find((item) => item.id === product.id)?.quantity || 0;
  const maxQuantity = Math.max(0, Math.min(product.stock, 99) - inCart);
  const canBuy = maxQuantity > 0 && product.price !== null;
  const [quantity, setQuantity] = useState(1);
  const selectedQuantity = Math.max(1, Math.min(quantity, maxQuantity));
  const guide = product.guide;
  const [added, setAdded] = useState(false);
  const leadIngredient = product.ingredients.split(" · ")[0];
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
            <span className="detail-image-index">
              {String(gallery.indexOf(activeImage) + 1).padStart(2, "0")} /{" "}
              {String(gallery.length).padStart(2, "0")}
            </span>
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
          <p className="detail-tagline">{product.tagline}</p>
          {guide && <><h2 className="detail-headline">{guide.headline}</h2><div className="product-tags">{guide.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></>}
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
          <p className="detail-volume">용량 · {product.volume}</p>
          <p className="detail-description">{guide?.summary || product.description}</p>
          {guide && <div className="formula-highlights" aria-label="공식 안내 기준 주요 배합">{guide.points.map(([amount, ingredient]) => <div key={ingredient}><strong>{amount}</strong><span>{ingredient}</span></div>)}</div>}
          <div className="detail-ingredients">
            <span className="ingredient-overline">LABEL SPOTLIGHT</span>
            <strong>{leadIngredient}</strong>
            <p className="ingredient-fact">제품 라벨에 표시된 성분 및 함량입니다.</p>
            <div className="detail-ingredients-divider" />
            <strong>라벨에 표시된 성분과 함량</strong>
            <p>{product.ingredients}</p>
          </div>
          <div className="detail-quantity"><div><span>구매 수량</span><small>{inCart > 0 ? `장바구니에 ${inCart}개 담겨 있어요` : `최대 ${Math.min(product.stock, 99)}개 선택 가능`}</small></div><QuantitySelector value={selectedQuantity} onChange={(value) => { setQuantity(value); setAdded(false); }} max={maxQuantity} disabled={!canBuy} label={`${product.name} 수량`} /></div>
          <div className="detail-selected-total" aria-live="polite"><span>선택 상품 금액 · {selectedQuantity}개</span><strong>{product.price === null ? "판매가 확인 중" : `${formatPrice(product.price * selectedQuantity)}원`}</strong></div>
          <button className="button button-dark detail-add" type="button"
            disabled={!canBuy}
            onClick={() => { if (addItem(product, selectedQuantity)) setAdded(true); }}>
            <ShoppingBag size={17} /> {canBuy ? "장바구니 담기" : product.price === null ? "판매가 확인 중" : product.stock > 0 ? "구매 가능 수량을 모두 담았어요" : "품절"}
          </button>
          <button className="button button-dark detail-add" type="button" disabled={!canBuy} onClick={() => { if (addItem(product, selectedQuantity)) router.push("/checkout"); }}>바로 구매하기</button>
          {added && <p className="stock-note" role="status">장바구니에 담았습니다. <Link href="/cart">장바구니 보기 →</Link></p>}
          <p className="stock-note">
            {product.stock > 0 ? "재고 있음 · 이 사이트에서 주문하세요." : "품절 · 재입고 준비 중"}
            {product.price === null && " 판매가 등록 후 구매할 수 있습니다."}
          </p>
          {guide?.labelNote && <p className="label-difference">{guide.labelNote}</p>}
        </div>
      </div>
      {guide && <>
        <SkinComparison code={product.code} guide={guide} />
        <section className="detail-guide-section"><div><p className="eyebrow">A ROUTINE THAT FITS YOU</p><h2>이 한 병, 이렇게 시작해요</h2><p className="guide-intro">새 세럼은 한 번에 하나씩. 피부가 편안한지 살피며 시작하세요.</p></div><dl className="routine-facts"><div><dt>사용 시간</dt><dd>{guide.timing}</dd></div><div><dt>시작 빈도</dt><dd>{guide.frequency}</dd></div><div><dt>사용감 안내</dt><dd>{guide.texture}</dd></div></dl><div className="detail-guide-tip"><h3>나의 루틴에 더하기</h3><p>{guide.tip}</p></div><div className="detail-guide-caution"><h3>{product.code === "RNT" ? "레티놀 사용 전 꼭 확인하세요" : "시작 전 알아두세요"}</h3><p>{guide.caution}</p></div></section>
        <section className="product-faq"><p className="eyebrow">A LITTLE MORE ABOUT {product.code}</p><h2>고르기 전에 궁금한 점</h2><details><summary>{guide.faq[0]}</summary><p>{guide.faq[1]}</p></details><details><summary>세럼 여러 개를 같이 사용해도 되나요?</summary><p>여섯 세럼은 하나의 루틴에 전부 쌓아 바르는 제품 구성이 아닙니다. 새 제품은 하나씩 시작하고, 두 제품의 함량을 합산하지 마세요. 함께 쓸 때의 편안함이나 결과를 보장할 수 없습니다.</p></details><details><summary>이 제품의 안내는 어디에서 확인했나요?</summary><p>마리엔비 공식 제품·성분 가이드를 참고해 정리했습니다. 제공된 라벨 자료와 다른 부분은 별도로 표시했으며 실제 사용 시 제품 포장의 최신 표시를 우선 확인해 주세요.</p><a className="text-link" href={guide.source} target="_blank" rel="noreferrer">공식 성분·사용법 안내 ↗</a></details></section>
        <div className="detail-guide-navigation"><Link className="text-link" href="/#compare">6종 성분·사용법 비교하기 →</Link><Link className="text-link" href="/#routine">처음 시작하는 루틴 보기 →</Link></div>
      </>}
      <div className="detail-description-block">
        <p className="eyebrow">USE &amp; PRODUCT INFORMATION</p>
        <p>
          처음에는 귀 뒤나 팔 안쪽에 소량 발라 하루 정도 살펴보세요. 세안 후 마른 피부에
          제품 사용법에 따라 바르고 보습제로 마무리하세요. 낮에는 자외선 차단제를 사용하고,
          눈 주위는 피하세요. 따갑거나 붉어지면 사용을 멈추고, 불편함이 계속되면 전문가와 상의하세요.
        </p>
        <p className="cosmetic-disclaimer">
          피부 겉모습을 위한 화장품입니다. 개인에 따라 경험은 다를 수 있습니다.
        </p>
      </div>
    </section>
  );
}
