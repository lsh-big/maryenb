import Link from "next/link";

export const metadata = {
  title: "판매자·이용·개인정보 안내",
};

export default function PoliciesPage() {
  return (
    <section className="policy-shell">
      <Link className="back-link" href="/">
        ← 홈으로
      </Link>
      <p className="eyebrow">PRE-LAUNCH INFORMATION</p>
      <h1>판매자·이용 안내</h1>
      <div className="policy-alert">
        이 사이트는 네이버 스마트스토어의 공개 상품 정보를 안내하는 미리보기이며, 여기서
        주문·결제를 받지 않습니다. 최신 가격·재고·배송 및 구매 조건은 연결된 스마트스토어에서
        확인해 주세요.
      </div>

      <section className="policy-section">
        <h2>네이버 스마트스토어 판매자 정보</h2>
        <p>
          네이버 스마트스토어 판매자 프로필에 공개된 표기는 다음과 같습니다. 이 정보는 해당
          스토어의 판매자 프로필 기준이며, 이 미리보기 사이트의 운영자 정보로 간주하지 않습니다.
        </p>
        <ul>
          <li>상호: 주식회사 써티트리</li>
          <li>대표자: 박성일</li>
          <li>
            공식 채널: <a href="https://blog.naver.com/maryenb-skincare" target="_blank" rel="noreferrer">네이버 블로그</a>,
            {" "}<a href="https://instagram.com/maryenb_official" target="_blank" rel="noreferrer">인스타그램</a>
          </li>
          <li>사업자등록번호, 주소, 전화번호와 통신판매업 정보는 확인되지 않아 기재하지 않았습니다.</li>
        </ul>
        <p>스마트스토어 상품의 결제·배송·교환·반품 문의는 해당 스토어에 표시된 안내를 확인해 주세요.</p>
      </section>

      <section className="policy-section">
        <h2>개인정보 안내</h2>
        <p>
          현재 회원가입, 주문 접수 및 결제 기능은 제공하지 않으며 이 사이트에서 구매자
          개인정보를 수집하도록 구성하지 않았습니다. 판매 기능을 도입하기 전에는 실제
          처리 항목·목적·보유 기간·위탁 또는 제공 관계·문의 담당자를 확인해 개인정보
          처리방침을 마련해야 합니다.
        </p>
      </section>

      <section className="policy-section">
        <h2>제품 정보와 표현 기준</h2>
        <ul>
          <li>제품명, 성분명, 함량과 용량은 제공 자료의 제품 라벨에 표시된 사실을 따릅니다.</li>
          <li>판매가는 2026년 11월 9일 확인한 네이버 스마트스토어 30ml 단품 기준이며, 할인과 재고는 변경될 수 있습니다.</li>
          <li>제품 사진과 라벨은 원본 그대로 사용하며 제품 병이나 표시 내용을 편집하지 않습니다.</li>
          <li>제품의 성능을 보장하거나 확인되지 않은 사용 경험을 만들어 안내하지 않습니다.</li>
          <li>
            사용 순서는 세안, 세럼, 보습제 순이며 낮에는 선크림을 마지막 단계에 사용합니다.
            처음에는 작은 부위에 먼저 사용해 보고, 불편함이 생기면 사용을 중단하세요.
            사용 전 제품 라벨의 주의사항을 확인하세요.
          </li>
        </ul>
        <p className="cosmetic-disclaimer">
          피부 겉모습을 위한 화장품입니다. 개인에 따라 경험은 다를 수 있습니다.
        </p>
        <p>
          ANC5와 ANC10은 현재 한국에서 판매하지 않는 제품입니다. 다른 상품은 네이버 스마트스토어
          링크에서 주문 정보를 확인할 수 있으며, 이 사이트 자체에서는 구매할 수 없습니다.
        </p>
      </section>

      <section className="policy-section">
        <h2>브랜드와 판매 권한</h2>
        <p>
          네이버 스마트스토어 판매자 프로필에 주식회사 써티트리와 MaryenB 브랜드가 함께
          소개되어 있습니다. 이 미리보기를 별도 공식 판매처로 운영하거나 주문을 받으려면 사이트
          운영 주체, 브랜드 사용 권한, 공급 및 정산 조건을 권리자와 별도로 확인해야 합니다.
        </p>
      </section>

      <p className="policy-footnote">
        이 안내는 제공된 제작 자료를 바탕으로 한 운영 전 점검용 초안이며, 완성된 약관이나
        법률 자문이 아닙니다. 실제 판매에 필요한 표시와 문서는 판매 주체가 확인하고
        게시해야 합니다.
      </p>
    </section>
  );
}
