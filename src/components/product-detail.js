"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "./cart-provider";
import { formatPrice } from "../lib/products";
import { ProductArt } from "./product-art";

export function ProductDetail({ product }) {
  const { addItem } = useCart();
  const leadIngredient = product.ingredients.split(" · ")[0];
  const gallery = product.galleryUrls?.length
    ? product.galleryUrls
    : [product.imageUrl].filter(Boolean);
  const [activeImage, setActiveImage] = useState(gallery[0]);

  return (
    <section className="detail-shell">
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
          <p className="detail-description">{product.description}</p>
          <div className="detail-ingredients">
            <span className="ingredient-overline">LABEL SPOTLIGHT</span>
            <strong>{leadIngredient}</strong>
            <p className="ingredient-fact">제품 라벨에 표시된 성분 및 함량입니다.</p>
            <div className="detail-ingredients-divider" />
            <strong>라벨에 표시된 성분과 함량</strong>
            <p>{product.ingredients}</p>
          </div>
          {product.storeUrl ? (
            <a
              className="button button-dark detail-add"
              href={product.storeUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${product.name} 네이버 스마트스토어 상품 페이지`}
            >
              <ShoppingBag size={17} /> 상품 보러가기
            </a>
          ) : (
            <button
              className="button button-dark detail-add"
              type="button"
              disabled={product.stock < 1 || product.price === null || Boolean(product.koreaSalesNote)}
              onClick={() => addItem(product)}
            >
              <ShoppingBag size={17} />
              {product.koreaSalesNote ? "국내 판매 대상 아님" : "판매 준비 중"}
            </button>
          )}
          <p className="stock-note">
            {product.koreaSalesNote ??
              (product.storeUrl
                ? "최신 가격·재고·배송 정보는 스마트스토어에서 확인해 주세요."
                : "국내 판매가와 판매 조건을 확인 중입니다.")}
          </p>
        </div>
      </div>
      <div className="detail-description-block">
        <p className="eyebrow">USE &amp; PRODUCT INFORMATION</p>
        <p>
          사용 순서: 세안 후 세럼을 바르고 보습제를 사용하세요. 낮에는 마지막 단계에
          선크림을 사용하세요. 사용 전 제품 라벨의 사용법을 확인하고, 처음에는 작은
          부위에 먼저 사용해 보세요. 불편함이 생기면 사용을 중단하세요.
        </p>
        <p className="cosmetic-disclaimer">
          피부 겉모습을 위한 화장품입니다. 개인에 따라 경험은 다를 수 있습니다.
        </p>
      </div>
    </section>
  );
}
