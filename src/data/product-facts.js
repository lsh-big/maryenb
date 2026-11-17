export const factsCheckedAt = "2026-11-17";
export const factSources = {
  comparison: "https://maryenb.co.kr/pages/compare-serums",
  ingredients: "https://maryenb.co.kr/pages/ingredients",
  faq: "https://maryenb.co.kr/pages/maryenb-brand-faq",
};

// Official positioning/ingredient information is not a finished-product efficacy test.
const shared = {
  clinical: null,
  irritationTest: null,
  verifiedReviews: [],
  fragrance: "제품별 향료 유무를 확인할 수 있는 자료를 추가 확인 중입니다. 무향·향료 무첨가로 단정하지 않습니다.",
  sensoryUnknown: "끈적임·흡수 속도·잔향의 실측 자료와 제형 사진·사용 영상은 확보하지 못했습니다.",
  makeup: "메이크업 전 밀림이나 화장 지속력에 대한 확인 자료는 없습니다.",
  suitability: "건성·지성·민감성에 대한 적합 판정이나 시험 결과는 확인하지 못했습니다. 피부 타입 이름보다 현재 고민·성분·사용법을 함께 살펴보세요.",
};

export const productFacts = {
  VNC15: {
    ...shared, mainConcern: "칙칙해 보이는 피부톤", positioning: "공식 안내가 제시하는 주력 고민입니다. 톤 개선 수치나 변화 기간을 보장하는 표현은 아닙니다.",
    roles: [
      ["아스코빅애씨드 15%", "칙칙함과 고르지 않은 톤을 살펴보는 이 세럼의 중심 성분입니다. 비타민C 유도체와 구분해 표시합니다."],
      ["알부틴 1% · 나이아신아마이드 1%", "비타민C와 함께 배합된 보조 성분입니다. 이 조합의 효과 크기를 보여 주는 완제품 시험자료는 확인하지 못했습니다."],
    ],
    sensory: "공식 비교표는 수분 베이스 세럼으로 소개합니다. 별도 사용감 테스트 결과는 아닙니다.",
    makeup: "아침 또는 저녁 중 하루 1회부터 시작할 수 있습니다. 메이크업 전 흡수감·밀림을 검증한 자료는 없습니다.",
    source: "https://maryenb.co.kr/pages/vitamin-c-guide",
  },
  ANC5: {
    ...shared, mainConcern: "눈에 띄는 붉은기", positioning: "공식 안내가 소개하는 붉은 피부 외관에 관한 고민입니다. 홍조·피부질환의 치료 효과를 뜻하지 않습니다.",
    roles: [
      ["아젤라익애씨드 5%", "붉은기와 고르지 않은 피부 외관을 살펴보는 배합의 중심입니다. 5%라는 숫자가 순함을 보장하지는 않습니다."],
      ["나이아신아마이드 1% · 병풀 추출물", "아젤라익애씨드와 함께 들어 있는 보조 성분입니다. 병풀 함량은 공식 웹과 제공 라벨 자료가 달라 아래 안내를 확인하세요."],
    ],
    sensory: "공식 비교표는 가벼운 수분 베이스 세럼으로 소개합니다. 별도 사용감 테스트 결과는 아닙니다.",
    source: "https://maryenb.co.kr/pages/azelaic-acid-guide",
  },
  ANC10: {
    ...shared, mainConcern: "눈에 띄는 붉은기", positioning: "ANC5와 같은 고민 범주를 소개하는 별도 배합입니다. 더 높은 함량이 더 좋은 결과를 의미하지 않습니다.",
    roles: [
      ["아젤라익애씨드 10%", "붉은기와 고르지 않은 피부 외관을 살펴보는 배합의 중심입니다. ANC5와 효과를 직접 비교한 시험자료는 확인하지 못했습니다."],
      ["나이아신아마이드 1% · 병풀 추출물", "아젤라익애씨드와 함께 배합된 성분입니다. 병풀 함량은 웹과 제공 라벨의 표시가 다르므로 최신 포장을 확인하세요."],
    ],
    sensory: "공식 비교표는 가벼운 수분 베이스 세럼으로 소개합니다. 별도 사용감 테스트 결과는 아닙니다.",
    source: "https://maryenb.co.kr/pages/azelaic-acid-guide",
  },
  RNT: {
    ...shared, mainConcern: "잔주름·거칠어 보이는 피부결", positioning: "공식 안내가 제시하는 저녁용 세럼의 고민 범주입니다. 탄력 증가율이나 주름 개선 수치를 확인한 자료는 없습니다.",
    roles: [
      ["레티놀 5000 IU/g", "잔주름과 피부결의 외관을 살펴보는 배합의 중심입니다. 표시 단위를 그대로 사용하며 퍼센트로 임의 변환하지 않습니다."],
      ["나이아신아마이드 1% · 트라넥사믹애씨드 1%", "레티놀과 함께 담은 보조 성분입니다. 다른 세럼을 추가해도 안전하다는 근거로 해석하지 않습니다."],
    ],
    sensory: "공식 비교표에는 RNT의 사용감 설명이 없습니다. 산뜻함·빠른 흡수·무끈적임을 확인된 특징으로 표시하지 않습니다.",
    makeup: "RNT는 저녁에만 사용합니다. 메이크업 직전이나 아침용 세럼으로 안내하지 않습니다.",
    suitability: "건조하게 느껴지면 횟수를 늘리지 말고 보습을 챙기세요. 임신·수유 중 또는 임신 계획 중이라면 전문가와 상의하기 전에는 사용하지 마세요.",
    source: "https://maryenb.co.kr/pages/retinol-guide",
  },
  TNA5: {
    ...shared, mainConcern: "잡티로 고르지 않아 보이는 톤", positioning: "공식 안내가 제시하는 피부 겉모습의 고민입니다. 기미 치료나 잡티 제거를 보장하는 의미는 아닙니다.",
    roles: [
      ["트라넥사믹애씨드 5%", "고르지 않은 피부톤·잡티 고민을 살펴보는 배합의 중심입니다. 함량만으로 결과의 크기를 판단할 수 없습니다."],
      ["나이아신아마이드 3% · 알부틴 2%", "트라넥사믹애씨드와 함께 배합된 성분입니다. 피부톤 고민을 다루는 전체 성분 조합으로 비교해 보세요."],
    ],
    sensory: "공식 비교표는 가벼운 수분 베이스 세럼으로 소개합니다. 별도 사용감 테스트 결과는 아닙니다.",
    source: "https://maryenb.co.kr/pages/tranexamic-acid-guide",
  },
  NTZ20: {
    ...shared, mainConcern: "번들거림·눈에 띄는 모공", positioning: "공식 제품 안내의 주력 고민입니다. 피지 감소율이나 모공 크기 변화 수치는 공개 시험자료를 확인한 뒤에만 표시합니다.",
    roles: [
      ["나이아신아마이드 20%", "공식 안내는 유분·모공 고민을 위해 넣은 중심 성분으로 설명합니다. 함량이 높으므로 적은 양과 횟수로 시작하세요."],
      ["징크 PCA 2%", "공식 안내는 산뜻한 마무리감을 위해 배합했다고 설명합니다. 금속 아연이 아닌 아연염 성분입니다."],
      ["트라넥사믹애씨드 2%", "공식 안내는 피부톤이 고르게 보이도록 배합했다고 설명합니다. 완제품의 결과 수치로 해석하지 않습니다."],
    ],
    sensory: "공식 제품 안내는 가볍고 물처럼 발리는 사용감으로 소개합니다. 흡수 시간·끈적임을 측정한 결과는 아닙니다.",
    fragrance: "공식 제품 안내에 따르면 인공 향료를 따로 넣지 않았습니다. 원료 고유의 향이 없거나 모든 피부에 무자극이라는 뜻은 아닙니다.",
    source: "https://maryenb.co.kr/products/niacinamide-20-serum-1-fl-oz-ntz20",
  },
};
