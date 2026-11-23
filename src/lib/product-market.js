const overseasCodes = new Set(["VNC15", "ANC5", "ANC10"]);

export const overseasOnly = (product) => overseasCodes.has(product.code);
export const familyCode = (code) => code.replace(/-60ML$/, "");
export const sizeLabel = (product) => product.volume?.split(" / ")[0];
export const optionName = (product) => [product.name, sizeLabel(product)].filter(Boolean).join(" · ");

export function localMarketProduct(product) {
  return overseasOnly(product) ? {
    ...product, price: null, compareAtPrice: null, stock: 0, koreaSalesNote: "해외 전용 · 국내 판매 제외",
  } : product;
}

export function withDemoInventory(catalog, saved = []) {
  const stockBySlug = new Map(saved.filter(({ price }) => price !== null).map(({ slug, stock }) => [slug, stock]));
  return catalog.map((product) => ({
    ...product, id: product.slug, stock: overseasOnly(product) ? 0 : stockBySlug.get(product.slug) ?? product.stock,
  }));
}
