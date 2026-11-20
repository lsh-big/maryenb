"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { concerns, getRoutineCandidates } from "../data/product-guides";
import { ProductCard } from "./product-card";
import { ProductArt } from "./product-art";
import { apiFetch } from "../lib/client-api";
import { formatPrice } from "../lib/products";

const emptyAnswers = { concern: "", experience: "" };
const routineConcerns = [...concerns.slice(1), { id: "unsure", label: "아직 모르겠어요" }];

const experiences = [
  { id: "new", label: "처음이거나 오랜만이에요" },
  { id: "used", label: "사용해 본 적 있어요" },
];
const comparisonTabs = [
  { id: "all", label: "6종 비교" },
  { id: "niacinamide", label: "나이아신아마이드" },
];
const niacinamideLevels = ["1%", "3%", "20%"];

function Options({ name, label, options, onChange, selection }) {
  return <fieldset className="routine-options">
    <legend>{label}</legend>
    <div>{options.map(({ id, label }) => (
      <label key={id}><input type="radio" name={name} value={id} autoComplete="off" checked={selection === id} onChange={() => onChange(id)} />{label}</label>
    ))}</div>
  </fieldset>;
}

function SerumFacts({ product, sharedRoutine = false }) {
  const { guide } = product;
  return <article className="serum-facts" style={{ "--product-wash": guide.wash, "--product-accent": guide.accent }}>
    <p className="serum-code">{product.code}</p>
    <h3>{product.name}</h3>
    <p>{guide.tags.slice(0, 2).join(" · ")}</p>
    <dl>
      <div><dt>주요 성분</dt><dd className="serum-ingredients">
        {guide.points.map(([amount, ingredient], index) => (
          <span key={ingredient}>
            {ingredient === "레티놀 · IU/g" ? "레티놀" : ingredient}
            {amount !== "CICA" && <> <strong className={index === 0 ? "serum-amount" : undefined}>{amount}{ingredient.endsWith("IU/g") && " IU/g"}</strong></>}
          </span>
        ))}
      </dd></div>
      {!sharedRoutine && <>
        <div><dt>사용 시간</dt><dd>{guide.timing}</dd></div>
        <div><dt>시작 빈도</dt><dd>{guide.frequency}</dd></div>
      </>}
      <div><dt>판매가</dt><dd>{product.price == null ? formatPrice(null) : `${formatPrice(product.price)}원`}</dd></div>
    </dl>
    <Link className="text-link" href={`/products/${product.slug}`} aria-label={`${product.code} 상세 보기`}>상세 보기</Link>
  </article>;
}

function SerumCandidate({ product, sharedRoutine }) {
  const { guide } = product;
  const summary = guide.summary.split(". ")[0].replace(/\.$/, "") + ".";
  return <article className="serum-facts serum-candidate"
    style={{ "--product-wash": guide.wash, "--product-accent": guide.accent }}>
    <div className="candidate-overview">
      <ProductArt imageUrl={product.imageUrl} category={product.category} code={product.code} sizes="96px" />
      <div>
        <span className="serum-code">{product.code}</span>
        <h3>{product.name}</h3>
        <p className="candidate-focus">{guide.focus}</p>
      </div>
    </div>
    <p className="candidate-reason">{summary}</p>
    {!sharedRoutine && <p className="candidate-usage">{guide.timing} · {guide.frequency}</p>}
    <div className="candidate-action">
      <strong>{product.price == null ? formatPrice(null) : `${formatPrice(product.price)}원`}</strong>
      <Link className="button button-dark" href={`/products/${product.slug}`} aria-label={`${product.code} 상세 보기`}>상세 보기</Link>
    </div>
  </article>;
}

