import Link from "next/link";
import { Sun, Moon, Sprout } from "lucide-react";

export function RoutineGuide() {
  return <section className="routine-section" id="routine"><div className="section-shell">
    <h2>루틴은 가볍게, 시작은 천천히.</h2><p className="guide-intro">나에게 필요한 세럼 한 병과 익숙한 기본 케어로 시작하세요.</p>
    <div className="routine-cards">
      <article><Sprout size={25} strokeWidth={1.4} /><h3>처음 쓰는 날</h3><ol><li>귀 뒤나 팔 안쪽에 소량 테스트</li><li>하루 정도 피부 상태 살피기</li><li>새 액티브 세럼은 하나만 시작</li></ol><p>높은 함량이 모든 피부에 더 잘 맞는 것은 아닙니다.</p></article>
      <article><Sun size={25} strokeWidth={1.4} /><h3>아침 루틴</h3><ol><li>세안 후 마른 피부 준비</li><li>아침 사용이 가능한 세럼을 정한 날에만</li><li>보습제 → 자외선 차단제</li></ol><p>RNT는 저녁에 사용하고, 다른 세럼은 제품별 사용 시간을 확인하세요.</p></article>
      <article><Moon size={25} strokeWidth={1.4} /><h3>저녁 루틴</h3><ol><li>세안 후 마른 피부 준비</li><li>제품별 시작 횟수에 맞춰 세럼 사용</li><li>보습제로 마무리</li></ol><p>RNT는 주 2~3일 밤부터. 하루 1회인 세럼을 저녁에 한 번 더 바르지 마세요.</p></article>
    </div>
    <div className="routine-note"><strong>RNT를 고르셨다면</strong><p>임신·수유 중이거나 임신 계획이 있다면 사용하지 마세요. 저녁에만 사용하며, 매일 아침 자외선 차단제를 챙기세요.</p></div>
    <div className="home-faq"><div><h2>선택 전에, 자주 묻는 이야기</h2><Link className="text-link" href="#compare">성분·사용법 비교로 돌아가기 →</Link></div><div>
      <details><summary>VNC15·ANC5·ANC10을 국내에서 구매할 수 있나요?</summary><p>세 제품은 해외 전용으로 국내에서 판매하지 않습니다. 국내 판매 제품은 RNT·TNA5·NTZ20입니다.</p></details>
      <details><summary>피부 고민별로 어떤 국내 제품을 살펴볼 수 있나요?</summary><p>고르지 않은 피부톤·잡티에는 TNA5, 유분·모공에는 NTZ20, 잔주름·피부결에는 RNT의 성분과 사용법을 살펴보세요.</p></details>
      <details><summary>회원가입 없이 구매 체험을 할 수 있나요?</summary><p>상품을 담고 주문서에서 비회원 가상 주문을 선택하세요. 예시 배송정보를 채워 주문할 수 있습니다. 실제 청구·배송은 발생하지 않습니다.</p></details>
      <details><summary>국내 판매 세럼은 어떤 용량이 있나요?</summary><p>RNT·TNA5·NTZ20 모두 30ml와 60ml로 판매됩니다. 상품 상세에서 용량을 선택해 사진과 가격 정보를 확인할 수 있습니다.</p></details>
    </div></div>
    <p className="guide-footnote">제품 및 사용 정보는 마리엔비 공식 안내를 참고했습니다. <a href="https://maryenb.co.kr/pages/morning-and-evening-routine" target="_blank" rel="noreferrer">아침·저녁 루틴 원문 ↗</a> · <a href="https://maryenb.co.kr/pages/multiple-actives-caution" target="_blank" rel="noreferrer">액티브 성분 함께 쓰기 안내 ↗</a></p>
  </div></section>;
}
