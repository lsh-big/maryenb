export const MAX_ORDER_QUANTITY = 99;

export function extraUnitPrice(product) {
  const prices = product.bundlePrices;
  return prices?.length ? Math.round(prices.at(-1) / prices.length) : null;
}

export function linePrice(product, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ORDER_QUANTITY || !(Number(product.price) > 0)) return null;
  const prices = product.bundlePrices;
  let total = Number(product.price) * quantity;
  if (prices?.length) {
    total = quantity <= prices.length
      ? prices[quantity - 1]
      : prices.at(-1) + (quantity - prices.length) * extraUnitPrice(product);
  }
  return Number.isSafeInteger(total) && total > 0 ? total : null;
}
