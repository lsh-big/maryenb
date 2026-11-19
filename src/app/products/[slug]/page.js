import { notFound } from "next/navigation";
import { ProductDetail } from "../../../components/product-detail";
import { prisma } from "../../../lib/prisma";
import { serializeProduct } from "../../../lib/products";
import catalog from "../../../data/products.json";
import { configuredShippingFee, publicStoreProduct } from "../../../lib/sales-config";
import { isVirtualDatabase } from "../../../lib/database-mode";
import { getVirtualProducts } from "../../../lib/virtual-db";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const catalogProduct = catalog.find((item) => item.slug === slug);
  let product = catalogProduct && { ...catalogProduct, purchaseUnavailable: true, price: null };

  const virtual = isVirtualDatabase();
  if (virtual) {
    product = (await getVirtualProducts()).find((item) => item.slug === slug && item.isActive);
  } else if (process.env.DATABASE_URL) {
    try {
      const databaseProduct = await prisma.product.findUnique({
        where: { slug, isActive: true },
      });
      product = databaseProduct && publicStoreProduct(databaseProduct);
    } catch (error) {
      console.error("제품 정보를 불러오지 못했습니다.", error);
    }
  }

  if (!product) notFound();

  return <ProductDetail product={serializeProduct(product)} virtual={virtual} shippingFee={configuredShippingFee()} />;
}
