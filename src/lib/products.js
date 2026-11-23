import { productGuides } from "../data/product-guides";
import { familyCode } from "./product-market";

export function serializeProduct(product) {
  return {
    ...product,
    guide: productGuides[familyCode(product.code)] ?? null,
    id: product.id ?? product.slug,
    price: product.price === null ? null : Number(product.price),
    compareAtPrice:
      product.compareAtPrice === null
        ? null
        : Number(product.compareAtPrice),
  };
}

export function formatPrice(price) {
  if (price === null || price === undefined) return "판매가 확인 중";
  return new Intl.NumberFormat("ko-KR").format(price);
}
