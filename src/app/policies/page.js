import Link from "next/link";
import { seller } from "../../data/seller";
import { isVirtualDatabase } from "../../lib/database-mode";
import { deliveryTerms } from "../../lib/sales-config";

export const metadata = {
  title: "판매자·이용·개인정보 안내",
};

export default function PoliciesPage() {
  const virtual = isVirtualDatabase();
  const delivery = deliveryTerms(virtual);
  return (
    <section className="policy-shell">
      <Link className="back-link" href="/">
        ← 홈으로
      </Link>
      <p className="eyebrow">PRE-LAUNCH INFORMATION</p>
      <h1>판매자·이용 안내</h1>
      <div className="policy-alert">
        자체 주문·결제는 가맹점 계약, 판매자 정보, 개인정보 처리방침 및 배송·반품 조건의
        설정을 마친 후 제공됩니다. 현재 판매 준비 중이며 결제수단별 이용 가능 여부는 주문서에서 확인할 수 있습니다.
      </div>

      <section className="policy-section">
        <h2>사이트 운영 사업자 정보</h2>
        <p>
          운영자가 제공한 사업자등록증명에 기재된 사업자 정보입니다.
        </p>
        <ul>
          <li>상호: {seller.name}</li>
          <li>대표자: {seller.representative}</li>
          <li>사업자등록번호: {seller.registrationNumber}</li>
          <li>사업장 소재지: {seller.address}</li>
          <li>업태: {seller.businessType}</li>
          <li>종목: {seller.businessCategory}</li>
        </ul>
        <p>이 사이트에서 상품을 장바구니에 담고 주문서를 작성할 수 있습니다. 결제·배송·교환·반품 조건은 판매 서비스 활성화 전에 확정하여 안내합니다.</p>
      </section>

      <section className="policy-section" id="delivery">
        <h2>배송·교환·반품 안내</h2>
        <dl className="routine-facts">
          <div><dt>배송비</dt><dd>{delivery.shipping}</dd></div>
          <div><dt>발송 기준</dt><dd>{delivery.dispatch}</dd></div>
          <div><dt>교환·반품</dt><dd>{delivery.returns}</dd></div>
        </dl>
      </section>

      <section className="policy-section">
        <h2>개인정보 안내</h2>
        <p>
          주문 기능 활성화 시 이름, 이메일, 연락처, 우편번호와 배송주소가 주문 및 배송 처리를 위해 저장됩니다.
          결제 인증정보는 결제사 창에서 입력합니다. 판매 기능을 도입하기 전에는 실제
          처리 항목·목적·보유 기간·위탁 또는 제공 관계·문의 담당자를 확인해 개인정보
          처리방침을 마련해야 합니다.
        </p>
      </section>

      <section className="policy-section">
        <h2>구매 후기 공개 안내</h2>
        <p>등록한 별점, 후기 본문, 첨부 사진과 작성일이 상품 페이지에 공개됩니다. 구매 회원으로 표시되며 계정 이름이나 주문번호는 후기에 표시되지 않습니다. 사진에는 사람의 얼굴, 배송 송장과 같은 개인정보가 보이지 않도록 확인해 주세요. 작성자는 상품 페이지에서 자신의 후기와 사진을 삭제할 수 있습니다.</p>
      </section>

      <section className="policy-section">
        <h2>제품 정보와 표현 기준</h2>
        <ul>
          <li>제품명, 성분명, 함량과 용량은 제공 자료의 제품 라벨에 표시된 사실을 따릅니다.</li>
          <li>현재 판매가는 상품 상세와 주문서에서 확인할 수 있습니다.</li>
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
          6종 세럼은 이 사이트의 상품 상세, 장바구니와 주문서에서 구매를 진행합니다.
          실결제는 결제 서비스 설정 완료 후 가능합니다.
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
