export function configuredShippingFee() {
  const value = process.env.SHIPPING_FEE || "";
  const amount = Number(value);
  return /^\d+$/.test(value) && Number.isSafeInteger(amount) && amount < 10_000_000_000 ? amount : null;
}

export function catalogConfirmed() {
  return process.env.SALES_CATALOG_CONFIRMED === "true";
}

export function publicStoreProduct(product) {
  return catalogConfirmed() ? product : {
    ...product, price: null, compareAtPrice: null, stock: 0, purchaseUnavailable: true,
  };
}
