"use client";

import Link from "next/link";
import { formatPrice } from "../lib/products";
import { ProductArt } from "./product-art";

export function ProductCard({ product, index = 0 }) {
  return (
    <article className="product-card" style={{ "--card-index": index }}>
      <Link
        className="product-card-image-link"
        href={`/products/${product.slug}`}
        aria-label={`${product.name} 상세 보기`}
      >
        <ProductArt
          imageUrl={product.imageUrl}
          category={product.category}
          code={product.code}
          alt={`${product.name} 제품 사진`}
        />
        <span className="product-badge">{product.code} · 30 ML</span>
      </Link>
      <div className="product-card-info">
        <div>
          <p className="product-category">{product.category}</p>
          <Link className="product-name" href={`/products/${product.slug}`}>
            {product.name}
          </Link>
          <p className="product-tagline">{product.tagline}</p>
          <p className="product-ingredient">
            <span className={`ingredient-swatch swatch-${product.code.toLowerCase()}`} />
            {product.ingredients.split(" · ")[0]}
          </p>
          <p className="product-volume">{product.volume}</p>
          <p className="product-price">
            <strong>
              {product.price === null
                ? formatPrice(product.price)
                : `${formatPrice(product.price)}원`}
            </strong>
            {product.compareAtPrice && (
              <del>{formatPrice(product.compareAtPrice)}원</del>
            )}
          </p>
          {product.koreaSalesNote ? (
            <p className="product-sales-note">{product.koreaSalesNote}</p>
          ) : product.storeUrl ? (
            <a
              className="product-store-link"
              href={product.storeUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${product.name} 네이버 스마트스토어 상품 페이지`}
            >
              상품 보기
            </a>
          ) : (
            <p className="product-sales-note">국내 판매 정보 확인 중</p>
          )}
        </div>
      </div>
    </article>
  );
}
