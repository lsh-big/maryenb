import catalog from "../data/products.json";

// Upgrade only legacy, unconverted catalog rows. Once converted, storeUrl and
// koreaSalesNote are null and price is set, so a later sellout stays sold out.
export async function initializeCatalogInventory(database) {
  await database.$transaction(catalog.map((product) => database.product.updateMany({
    where: {
      slug: product.slug,
      stock: 0,
      OR: [
        { storeUrl: { not: null } },
        { koreaSalesNote: { not: null } },
        { price: null },
      ],
    },
    data: {
      stock: product.stock,
      storeUrl: null,
      koreaSalesNote: null,
      ...(product.code === "ANC5" || product.code === "ANC10" ? { price: product.price } : {}),
    },
  })));
}
