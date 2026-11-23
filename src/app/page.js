import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ProductCollection } from "../components/product-collection";
import { RoutineGuide } from "../components/routine-guide";
import { CampaignFilm } from "../components/campaign-film";
import { prisma } from "../lib/prisma";
import { serializeProduct } from "../lib/products";
import catalog from "../data/products.json";
import { publicStoreProduct } from "../lib/sales-config";
import { isVirtualDatabase } from "../lib/database-mode";
import { getVirtualProducts } from "../lib/virtual-db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products = [];
  const virtual = isVirtualDatabase();
  const databaseUnavailable = !virtual && !process.env.DATABASE_URL;

  if (virtual) {
    products = (await getVirtualProducts()).filter(({ isActive }) => isActive);
  } else if (databaseUnavailable) {
    products = catalog.map((product) => ({ ...product, purchaseUnavailable: true, price: null }));
  } else {
    try {
      const databaseProducts = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 24,
      });
      products = databaseProducts.map(publicStoreProduct);
    } catch (error) {
      console.error("제품 목록을 불러오지 못했습니다.", error);
      products = catalog.map((product) => ({ ...product, purchaseUnavailable: true, price: null }));
    }
  }

  return (
    <>
      <section className="hero campaign">
        <div className="hero-copy">
          <h1>성분과 함량을 보고, <em>내 세럼을 고르세요.</em></h1>
          <p className="hero-description">국내 판매 세럼 RNT·TNA5·NTZ20을 30ml와 60ml로 만나보세요.</p>
        </div>
        <div className="hero-visual" id="brand-film">
          <Image
            src="/images/homepage/mb-hero-lineup-studio.webp"
            alt="마리엔비 세럼 6종: VNC15, ANC5, ANC10, RNT, TNA5, NTZ20"
            fill
            priority
            sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1360px) 57vw, 744px"
          />
          <CampaignFilm />
        </div>
        <div className="hero-actions">
          <Link className="button button-dark" href="#products">국내 판매 세럼 보기</Link>
          <Link className="hero-secondary" href="#compare">국내·해외 세럼 비교</Link>
        </div>
      </section>
      <div className="section-shell shop-flow">
        <ProductCollection products={products.map(serializeProduct)} />
      </div>
      <RoutineGuide />

      <section className="brand-note" id="brand">
        <Image
          src="/images/homepage/mb-story-square-20261015.jpg"
          alt=""
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

      <p className="cosmetic-disclaimer">
        피부 겉모습을 위한 화장품입니다. 개인에 따라 경험은 다를 수 있습니다.
      </p>
    </>
  );
}
