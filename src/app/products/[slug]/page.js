import { notFound } from "next/navigation";
import { ProductDetail } from "../../../components/product-detail";
import { prisma } from "../../../lib/prisma";
import { serializeProduct } from "../../../lib/products";
import catalog from "../../../data/products.json";
import { initializeCatalogInventory } from "../../../lib/catalog-inventory";
import { isVirtualDatabase } from "../../../lib/database-mode";
import { getVirtualProducts } from "../../../lib/virtual-db";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  const { slug } = await params;
  let product = catalog.find((item) => item.slug === slug);

  if (isVirtualDatabase()) {
    product = (await getVirtualProducts()).find((item) => item.slug === slug && item.isActive);
  } else if (process.env.DATABASE_URL) {
    try {
      await initializeCatalogInventory(prisma);
      const databaseProduct = await prisma.product.findUnique({
        where: { slug, isActive: true },
      });
      const catalogProduct = catalog.find((item) => item.slug === slug);
      product = databaseProduct
        ? {
            ...databaseProduct,
            ...(catalogProduct
              ? {
                  price: databaseProduct.price,
                  compareAtPrice: catalogProduct.compareAtPrice,
                  storeUrl: catalogProduct.storeUrl,
                  koreaSalesNote: catalogProduct.koreaSalesNote,
                }
              : {}),
          }
        : product;
    } catch (error) {
      console.error("제품 정보를 불러오지 못했습니다.", error);
    }
  }

  if (!product) notFound();

  return <ProductDetail product={serializeProduct(product)} />;
}
