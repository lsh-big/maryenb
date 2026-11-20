import Link from "next/link";
import catalog from "../../data/products.json";
import { productGuides } from "../../data/product-guides";
import { isVirtualDatabase } from "../../lib/database-mode";
import { deliveryTerms } from "../../lib/sales-config";

export const metadata = { title: "고객지원" };

const topics = [
  ["product-use", "상품·사용법"],
  ["order-delivery", "주문·배송"],
  ["returns", "교환·반품"],
  ["contact", "문의하기"],
];

const inquiries = [
  ["상품 문의", "제품명과 궁금한 성분이나 사용법을 알려 주세요."],
  ["주문·배송 문의", "주문번호, 주문 상품과 확인하고 싶은 내용을 알려 주세요."],
];

const guidedProducts = catalog.filter(({ isActive, code }) => isActive && productGuides[code]);
const ancPair = guidedProducts.filter(({ code }) => code === "ANC5" || code === "ANC10");

function supportChannels() {
  const email = process.env.SUPPORT_EMAIL?.trim() || "";
  const kakao = process.env.SUPPORT_KAKAO_URL?.trim() || "";
  return [
    ...(/^[\w.+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(email) ? [["이메일 문의", `mailto:${email}`]] : []),
    ...(/^https:\/\/pf\.kakao\.com\/_[a-z0-9_]+(?:\/chat)?\/?$/i.test(kakao) ? [["카카오톡 문의", kakao]] : []),
  ];
}

export default function SupportPage() {
  const virtual = isVirtualDatabase();
  const delivery = deliveryTerms(virtual);
  const channels = supportChannels();
  const hours = process.env.SUPPORT_HOURS?.trim();

  return <article className="policy-shell support-shell">
    <h1>고객지원</h1>
    <p className="support-intro">세럼 사용법부터 주문·배송과 교환·반품 안내까지 확인하세요.</p>
    <nav className="support-topics" aria-label="고객지원 항목">
      {topics.map(([id, label]) => <a className="button" key={id} href={`#${id}`}>{label}</a>)}
    </nav>

    <section className="support-section" id="product-use" tabIndex={-1}>
      <h2>상품·사용법</h2>
      <div className="support-faq">
        <details>
          <summary>ANC5와 ANC10은 어떻게 다른가요?</summary>
          <p>두 제품은 같은 아젤라익애씨드를 서로 다른 함량으로 담았습니다. 한 제품씩 소량으로 시작하고 제품별 사용 안내를 확인하세요.</p>
          <div className="support-links">
            {ancPair.map(({ code, slug }) => <Link key={code} className="text-link" href={`/products/${slug}`}>
              {code} · {productGuides[code].focus}
            </Link>)}
          </div>
        </details>
        <details>
          <summary>세럼은 어떤 순서로 바르나요?</summary>
          <p>세안 후 세럼을 바르고 보습제로 마무리하세요. 낮에는 마지막에 자외선 차단제를 사용하세요. 새 세럼은 작은 부위에서 먼저 시험해 보세요.</p>
          <Link className="text-link" href="/#routine">아침·저녁 루틴 가이드</Link>
        </details>
        <details>
          <summary>제품별 사용 시간과 시작 횟수는 어떻게 되나요?</summary>
          <ul className="support-usage">
            {guidedProducts.map(({ code, slug }) => {
              const { focus, timing, frequency } = productGuides[code];
              return <li key={code}>
                <Link className="text-link" href={`/products/${slug}`}>{code} · {focus}</Link>
                <p>{timing} · {frequency}</p>
              </li>;
            })}
          </ul>
        </details>
      </div>
    </section>

    <section className="support-section" id="order-delivery" tabIndex={-1}>
      <h2>주문·배송</h2>
      <dl className="routine-facts support-facts">
        <div><dt>배송비</dt><dd>{delivery.shipping}</dd></div>
        <div><dt>발송 기준</dt><dd>{delivery.dispatch}</dd></div>
      </dl>
      <p>주문한 계정으로 로그인하면 주문 내역을 확인할 수 있습니다. 실제 주문의 택배사와 송장번호는 판매자가 등록한 뒤 표시됩니다.</p>
      <div className="support-links">
        <Link className="button button-dark" href="/orders">주문·배송 조회</Link>
        <Link className="text-link" href="/policies#delivery">배송 정책 보기</Link>
      </div>
    </section>

    <section className="support-section" id="returns" tabIndex={-1}>
      <h2>교환·반품</h2>
      <p>{delivery.returns}</p>
      <Link className="text-link" href="/policies#delivery">교환·반품 정책 보기</Link>
    </section>

    <section className="support-section" id="contact" tabIndex={-1}>
      <h2>문의하기</h2>
      {channels.length === 0 && <p>고객 문의 채널은 준비 중입니다.</p>}
      {channels.length > 0 && hours && <p>응대 시간 · {hours}</p>}
      <div className="support-inquiries">
        {inquiries.map(([title, description]) => <section className="support-inquiry" key={title}>
          <h3>{title}</h3>
          <p>{description}</p>
          {channels.length > 0 && <div className="support-links">
            {channels.map(([label, href]) => <a className="button button-dark" key={href} href={href}>{label}</a>)}
          </div>}
        </section>)}
      </div>
    </section>
  </article>;
}
