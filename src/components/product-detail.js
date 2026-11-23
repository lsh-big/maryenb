"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-provider";
import { formatPrice } from "../lib/products";
import { familyCode, overseasOnly, sizeLabel } from "../lib/product-market";
import { extraUnitPrice, linePrice, MAX_ORDER_QUANTITY } from "../lib/product-price";
import { ProductArt } from "./product-art";
import { QuantitySelector } from "./quantity-selector";
import { apiFetch } from "../lib/client-api";
import { useAuth } from "./auth-provider";
import { ProductAdvantage } from "./product-advantage";
import { ProductReviews } from "./product-reviews";
import { SkinComparison } from "./skin-comparison";
import { productGuides } from "../data/product-guides";
import catalog from "../data/products.json";

const azelaicPair = catalog.filter(({ code }) => code === "ANC5" || code === "ANC10");

export function ProductDetail({ product: initialProduct, sizes, delivery, virtual, reviewSlug }) {
  const [localProducts, setLocalProducts] = useState(null);
  const [selectedSlug, setSelectedSlug] = useState(initialProduct.slug);
  const [reviewCount, setReviewCount] = useState(null);
  const selectedSize = sizes.find(({ slug }) => slug === selectedSlug) ?? initialProduct;
  const inventory = localProducts?.find(({ slug }) => slug === selectedSize.slug);
  const product = { ...selectedSize, ...inventory, code: familyCode(selectedSize.code) };
  const overseas = overseasOnly(product);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PAGES_DEMO !== "true") return;
    apiFetch("/api/products").then((r) => r.ok ? r.json() : null).then(setLocalProducts).catch(() => {});
  }, []);
  const { addItem, items, ready } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  const inCart = items.find((item) => item.slug === product.slug)?.quantity || 0;
  const maxQuantity = Math.min(product.stock, MAX_ORDER_QUANTITY);
  const available = product.stock > 0 && Number.isFinite(product.price) && product.price > 0 && !product.koreaSalesNote && !product.purchaseUnavailable;
  const canBuy = available;
  const availability = product.purchaseUnavailable ? "판매 준비 중" : !product.price ? "판매가 확인 중" : product.stock < 1 ? "품절" : available ? "재고 있음" : "구매 준비 중";
  const needsLogin = !virtual && !loading && (!user || user.guest);
  const buyLabel = available ? needsLogin ? "로그인 후 구매" : "바로 구매하기" : availability;
  const purchaseNote = virtual ? "로그인 없이 가상 주문을 체험할 수 있어요." :
    needsLogin ? "로그인 후 선택한 상품과 수량으로 주문을 계속할 수 있어요." : null;
  function buyNow() {
    const selection = new URLSearchParams({ buy: product.slug, quantity: String(selectedQuantity) });
    router.push(`/checkout?${selection}`);
  }
  const [quantity, setQuantity] = useState(1);
  const selectedQuantity = Math.max(1, Math.min(quantity, maxQuantity));
  const selectedTotal = linePrice(product, selectedQuantity);
  const additionalPrice = extraUnitPrice(product);
  const canAdd = ready && available && inCart + selectedQuantity <= maxQuantity;
  const guide = product.guide;
  const azelaic = azelaicPair.some(({ code }) => code === product.code);
  const [added, setAdded] = useState(false);
  const gallery = product.galleryUrls?.length
    ? product.galleryUrls
    : [product.imageUrl].filter(Boolean);
  const [activeImage, setActiveImage] = useState(gallery[0]);
  function selectSize(slug) {
    setSelectedSlug(slug);
    setQuantity(1);
    setAdded(false);
    setActiveImage(sizes.find((size) => size.slug === slug)?.galleryUrls?.[0]);
  }
  const textureDetails = guide?.textureDetails;
  const texturePackage = gallery[1] || gallery[0];
  const ranking = guide?.hwahaeRanking;

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
              alt={`${product.name} ${sizeLabel(product)} 제품 사진`}
              className="detail-art"
              priority={activeImage === gallery[0]}
              sizes="(max-width: 760px) 85vw, (max-width: 1200px) 45vw, 520px"
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
                    sizes="60px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-copy">
          <p className="detail-code">{product.code} · {overseas ? "해외 전용" : "국내 판매"}{!overseas && ` · ${sizeLabel(product)}`}</p>
          <h1>{product.name}</h1>
          <p className="detail-intro">{guide ? guide.summary.split(". ")[0].replace(/\.$/, "") + "." : product.description}</p>
          {guide && <dl className="detail-quick-facts">
            <div><dt>핵심 성분</dt><dd>{guide.focus}</dd></div>
            <div><dt>처음 사용</dt><dd>{guide.timing} · {guide.frequency}</dd></div>
            {guide.texture && <div><dt>제형</dt><dd>{guide.texture}</dd></div>}
          </dl>}
          {overseas ? <div className="detail-purchase">
            <p className="detail-market-note">이 제품은 해외 전용으로 국내에서 판매하지 않습니다.</p>
            <Link className="button button-dark" href="/#products">국내 판매 세럼 보기</Link>
          </div> : <div className="detail-purchase">
            {sizes.length > 1 && <fieldset className="detail-sizes">
              <legend>용량 선택</legend>
              <div className="concern-filters">
                {sizes.map((size) => <button type="button" key={size.slug}
                  aria-pressed={size.slug === selectedSlug} onClick={() => selectSize(size.slug)}>{sizeLabel(size)}</button>)}
              </div>
            </fieldset>}
            <div className="detail-price">
              <strong>{product.price == null ? formatPrice(null) : `${formatPrice(product.price)}원`}</strong>
              {product.price != null && product.compareAtPrice > product.price && <del>{formatPrice(product.compareAtPrice)}원</del>}
              {(product.price != null || product.purchaseUnavailable) && <span className="detail-price-status">{virtual && available ? "가상 주문 가격" : availability}</span>}
            </div>
            <div className="detail-purchase-links">
              <span>배송비 {delivery.shipping}</span>
              <a className="text-link" href="#detail-delivery" onClick={() => { document.getElementById("detail-delivery").open = true; }}>배송·교환·반품</a>
              {reviewCount > 0 && <a className="text-link" href="#reviews">구매 후기 {reviewCount}개</a>}
            </div>
            {product.price != null && product.bundlePrices?.length > 0 ? <fieldset className="detail-bundle-options">
              <legend>수량별 가격</legend>
              <div className="detail-bundle-grid">
                {product.bundlePrices.map((total, index) => {
                  const count = index + 1;
                  const regular = product.compareAtPrice * count;
                  return <button type="button" key={count} aria-pressed={selectedQuantity === count} disabled={!canBuy || count > maxQuantity}
                    onClick={() => { setQuantity(count); setAdded(false); }}>
                    <span>{count}개</span>
                    <strong>{formatPrice(total)}원</strong>
                    {regular > total && <small><b>{Math.round(100 * (1 - total / regular))}%</b> <del>{formatPrice(regular)}원</del></small>}
                  </button>;
                })}
              </div>
              {additionalPrice != null && <p className="detail-bundle-note">4개부터 추가 1개당 {formatPrice(additionalPrice)}원</p>}
            </fieldset> : null}
            {canBuy && <div className="detail-quantity">
              <div><span>수량</span>{inCart > 0 && <small>장바구니에 {inCart}개 담겨 있어요</small>}</div>
              <QuantitySelector value={selectedQuantity} onChange={(value) => { setQuantity(value); setAdded(false); }} max={maxQuantity} label={`${product.name} 수량`} />
            </div>}
            {canBuy && <div className="detail-selected-total" aria-live="polite">
              <span>선택 상품 금액 · {selectedQuantity}개</span><strong>{formatPrice(selectedTotal)}원</strong>
            </div>}
            <div className="detail-actions">
              <button className="button detail-add" type="button" disabled={!canAdd} onClick={() => { if (addItem(product, selectedQuantity)) setAdded(true); }}>
                <ShoppingBag size={17} /> 장바구니 담기
              </button>
              <button className="button button-dark detail-add" type="button" disabled={!canBuy} onClick={buyNow}>{buyLabel}</button>
            </div>
            {available && purchaseNote && <p className="detail-purchase-note">{purchaseNote}</p>}
            {ready && available && !canAdd && <p className="stock-note">이 용량은 장바구니에 최대 {maxQuantity}개까지 담을 수 있어요.</p>}
            {added && <p className="stock-note" role="status">장바구니에 담았습니다. <Link href="/cart">장바구니 보기</Link></p>}
          </div>}
          {(guide || reviewSlug) && <nav className="detail-shortcuts" aria-label="상품 상세 바로가기">
            {guide?.texture && <a href="#texture">제형</a>}
            {guide && <a href="#ingredients">성분</a>}
            {guide && <a href="#usage">사용법</a>}
            {reviewSlug && <a href="#reviews">후기</a>}
          </nav>}
        </div>
      </div>
      <div className="detail-editorial">
        {guide?.texture && <section id="texture" tabIndex={-1} className={`detail-chapter texture-chapter${textureDetails && texturePackage ? " texture-chapter-featured" : ""}`}>
          <div>
            <h2>텍스처와 사용감</h2>
            <p>{guide.texture} 세럼</p>
            {textureDetails && <p className="texture-fact">{textureDetails.description}</p>}
            <a className="text-link" href={textureDetails?.source || guide.ingredientsSource} target="_blank" rel="noreferrer">
              {textureDetails ? "공식 제형 표기" : "공식 제품 설명"}
            </a>
          </div>
          {textureDetails && texturePackage && <figure className="texture-package">
            <ProductArt imageUrl={texturePackage} category={product.category} code={product.code}
              alt={`${product.code} 제품 패키지`} sizes="(max-width: 560px) 68vw, 280px" />
            <figcaption>제품 패키지</figcaption>
          </figure>}
        </section>}
        {guide && <section className="detail-chapter" id="usage" tabIndex={-1}>
          <h2>사용 순서와 주의사항</h2>
          <dl className="routine-facts">
            <div><dt>사용 시간</dt><dd>{guide.timing}</dd></div>
            <div><dt>시작 빈도</dt><dd>{guide.frequency}</dd></div>
            <div><dt>사용 순서</dt><dd>세안 → 세럼 → 보습제{product.code !== "RNT" && " → 낮에는 자외선 차단제"}</dd></div>
          </dl>
          <p>{guide.tip}</p><p>{guide.caution}</p>
          <a className="text-link" href={guide.source} target="_blank" rel="noreferrer">공식 사용 안내</a>
        </section>}
        {guide && <section className="detail-chapter" id="ingredients" tabIndex={-1}>
          <h2>핵심 성분과 함량</h2>
          <div className="formula-highlights">{guide.points.map(([amount, ingredient]) => <div key={ingredient}>
            <strong>{ingredient.endsWith("IU/g") ? `${amount} IU/g` : amount === "CICA" ? "함유" : amount}</strong>
            <span>{ingredient.replace(" · IU/g", "")}</span>
          </div>)}</div>
          {guide.labelNote && <p className="detail-source-note">{guide.labelNote}</p>}
        </section>}
        <section className="detail-chapter">
          <h2>비슷한 제품과 비교</h2>
          {azelaic && <div className="detail-azelaic">
            <h3>5%와 10%, 어떤 차이가 있나요?</h3>
            <div className="detail-pair">{azelaicPair.map(({ code, slug }) => <div key={code} style={{ "--pair-wash": productGuides[code].wash }}>
              <strong>{code}</strong><span>{productGuides[code].focus}</span>
              {code !== product.code && <Link className="text-link" href={`/products/${slug}`}>상세 보기</Link>}
            </div>)}</div>
            <p>두 제품 모두 {guide.frequency} 시작하는 것이 공식 안내입니다. 한 제품을 골라 사용하고 피부 반응을 확인하세요.</p>
          </div>}
          <ProductAdvantage code={product.code} />
          <Link className="text-link detail-all-compare" href="/#compare">세럼 6종 비교 보기</Link>
        </section>
        {ranking && <section className="detail-ranking" aria-labelledby="detail-ranking-title">
          <div className="detail-ranking-art" aria-hidden="true">
            <Image src={ranking.image} alt="" fill sizes="(max-width: 560px) 170px, 250px" />
          </div>
          <div className="detail-ranking-copy">
            <h2 id="detail-ranking-title">화해 {ranking.category} <strong>{ranking.rank}위</strong> 달성</h2>
            <ul className="detail-ranking-ingredients" aria-label="주요 성분과 함량">
              {guide.points.map(([amount, ingredient]) => <li key={ingredient}>{ingredient} {amount}</li>)}
            </ul>
            <p>메리엔비 홍보 이미지 기준 · 집계 시점 미표기</p>
          </div>
        </section>}
        <SkinComparison key={product.code} code={product.code} />
        <section className="product-faq detail-chapter">
          <h2>{overseas ? "전성분과 라벨" : "전성분·배송·교환·반품"}</h2>
          <details>
            <summary>전성분 및 라벨 표기</summary>
            <h3>제공 라벨의 주요 성분과 함량</h3>
            <p>{product.ingredients}</p>
            {guide?.fullIngredients && <>
              <h3>공식 제품 페이지의 전성분</h3>
              <p>{guide.fullIngredients}</p>
              <a className="text-link" href={guide.ingredientsSource} target="_blank" rel="noreferrer">공식 전성분 원문</a>
            </>}
            <p>구매 전 실제 제품 포장의 최신 표시를 확인해 주세요.</p>
          </details>
          {!overseas && <details id="detail-delivery">
            <summary>배송·교환·반품</summary>
            <dl className="routine-facts">
              <div><dt>배송비</dt><dd>{delivery.shipping}</dd></div>
              <div><dt>발송 기준</dt><dd>{delivery.dispatch}</dd></div>
              <div><dt>교환·반품</dt><dd>{delivery.returns}</dd></div>
            </dl>
            <Link className="text-link" href="/policies#delivery">배송·교환·반품 정책</Link>
          </details>}
        </section>
      </div>
      {reviewSlug && <ProductReviews slug={reviewSlug} onCountChange={setReviewCount} />}
      <div className="detail-guide-navigation"><Link className="text-link" href="/#compare">6종 성분·사용법 비교하기 →</Link><Link className="text-link" href="/#routine">처음 시작하는 루틴 보기 →</Link></div>
      {canBuy && <div className="mobile-buy">
        <div><span>{sizeLabel(product)} · {selectedQuantity}개 상품 금액</span><strong>{formatPrice(selectedTotal)}원</strong></div>
        <button className="button button-dark" type="button" disabled={!canBuy} onClick={buyNow}>{buyLabel}</button>
      </div>}
    </section>
  );
}
