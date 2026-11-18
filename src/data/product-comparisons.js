export const comparisonCheckedAt = "2026-11-17";
const brandSource = "https://maryenb.co.kr/pages/maryenb-facts";
const azelaicSource = "https://theordinary.com/en-us/azelaic-acid-suspension-10-exfoliator-100407.html";

// A comparison of selected official formula disclosures, not a ranking of efficacy.
export const productComparisons = {
  VNC15: {
    short: "순수 비타민C 15%에 알부틴·나이아신아마이드까지",
    title: "비타민C의 형태와 함께 담은 성분까지 선택하세요",
    description: "아스코빅애씨드 형태의 비타민C에 알부틴과 나이아신아마이드를 함께 배합했습니다. 순수 비타민C와 이 두 보조 성분을 한 병에서 찾는 분에게 선택 포인트가 됩니다.",
    competitor: "The Ordinary Ascorbyl Glucoside Solution 12%",
    competitorSource: "https://theordinary.com/en-us/ascorbyl-glucoside-solution-12-vitamin-c-100405.html",
    brandSource,
    rows: [
      ["비타민C 형태", "아스코빅애씨드 15%", "아스코빌글루코사이드 12% (유도체)"],
      ["함께 담은 성분", "알부틴 1% · 나이아신아마이드 1%", "공개 전성분에 알부틴·나이아신아마이드 표기 없음"],
      ["비교 용량", "30ml", "30ml"],
    ],
    note: "서로 다른 형태의 비타민C입니다. 15%와 12%를 효과의 크기나 자극 정도로 직접 비교하지 않습니다.",
  },
  ANC5: {
    short: "아젤라익애씨드 5%라는 별도 함량 선택지",
    title: "5% 배합과 수분 베이스 세럼을 찾는다면",
    description: "비교 제품의 10% 서스펜션과 달리 아젤라익애씨드 5%를 선택할 수 있습니다. 나이아신아마이드와 병풀 추출물도 함께 담아, 원하는 함량·배합·제형을 기준으로 고르기 좋습니다.",
    competitor: "The Ordinary Azelaic Acid Suspension 10%",
    competitorSource: azelaicSource,
    brandSource,
    rows: [
      ["아젤라익애씨드", "5%", "10%"],
      ["배합 차이", "나이아신아마이드 1% · 병풀 추출물 함유", "토코페롤·디메치콘 등 함유 (나이아신아마이드·병풀 추출물은 공개 전성분에 표기 없음)"],
      ["공식 제형 설명", "가벼운 수분 베이스 세럼", "크림 같은 서스펜션"],
    ],
    note: "낮은 함량이 더 순하거나 민감 피부에 더 적합하다는 뜻은 아닙니다. 병풀 함량은 공식 웹과 제공 라벨이 달라 숫자 비교에서 제외했습니다.",
    textureSource: "https://maryenb.co.kr/pages/compare-serums",
  },
  ANC10: {
    short: "아젤라익 10%에 나이아신아마이드·병풀을 함께",
    title: "같은 아젤라익 10%, 함께 담은 성분과 제형의 차이",
    description: "비교 제품과 아젤라익애씨드 표기 함량은 같지만, 마리엔비는 나이아신아마이드와 병풀 추출물을 함께 배합했습니다. 가벼운 수분 베이스 세럼이라는 제형 선택지도 살펴보세요.",
    competitor: "The Ordinary Azelaic Acid Suspension 10%",
    competitorSource: azelaicSource,
    brandSource,
    rows: [
      ["아젤라익애씨드", "10%", "10%"],
      ["배합 차이", "나이아신아마이드 1% · 병풀 추출물 함유", "토코페롤·디메치콘 등 함유 (나이아신아마이드·병풀 추출물은 공개 전성분에 표기 없음)"],
      ["공식 제형 설명", "가벼운 수분 베이스 세럼", "크림 같은 서스펜션"],
    ],
    note: "같은 함량이어도 사용감과 피부 반응은 다를 수 있습니다. 더 빠른 흡수·무끈적임·효과 우월성을 비교한 자료는 아닙니다. 병풀의 함량 숫자는 자료 차이로 비교에서 제외했습니다.",
    textureSource: "https://maryenb.co.kr/pages/compare-serums",
  },
  RNT: {
    short: "레티놀에 나이아신아마이드·트라넥사믹애씨드를 한 병에",
    title: "레티놀과 두 보조 성분을 함께 담은 배합",
    description: "레티놀 단위 숫자의 우열보다 함께 담은 성분을 보세요. RNT는 레티놀에 나이아신아마이드와 트라넥사믹애씨드를 각각 1%씩 더한 조합을 찾는 분에게 선택지가 됩니다.",
    competitor: "The Ordinary Retinol 0.2% in Squalane",
    competitorSource: "https://theordinary.com/en-us/retinol-02-in-squalane-serum-100439.html",
    brandSource,
    rows: [
      ["레티놀 표기", "5000 IU/g", "0.2%"],
      ["함께 담은 성분", "나이아신아마이드 1% · 트라넥사믹애씨드 1%", "스쿠알란 · 호호바씨오일 등 함유"],
      ["비교 용량", "30ml", "30ml"],
    ],
    note: "IU/g을 퍼센트로 임의 환산하지 않았습니다. 레티놀 강도·흡수감·효과를 직접 비교하지 않으며 RNT는 저녁에만 사용합니다.",
  },
  TNA5: {
    short: "트라넥사믹 5% + 나이아신아마이드 3% + 알부틴 2%",
    title: "트라넥사믹애씨드 중심으로 세 가지 성분을 함께",
    description: "TNA5는 트라넥사믹애씨드 5%에 나이아신아마이드 3%와 알부틴 2%를 조합했습니다. 비교 제품의 비타민C 유도체·아사이 배합과 구분해, 원하는 피부톤 성분 조합으로 선택할 수 있습니다.",
    competitor: "The INKEY List Tranexamic Acid Serum",
    competitorSource: "https://www.theinkeylist.com/products/tranexamic-acid-serum",
    brandSource,
    rows: [
      ["트라넥사믹애씨드", "5%", "2%"],
      ["함께 담은 주요 성분", "나이아신아마이드 3% · 알부틴 2%", "아사이 추출물 2% · 비타민C 유도체 2%"],
      ["비교 용량", "30ml", "30ml"],
    ],
    note: "함량과 배합의 차이입니다. 잡티 개선률·개선 속도·자극 정도가 더 우수하다는 비교 결과를 의미하지 않습니다.",
  },
  NTZ20: {
    short: "나이아신아마이드·징크 PCA에 트라넥사믹까지",
    title: "나이아신아마이드 20%에 보조 성분 조합까지",
    description: "니아신·징크 배합을 비교할 때 트라넥사믹애씨드의 동시 배합도 살펴보세요. NTZ20은 나이아신아마이드 20%, 징크 PCA 2%, 트라넥사믹애씨드 2% 조합을 한 병에 담았습니다.",
    competitor: "The Ordinary Niacinamide 10% + Zinc 1%",
    competitorSource: "https://theordinary.com/en-us/niacinamide-10-zinc-1-serum-100436.html",
    brandSource,
    rows: [
      ["나이아신아마이드", "20%", "10%"],
      ["보조 성분", "징크 PCA 2% · 트라넥사믹애씨드 2%", "징크 1% 표기 · 전성분에 Zinc PCA 함유"],
      ["트라넥사믹애씨드", "2% 표기", "공개 전성분에 표기 없음"],
    ],
    note: "더 높은 나이아신아마이드 함량이 더 좋은 결과나 높은 피부 적합성을 뜻하지 않습니다. 두 제품의 징크 표기는 동일 기준의 수치로 단정하지 않았습니다.",
  },
};
