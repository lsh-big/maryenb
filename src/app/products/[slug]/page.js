import { notFound } from "next/navigation";
import { ProductDetail } from "../../../components/product-detail";
import { prisma } from "../../../lib/prisma";
import { serializeProduct } from "../../../lib/products";
import catalog from "../../../data/products.json";
import { deliveryTerms, publicStoreProduct } from "../../../lib/sales-config";
import { isVirtualDatabase } from "../../../lib/database-mode";
import { getVirtualProducts } from "../../../lib/virtual-db";
import { familyCode } from "../../../lib/product-market";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const catalogProduct = catalog.find((item) => item.slug === slug);
  const family = catalogProduct && familyCode(catalogProduct.code);
  const catalogOptions = catalogProduct ? catalog.filter(({ code }) => familyCode(code) === family) : [];
  let options = catalogOptions.map((product) => ({ ...product, purchaseUnavailable: true, price: null, compareAtPrice: null, stock: 0 }));

  const virtual = isVirtualDatabase();
  if (virtual) {
    options = (await getVirtualProducts()).filter((item) => item.isActive && familyCode(item.code) === family);
  } else if (process.env.DATABASE_URL) {
    try {
      const databaseProducts = await prisma.product.findMany({
        where: { ...(family ? { code: { in: catalogOptions.map(({ code }) => code) } } : { slug }), isActive: true },
      });
      options = databaseProducts.map(publicStoreProduct);
    } catch (error) {
      console.error("제품 정보를 불러오지 못했습니다.", error);
    }
  }

  const product = options.find((item) => item.slug === slug);
  if (!product) notFound();
  const primary = options.find(({ code }) => code === family) ?? product;
  const sizes = catalogOptions.length > 1
    ? catalogOptions.map((item) => options.find(({ slug }) => slug === item.slug) ??
      { ...item, purchaseUnavailable: true, price: null, compareAtPrice: null, stock: 0 })
    : [product];

  return <ProductDetail key={slug} product={serializeProduct(product)} sizes={sizes.map(serializeProduct)}
    virtual={virtual} delivery={deliveryTerms(virtual)}
    reviewSlug={!virtual && Number.isInteger(primary.id) ? primary.slug : null} />;
}
