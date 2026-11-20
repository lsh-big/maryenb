export function configuredShippingFee() {
  const value = process.env.SHIPPING_FEE || "";
  const amount = Number(value);
  return /^\d+$/.test(value) && Number.isSafeInteger(amount) && amount < 10_000_000_000 ? amount : null;
}

export function catalogConfirmed() {
  return process.env.SALES_CATALOG_CONFIRMED === "true";
}

export function deliveryTerms(virtual) {
  const fee = virtual ? 0 : configuredShippingFee();
  const published = process.env.SALES_POLICIES_PUBLISHED === "true";

  return {
    shipping: virtual ? "가상 주문 0원" : fee === null ? "확정 후 안내" : fee === 0 ? "무료" : `${fee.toLocaleString("ko-KR")}원`,
    dispatch: virtual ? "실제 발송은 진행되지 않습니다." : (published && process.env.SHIPPING_DISPATCH?.trim()) || "발송 일정 확정 후 안내",
    returns: virtual ? "실제 교환·반품은 진행되지 않습니다." : (published && process.env.RETURN_TERMS?.trim()) || "접수 방법과 비용 확정 후 안내",
  };
}

export function publicStoreProduct(product) {
  return catalogConfirmed() ? product : {
    ...product, price: null, compareAtPrice: null, stock: 0, purchaseUnavailable: true,
  };
}
