# 제품 설명 출처 및 편집 기준

## 구매 판단 정보 7개 항목 (2026-11-17 재확인)

추가 검토: 공식 브랜드 FAQ(`/pages/maryenb-brand-faq`), 성분 목록(`/pages/ingredients`), 나이아신아마이드 가이드(`/pages/niacinamide-guide`), 브랜드 사실 요약(`/pages/maryenb-facts`), 비교표 및 VNC15·RNT 가이드, 공개 열람 가능한 NTZ20 제품 페이지.

`src/data/product-facts.js`가 제품별 주력 고민·성분 배합 역할·사용감·피부 적합성의 확인 범위를 관리합니다. `src/components/product-facts.js`는 자료 출처·확인일과 함께 7개 구매 판단 항목을 표시합니다. 주력 고민은 공식 제품의 포지셔닝이며 치료나 해결 보장이 아닙니다. 성분 배합 설명을 완제품 효과의 시험 근거로 취급하지 않습니다.

검토한 자료에서 제품별 인체적용시험 성적서, 개선 수치·시험 기간·대상·기관·조건, 자극 시험 결과와 검증된 구매 후기 자료를 확보하지 못했습니다. 이를 시험 부재나 리뷰 0개로 단정하지 않고 공개 자료 미확인/검증 자료 미등록으로 표시합니다. 가상 주문과 AI 이미지는 근거·후기에 포함하지 않습니다.

NTZ20의 인공 향료 미첨가는 해당 공식 제품 페이지의 브랜드 설명으로 한정합니다. 나머지 5종은 제품별 향료 자료를 추가 확인해야 하므로 무향·무자극으로 표현하지 않습니다. RNT의 사용감은 자료 미확인, 다른 제품의 수분 베이스 표현도 브랜드 설명으로 구분합니다. 실제 제형 사진·영상, 끈적임·흡수 시간·메이크업 전 밀림 결과는 확보하지 못해 만들어 넣지 않았습니다.

가격은 기존 시연 설정이며 공식 현재가로 표시하지 않습니다. 기존 compareAtPrice 필드는 보존하지만 취소선 할인 표시를 제거했습니다. 30ml 단품의 1ml당 가격은 설정가÷30으로 계산하며 배송비는 현재 주문 설정을 읽고, 시연 배송비 0원은 가상 주문 기준이라고 표시합니다. 별도 세트·쿠폰은 현재 구현되어 있지 않습니다.

시험·후기와 근거 정보를 먼저 읽도록 구매 판단 정보 섹션을 AI 얼굴 예시보다 앞에 배치했습니다.

2026-11-17 공식 한국어 사이트의 브랜드 소개, 성분 가이드, 비교표와 루틴 안내를 확인했습니다. 제품 경로 일부는 직접 열람이 제한되어 관련 공식 성분 가이드로 교차 확인했습니다. 원문을 그대로 복제하지 않고 선택에 필요한 특징과 시작 방법을 요약했습니다.

- 브랜드: https://maryenb.co.kr/pages/brand-story-korean-skincare
- 6종 비교: https://maryenb.co.kr/pages/compare-serums
- VNC15: https://maryenb.co.kr/pages/vitamin-c-guide
- ANC5/ANC10: https://maryenb.co.kr/pages/azelaic-acid-guide
- RNT: https://maryenb.co.kr/pages/retinol-guide
- TNA5: https://maryenb.co.kr/pages/tranexamic-acid-guide
- NTZ20: https://maryenb.co.kr/products/niacinamide-20-serum-1-fl-oz-ntz20
- 루틴: https://maryenb.co.kr/pages/morning-and-evening-routine
- 복수 액티브: https://maryenb.co.kr/pages/multiple-actives-caution

## 정보가 다른 부분

ANC5/ANC10 병풀 추출물은 공식 웹 안내가 1%, 기존 제공 라벨 자료가 0.1%입니다. 기존 라벨 필드는 수정하지 않았고 상세페이지에서 차이를 명시했습니다. 배합 강조 카드에서는 함량 숫자 대신 CICA로 표시합니다. 실제 포장의 최신 표시를 우선 확인하도록 안내합니다.

NTZ20의 기존 라벨 자료는 Zinc 2%로 기록되어 있으나 공식 설명은 Zinc PCA 2%입니다. 배합 강조와 설명에서는 공식 안내에 따라 징크 PCA로 구체적으로 소개하고 기존 라벨 문자열은 유지했습니다.

## 구현

제품 특징은 `src/data/product-guides.js`에서 관리하며 `serializeProduct`가 최신 내용을 결합합니다. 이미 저장된 가상 재고·가격·주문에 설명이 덮어씌워져 재고가 초기화되는 일을 피합니다. 시연 판매가는 운영자 요청에 따라 기존 설정을 유지하며 공식 판매가나 실측 사용감·임상 결과로 표현하지 않습니다.

RNT의 사용감은 확인된 설명이 없어 임의로 만들지 않았습니다. 저녁 전용, 주 2~3일 시작 및 임신·수유·임신 계획 시 주의사항을 별도로 표시했습니다. 고함량의 우월성, 제품 조합의 안전성, 효능 보장, 임의 후기·평점은 추가하지 않았습니다.