export function ProductCollection({ products }) {
  const [filter, setFilter] = useState("all");
  const [comparisonTab, setComparisonTab] = useState("all");
  const [niacinamideLevel, setNiacinamideLevel] = useState("1%");
  const [answers, setAnswers] = useState(emptyAnswers);
  const { concern, experience } = answers;

  function updateAnswer(key, value) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function moveComparisonTab(event) {
    const index = comparisonTabs.findIndex(({ id }) => id === comparisonTab);
    const last = comparisonTabs.length - 1;
    const nextIndex = {
      ArrowLeft: (index + last) % comparisonTabs.length,
      ArrowRight: (index + 1) % comparisonTabs.length,
      Home: 0,
      End: last,
    }[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    const next = comparisonTabs[nextIndex].id;
    setComparisonTab(next);
    event.currentTarget.querySelector(`#compare-tab-${next}`)?.focus();
  }
  const [inventory, setInventory] = useState(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PAGES_DEMO !== "true") return;
    apiFetch("/api/products").then((r) => r.ok ? r.json() : null).then(setInventory).catch(() => {});
  }, []);

  const currentProducts = inventory ? products.flatMap((product) => {
    const current = inventory.find((p) => p.slug === product.slug);
    return current ? [{ ...product, ...current }] : [];
  }) : products;
  const filtered = currentProducts.filter((p) => filter === "all" || p.guide?.concerns.includes(filter));
  const guided = currentProducts.filter((p) => p.guide);
  const candidates = getRoutineCandidates(guided, concern, experience);
  const firstCandidateGuide = candidates[0]?.guide;
  const sharedCandidateRoutine = candidates.length > 1 && candidates.every(({ guide }) =>
    guide.timing === firstCandidateGuide.timing && guide.frequency === firstCandidateGuide.frequency);
  const answered = Boolean(concern && experience);
  const concernLabel = routineConcerns.find(({ id }) => id === concern)?.label;
  const comparison = [...guided].sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true }));
  const ancPair = comparison.filter(({ code }) => code === "ANC5" || code === "ANC10");
  const hasAncPair = ancPair.length === 2;
  const sharedRoutine = hasAncPair && ancPair[0].guide.timing === ancPair[1].guide.timing
    && ancPair[0].guide.frequency === ancPair[1].guide.frequency;
  const otherProducts = hasAncPair ? comparison.filter((product) => !ancPair.includes(product)) : comparison;
  const matchingNiacinamide = guided.filter(({ guide }) => guide.points.some(
    ([amount, ingredient]) => ingredient === "나이아신아마이드" && amount === niacinamideLevel,
  ));

  return <>
    <section className="products-section" id="products" aria-labelledby="products-title">
      <h2 id="products-title">피부 고민별 세럼 둘러보기</h2>
      <div className="concern-filters" role="group" aria-label="피부 고민별 세럼 보기">{concerns.map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>
      <p className="collection-count" role="status">{concerns.find((c) => c.id === filter)?.label} · {filtered.length}종</p>
      <div className="product-grid">{filtered.map((p, index) => <ProductCard key={p.slug} product={p} index={index} />)}</div>
    </section>

    <section className="one-bottle" id="one-bottle" tabIndex={-1} aria-labelledby="one-bottle-title">
      <h2 id="one-bottle-title">마리엔비의 한 병 루틴</h2>
      <p>고민과 사용 경험을 선택하면 공식 제품 안내에서 살펴볼 세럼을 보여드려요.</p>
      <Options name="routine-concern" label="가장 신경 쓰이는 피부 고민" options={routineConcerns} selection={concern} onChange={(value) => updateAnswer("concern", value)} />
      <Options name="routine-experience" label="액티브 세럼 사용 경험" options={experiences} selection={experience} onChange={(value) => updateAnswer("experience", value)} />
      <button className="button routine-reset" type="button" onClick={() => setAnswers(emptyAnswers)}>초기화</button>
      <div className="routine-result-heading" aria-live="polite">
        {answered && (candidates.length
          ? <h3>{concernLabel} 고민에서 살펴볼 세럼 {candidates.length}종</h3>
          : <p>두 답변에 맞춰 후보를 좁힐 안내가 부족해요.</p>)}
      </div>
      {answered && (candidates.length ? <>
        {sharedCandidateRoutine && <p className="candidate-shared-usage">
          <strong>공통 사용 안내</strong> {firstCandidateGuide.timing} · {firstCandidateGuide.frequency}
        </p>}
        <div className="candidate-grid">{candidates.map((p) => <SerumCandidate key={p.slug} product={p} sharedRoutine={sharedCandidateRoutine} />)}</div>
      </> : <a className="text-link" href="#compare">6종 전체 비교하기 →</a>)}
    </section>

    <section className="serum-comparison" id="compare" tabIndex={-1} aria-labelledby="compare-title"
      onFocus={(event) => { if (event.target === event.currentTarget) setComparisonTab("all"); }}>
      <h2 id="compare-title">6종 성분·사용법 비교</h2>
      <div className="concern-filters comparison-tabs" role="tablist" aria-label="세럼 비교 방식" onKeyDown={moveComparisonTab}>
        {comparisonTabs.map(({ id, label }) => (
          <button key={id} type="button" role="tab" id={`compare-tab-${id}`} aria-controls={`compare-panel-${id}`}
            aria-selected={comparisonTab === id} tabIndex={comparisonTab === id ? 0 : -1}
            onClick={() => setComparisonTab(id)}>{label}</button>
        ))}
      </div>
      <div role="tabpanel" id="compare-panel-all" aria-labelledby="compare-tab-all" tabIndex={0} hidden={comparisonTab !== "all"}>
        {hasAncPair && <section className="anc-comparison" aria-labelledby="anc-comparison-title">
          <h3 id="anc-comparison-title">ANC5와 ANC10 나란히 보기</h3>
          {sharedRoutine && <p>공통 안내 · 사용 시간은 {ancPair[0].guide.timing}. 첫 사용은 {ancPair[0].guide.frequency} 시작하세요.</p>}
          <div className="serum-facts-grid">{ancPair.map((p) => <SerumFacts key={p.slug} product={p} sharedRoutine={sharedRoutine} />)}</div>
          <p className="guide-footnote">병풀 추출물 함량은 웹 안내와 제공 라벨이 달라 실제 포장의 최신 표시를 확인해 주세요.</p>
        </section>}
        <div className="serum-facts-grid">{otherProducts.map((p) => <SerumFacts key={p.slug} product={p} />)}</div>
      </div>
      <div role="tabpanel" id="compare-panel-niacinamide" aria-labelledby="compare-tab-niacinamide"
        tabIndex={0} hidden={comparisonTab !== "niacinamide"}>
        <p className="comparison-intro">마리엔비 세럼 6종에 담긴 나이아신아마이드 함량을 비교해 보세요.</p>
        <div className="concern-filters comparison-levels" role="group" aria-label="나이아신아마이드 함량">
          {niacinamideLevels.map((level) => (
            <button key={level} type="button" aria-pressed={niacinamideLevel === level}
              onClick={() => setNiacinamideLevel(level)}>{level}</button>
          ))}
        </div>
        <p className="comparison-count" role="status">나이아신아마이드 {niacinamideLevel} · {matchingNiacinamide.length}종</p>
        <div className="product-grid comparison-product-grid">
          {matchingNiacinamide.map((product) => (
            <ProductCard key={product.slug} product={product} ingredientPrefix="주성분 · " detailLabel="제품 보기" />
          ))}
        </div>
      </div>
    </section>
  </>;
}
