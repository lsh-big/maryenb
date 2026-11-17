# 제품 설명 출처 및 편집 기준

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
