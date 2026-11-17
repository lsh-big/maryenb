import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
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
    products = catalog;
  } else {
    try {
      await initializeCatalogInventory(prisma);
      const databaseProducts = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 8,
      });
      products = databaseProducts.map((product) => {
        const catalogProduct = catalog.find((item) => item.slug === product.slug);
        return catalogProduct
          ? {
              ...product,
              price: product.price,
              compareAtPrice: catalogProduct.compareAtPrice,
              storeUrl: catalogProduct.storeUrl,
              koreaSalesNote: catalogProduct.koreaSalesNote,
            }
          : product;
      });
    } catch (error) {
      console.error("제품 목록을 불러오지 못했습니다.", error);
      products = catalog;
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">INGREDIENTS FIRST · YOUR DAILY RITUAL</p>
          <h1>
            나를 아끼는 시간,
            <br />
            <em>마리엔비와 함께</em>
          </h1>
          <p className="hero-description">
            매일의 루틴에 더하는 작은 정성.
            <br />
            피부 고민과 성분으로, 나에게 맞는 한 병을 찾아보세요.
          </p>
          <Link className="button button-dark" href="#products">
            제품 만나보기 <ArrowRight size={16} />
          </Link>
          <Link className="hero-secondary" href="#compare">6종 세럼 비교하기 ↗</Link>
          <Link className="hero-secondary" href="#brand-film">브랜드 영상 보기 ↗</Link>
          <span className="hero-note">
            <ArrowDown size={14} /> PRODUCT LABELS · 30 ML
          </span>
        </div>
        <div className="hero-visual">
          <Image
            src="/images/homepage/mb-hero-lineup-20261015.jpg"
            alt="MaryenB 페이셜 세럼 여섯 종류"
            fill
            priority
            sizes="(max-width: 560px) 100vw, 50vw"
          />
        </div>
      </section>

      <PromoVideo />

      <section className="promise-strip">
        <p>성분으로 고르는 6가지 세럼</p>
        <span>✳</span>
        <p>새로운 루틴은 한 병부터</p>
        <span>✳</span>
        <p>30ml / 1.0 fl oz</p>
      </section>

      <section className="brand-note" id="brand">
        <Image
          src="/images/homepage/mb-story-square-20261015.jpg"
          alt=""
          width={360}
          height={360}
          className="brand-story-image"
        />
        <div>
          <p className="eyebrow">ABOUT MARYENB</p>
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

      <section className="products-section section-shell" id="products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR DAILY FAVORITE</p>
            <h2>오늘 가장 신경 쓰이는 고민은?</h2>
          </div>
          <span className="section-caption">6가지 데일리 세럼 · 이 사이트에서 구매</span>
        </div>
        {databaseUnavailable && (
          <p className="catalog-notice">
            상품을 장바구니에 담고 주문서를 작성할 수 있습니다. 결제는 판매 서비스 연결 완료 후 이용 가능합니다.
          </p>
        )}
        <p className="guide-intro">가장 신경 쓰이는 고민 하나를 정하고, 성분과 시작 방법을 비교해 보세요.</p>
        <ProductCollection products={products.map(serializeProduct)} />
      </section>

      <RoutineGuide />

      <p className="cosmetic-disclaimer">
        피부 겉모습을 위한 화장품입니다. 개인에 따라 경험은 다를 수 있습니다.
      </p>
    </>
  );
}
