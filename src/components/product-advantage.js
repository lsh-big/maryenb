import { comparisonCheckedAt, productComparisons } from "../data/product-comparisons";

export function ProductAdvantage({ code }) {
  const comparison = productComparisons[code];
  if (!comparison) return null;
  return <section className="product-advantage" aria-label={`${code} 배합 선택 포인트`}>
    <p className="eyebrow">WHY CHOOSE MARYENB</p><h3>{comparison.title}</h3><p className="advantage-description">{comparison.description}</p>
    <details className="competitor-details"><summary>타사 공식 배합과 나란히 보기</summary><p className="competitor-scope">비교 대상: {comparison.competitor} · 특정 제품과의 표기 정보 비교입니다.</p><div className="competitor-table-scroll" role="region" aria-label="제품별 공식 표기 비교표" tabIndex={0}><table><caption className="sr-only">마리엔비 {code}와 {comparison.competitor} 비교</caption><thead><tr><th scope="col">비교 항목</th><th scope="col">MaryenB {code}</th><th scope="col">비교 제품</th></tr></thead><tbody>{comparison.rows.map(([label, own, other]) => <tr key={label}><th scope="row">{label}</th><td>{own}</td><td>{other}</td></tr>)}</tbody></table></div><p className="competitor-note">{comparison.note}</p><div className="competitor-sources"><a href={comparison.brandSource} target="_blank" rel="noreferrer">마리엔비 공식 배합 ↗</a>{comparison.textureSource && <a href={comparison.textureSource} target="_blank" rel="noreferrer">마리엔비 공식 제형 설명 ↗</a>}<a href={comparison.competitorSource} target="_blank" rel="noreferrer">비교 제품 공식 자료 ↗</a></div><p className="competitor-audit">확인일 {comparisonCheckedAt} · 브랜드 공식 안내 기준. 제품은 국가·시기별로 변경될 수 있어 구매 전 최신 라벨을 확인하세요. 가격·시험 결과는 비교하지 않았습니다.</p></details>
    <p className="advantage-limit">표기된 배합·제형의 차별점이며, 타사 대비 효능·안전성 우월성을 입증하는 비교시험은 아닙니다.</p>
  </section>;
}
