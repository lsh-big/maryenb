import Link from "next/link";
import { formatPrice } from "../lib/products";
import { overseasOnly, sizeLabel } from "../lib/product-market";
import { ProductArt } from "./product-art";

export function ProductCard({ product, index = 0, ingredientPrefix = "", detailLabel = "상세 보기" }) {
  const overseas = overseasOnly(product);
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
          <p className="product-ingredient">{ingredientPrefix}{product.guide?.focus || product.ingredients.split(" · ")[0]}</p>
          <p className="product-volume">{overseas ? "해외 전용 · 국내 판매 제외" : `국내 판매 · ${product.sizeLabels?.join(" / ") || sizeLabel(product)}`}</p>
          {!overseas && <p className="product-price">
            <strong>{product.price == null ? formatPrice(null) : `${sizeLabel(product)} ${formatPrice(product.price)}원`}</strong>
            {product.price != null && product.compareAtPrice > product.price && <del>{formatPrice(product.compareAtPrice)}원</del>}
          </p>}
          {!overseas && unavailable && <p className="product-sales-note">{unavailable}</p>}
          <span className="card-detail-link">{detailLabel}</span>
        </div>
      </Link>
    </article>
  );
}
