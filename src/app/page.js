import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { ProductCard } from "../components/product-card";
import { prisma } from "../lib/prisma";
import { serializeProduct } from "../lib/products";
import catalog from "../data/products.json";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products = [];
  const databaseUnavailable = !process.env.DATABASE_URL;

  if (databaseUnavailable) {
    products = catalog;
  } else {
    try {
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
              price: catalogProduct.price,
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
          <p className="eyebrow">MARYENB · PRODUCT GUIDE</p>
          <h1>
            라벨에 담긴 정보,
            <br />
            <em>있는 그대로</em>
          </h1>
          <p className="hero-description">
            MaryenB 페이셜 세럼 6종의 제품명,
            <br />
            성분 표시와 용량을 확인해 보세요.
          </p>
          <Link className="button button-dark" href="#products">
            제품 만나보기 <ArrowRight size={16} />
          </Link>
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

      <section className="promise-strip">
        <p>제품 라벨 기준 안내</p>
        <span>✳</span>
        <p>성분과 함량 확인</p>
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
          <h2>MaryenB</h2>
          <p>
            네이버 스마트스토어 프로필은 MaryenB를 “검증된 성분을 과학적으로 조합한 고함량
            더마 세럼 브랜드”로 소개합니다. 제품 정보는 각 제품 라벨에 표시된 성분,
            함량과 용량을 기준으로 안내합니다.
          </p>
          <a
            className="text-link"
            href="https://maryenb.co.kr/"
            target="_blank"
            rel="noreferrer"
          >
            MaryenB 한국어 사이트 <ArrowRight size={15} />
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
            <h2>마리엔비의 제품</h2>
          </div>
          <span className="section-caption">제품 라벨 정보 · 네이버 스마트스토어 판매가</span>
        </div>
        {databaseUnavailable && (
          <p className="catalog-notice">
            DB 연결 전 미리보기 데이터를 표시하고 있습니다. 이 사이트에서는 주문을 받지 않으며,
            최신 가격·재고·배송 및 구매 조건은 각 상품의 네이버 스마트스토어 페이지에서 확인해 주세요.
          </p>
        )}
        <div className="product-grid">
          {products.map((product, index) => (
            <ProductCard
              key={product.id ?? product.code}
              product={serializeProduct(product)}
              index={index}
            />
          ))}
        </div>
      </section>

      <section className="ingredient-note">
        <div className="ingredient-copy">
          <p className="eyebrow">MARYENB · FORMULA GUIDE</p>
          <h2>성분 이름 옆의<br /><em>함량을 확인하세요</em></h2>
          <p>제품 라벨에 표시된 함량과 성분별 특징을 안내합니다.</p>
        </div>
        <div className="ingredient-list">
          {[
            ["VNC15", "Vitamin C 15%", "항산화 성분"],
            ["ANC5", "Azelaic Acid 5%", "아젤라익애씨드 성분"],
            ["ANC10", "Azelaic Acid 10%", "아젤라익애씨드 성분"],
            ["RNT", "Retinol 5000 IU/g", "비타민 A 유도체 성분"],
            ["TNA5", "Tranexamic Acid 5%", "트라넥삼산 성분"],
            ["NTZ20", "Niacinamide 20%", "비타민 B3 유도체 성분"],
          ].map(([code, ingredient, use]) => (
            <div className="ingredient-row" key={code}>
              <strong>{code}</strong>
              <div className="ingredient-row-copy">
                <span>{ingredient}</span>
                <small>{use}</small>
              </div>
            </div>
          ))}
          <p className="ingredient-usage-note">
            성분 특징을 간략히 안내하며, 완제품의 효능을 의미하거나 보장하지 않습니다.
          </p>
        </div>
      </section>

      <p className="cosmetic-disclaimer">
        피부 겉모습을 위한 화장품입니다. 개인에 따라 경험은 다를 수 있습니다.
      </p>
    </>
  );
}
