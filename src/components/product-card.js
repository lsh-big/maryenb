import Link from "next/link";
import { formatPrice } from "../lib/products";
import { ProductArt } from "./product-art";

export function ProductCard({ product, index = 0 }) {
  const unavailable = product.purchaseUnavailable ? "판매 준비 중"
    : product.stock < 1 ? "품절"
    : product.koreaSalesNote || !product.price ? "구매 준비 중" : "";

  return (
    <article className="product-card" style={{ "--card-index": index, "--product-accent": product.guide?.accent, "--product-wash": product.guide?.wash }}>
      <Link className="product-card-link" href={`/products/${product.slug}`}>
        <div className="product-card-image">
          <ProductArt imageUrl={product.imageUrl} category={product.category} code={product.code} />
          <span className="product-badge">{product.code}</span>
        </div>
        <div className="product-card-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-ingredient">{product.guide?.focus || product.ingredients.split(" · ")[0]}</p>
          <p className="product-price">
            <strong>{product.price == null ? formatPrice(null) : `${formatPrice(product.price)}원`}</strong>
            {product.price != null && product.compareAtPrice > product.price && <del>{formatPrice(product.compareAtPrice)}원</del>}
          </p>
          {unavailable && <p className="product-sales-note">{unavailable}</p>}
        </div>
      </Link>
    </article>
  );
}
