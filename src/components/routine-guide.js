import Link from "next/link";
import { Sun, Moon, Sprout } from "lucide-react";

export function RoutineGuide() {
  return <section className="routine-section" id="routine"><div className="section-shell">
    <p className="eyebrow">LESS STEPS, MORE THOUGHT</p><h2>루틴은 가볍게, 시작은 천천히.</h2><p className="guide-intro">6종을 모두 쓸 필요는 없어요. 나에게 필요한 한 병과 익숙한 기본 케어로 시작하세요.</p>
    <div className="routine-cards">
      <article><Sprout size={25} strokeWidth={1.4} /><span className="routine-overline">FIRST STEP</span><h3>처음 쓰는 날</h3><ol><li>귀 뒤나 팔 안쪽에 소량 테스트</li><li>하루 정도 피부 상태 살피기</li><li>새 액티브 세럼은 하나만 시작</li></ol><p>높은 함량이 모든 피부에 더 잘 맞는 것은 아닙니다.</p></article>
      <article><Sun size={25} strokeWidth={1.4} /><span className="routine-overline">MORNING</span><h3>아침 루틴</h3><ol><li>세안 후 마른 피부 준비</li><li>아침 사용이 가능한 세럼을 정한 날에만</li><li>보습제 → 자외선 차단제</li></ol><p>VNC15는 아침 또는 저녁 중 선택. RNT는 아침에 사용하지 않습니다.</p></article>
      <article><Moon size={25} strokeWidth={1.4} /><span className="routine-overline">EVENING</span><h3>저녁 루틴</h3><ol><li>세안 후 마른 피부 준비</li><li>제품별 시작 횟수에 맞춰 세럼 사용</li><li>보습제로 마무리</li></ol><p>RNT는 주 2~3일 밤부터. 하루 1회인 세럼을 저녁에 한 번 더 바르지 마세요.</p></article>
    </div>
    <div className="routine-note"><strong>RNT를 고르셨다면</strong><p>임신·수유 중이거나 임신 계획이 있다면 전문가와 상의하기 전에는 사용하지 마세요. 저녁에만 사용하며, 매일 아침 자외선 차단제를 챙기세요.</p></div>
    <div className="home-faq"><div><p className="eyebrow">BEFORE YOUR FIRST BOTTLE</p><h2>선택 전에, 자주 묻는 이야기</h2><Link className="text-link" href="#compare">성분·사용법 비교로 돌아가기 →</Link></div><div>
      <details><summary>ANC5와 ANC10, 숫자가 높으면 더 좋은가요?</summary><p>두 세럼의 아젤라익애씨드 함량은 5%와 10%입니다. 함량만으로 결과나 순함을 판단할 수 없습니다. 한 가지만 선택해 주 2~3회 소량으로 시작하세요.</p></details>
      <details><summary>피부톤 고민에는 무엇을 비교하면 좋을까요?</summary><p>칙칙함 중심이라면 VNC15, 고르지 않은 피부톤·잡티 고민이라면 TNA5를 살펴보세요. 붉은기가 함께 신경 쓰이면 ANC5·ANC10, 유분·모공이 우선이면 NTZ20의 배합도 비교할 수 있습니다. 이 안내는 효과를 보장하는 추천이 아닙니다.</p></details>
      <details><summary>회원가입 없이 구매 체험을 할 수 있나요?</summary><p>로그인 화면의 ‘게스트로 체험하기’를 선택하면 장바구니와 가상 주문을 이용할 수 있습니다. 배송정보에는 예시 값을 입력해 주세요. 실제 청구·배송은 발생하지 않습니다.</p><Link className="text-link" href="/login?next=%2F%23products">게스트로 시작하기 →</Link></details>
      <details><summary>상품은 어떤 용량으로 구성되어 있나요?</summary><p>현재 시연 쇼핑몰에서는 6종 모두 30ml 옵션으로 구성했습니다. 공식 사이트의 일부 60ml 옵션과 구분해 확인해 주세요.</p></details>
    </div></div>
    <p className="guide-footnote">제품 및 사용 정보는 마리엔비 공식 안내를 참고했습니다. <a href="https://maryenb.co.kr/pages/morning-and-evening-routine" target="_blank" rel="noreferrer">아침·저녁 루틴 원문 ↗</a> · <a href="https://maryenb.co.kr/pages/multiple-actives-caution" target="_blank" rel="noreferrer">액티브 성분 함께 쓰기 안내 ↗</a></p>
  </div></section>;
}
