import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ProductCollection } from "../components/product-collection";
import { RoutineGuide } from "../components/routine-guide";
import { PromoVideo } from "../components/promo-video";
import { prisma } from "../lib/prisma";
import { serializeProduct } from "../lib/products";
import catalog from "../data/products.json";
import { initializeCatalogInventory } from "../lib/catalog-inventory";
import { isVirtualDatabase } from "../lib/database-mode";
import { getVirtualProducts } from "../lib/virtual-db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products = [];
  const virtual = isVirtualDatabase();
  const databaseUnavailable = !virtual && !process.env.DATABASE_URL;

  if (virtual) {
    products = await getVirtualProducts();
  } else if (databaseUnavailable) {
    products = catalog.map((product) => ({ ...product, purchaseUnavailable: true, price: null }));
  } else {
    try {
      await initializeCatalogInventory(prisma);
      const databaseProducts = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 8,
      });
      products = databaseProducts;
    } catch (error) {
      console.error("제품 목록을 불러오지 못했습니다.", error);
      products = catalog.map((product) => ({ ...product, purchaseUnavailable: true, price: null }));
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>지금 내 루틴에 필요한 <em>세럼 한 병</em></h1>
          <p className="hero-description">피부 고민에 맞춰 세럼 6종의 성분과 사용법을 비교해 보세요.</p>
          <div className="hero-actions">
            <Link className="button button-dark" href="#one-bottle">내 세럼 찾기 <ArrowRight size={16} /></Link>
            <Link className="hero-secondary" href="#compare">6종 비교하기</Link>
          </div>
        </div>
        <div className="hero-visual">
          <Image src="/images/homepage/mb-hero-lineup-20261015.jpg" alt="마리엔비 세럼 6종" fill priority sizes="(max-width: 760px) 100vw, 55vw" />
        </div>
      </section>
      <div className="section-shell shop-flow">
        <ProductCollection products={products.map(serializeProduct)} />
      </div>
      <RoutineGuide />

      <section className="brand-note" id="brand">
        <Image
          src="/images/homepage/mb-story-square-20261015.jpg"
          alt="MaryenB 페이셜 세럼 여섯 종류 전체 사진"
          width={720}
          height={720}
          sizes="(max-width: 560px) calc(100vw - 44px), 300px"
          className="brand-story-image brand-lineup-image"
        />
        <div>
          <h2>성분은 분명하게,<br />나의 선택은 편안하게.</h2>
          <p>
            마리엔비는 주요 성분과 함량을 공개하고, 나의 루틴에 맞는 세럼을 직접 고를 수 있도록
            돕는 성분 중심 스킨케어 브랜드입니다. 어떤 성분을 담았는지, 어떻게 시작하는지까지.
            확인한 정보를 바탕으로 한 병의 선택을 돕습니다.
          </p>
          <a
            className="text-link"
            href="https://maryenb.co.kr/pages/brand-story-korean-skincare"
            target="_blank"
            rel="noreferrer"
          >
            브랜드 이야기 더 보기 <ArrowRight size={15} />
          </a>
          <div className="brand-social-links">
            <a href="https://blog.naver.com/maryenb-skincare" target="_blank" rel="noreferrer">
              공식 네이버 블로그
            </a>
            <a href="https://instagram.com/maryenb_official" target="_blank" rel="noreferrer">
              공식 인스타그램
            </a>
          </div>
        </div>
      </section>

      <section className="section-shell brand-film-section" id="brand-film">
        <h2>마리엔비 브랜드 영상</h2>
        <PromoVideo />
      </section>
      <p className="cosmetic-disclaimer">
        피부 겉모습을 위한 화장품입니다. 개인에 따라 경험은 다를 수 있습니다.
      </p>
    </>
  );
}
