"use client";

import Link from "next/link";
import { formatPrice } from "../lib/products";
import { ProductArt } from "./product-art";

export function ProductCard({ product, index = 0 }) {
  return (
    <article className="product-card" style={{ "--card-index": index, "--product-accent": product.guide?.accent, "--product-wash": product.guide?.wash }}>
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
          {product.guide && <p className="product-promise">{product.guide.headline}</p>}
          <Link className="product-name" href={`/products/${product.slug}`}>
            {product.name}
          </Link>
          <p className="product-tagline">{product.tagline}</p>
          {product.guide && <div className="product-tags">{product.guide.tags.slice(0,2).map((tag) => <span key={tag}>{tag}</span>)}</div>}
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
          <p className="product-sales-note">{product.stock > 0 ? "재고 있음" : "품절"}</p>
          <Link className="product-store-link" href={`/products/${product.slug}`}>상품 보기 · 구매하기 →</Link>
        </div>
      </div>
    </article>
  );
}
