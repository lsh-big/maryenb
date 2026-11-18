"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { concerns, getRoutineCandidates } from "../data/product-guides";
import { ProductCard } from "./product-card";
import { apiFetch } from "../lib/client-api";
import { formatPrice } from "../lib/products";

const routineStorageKey = "maryenb-one-bottle-answers";
const routineConcerns = [...concerns.slice(1), { id: "unsure", label: "아직 모르겠어요" }];

const experiences = [
  { id: "new", label: "처음이거나 오랜만이에요" },
  { id: "used", label: "사용해 본 적 있어요" },
];

function Options({ name, label, options, onChange, selection }) {
  return <fieldset className="routine-options">
    <legend>{label}</legend>
    <div>{options.map(({ id, label }) => (
      <label key={id}><input type="radio" name={name} value={id} checked={selection === id} onChange={() => onChange(id)} />{label}</label>
    ))}</div>
  </fieldset>;
}

function SerumFacts({ product, candidate = false, sharedRoutine = false }) {
  const { guide } = product;
  return <article className="serum-facts" style={{ "--product-wash": guide.wash, "--product-accent": guide.accent }}>
    <p className="serum-code">{product.code}</p>
    <h3>{product.name}</h3>
    <p>{candidate ? guide.summary : guide.tags.slice(0, 2).join(" · ")}</p>
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
    <Link className={candidate ? "button button-dark" : "text-link"} href={`/products/${product.slug}`} aria-label={`${product.code} 상세 보기`}>상세 보기</Link>
  </article>;
}

export function ProductCollection({ products }) {
  const [filter, setFilter] = useState("all");
  const [answers, setAnswers] = useState({ concern: "", experience: "" });
  const { concern, experience } = answers;

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(routineStorageKey) || "{}");
      setAnswers({
        concern: routineConcerns.some(({ id }) => id === saved?.concern) ? saved.concern : "",
        experience: experiences.some(({ id }) => id === saved?.experience) ? saved.experience : "",
      });
    } catch {
      // Answers can still be selected when browser storage is unavailable.
    }
  }, []);

  function updateAnswer(key, value) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    try {
      sessionStorage.setItem(routineStorageKey, JSON.stringify(next));
    } catch {
      // Keep the current answers in memory.
    }
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
  const answered = Boolean(concern && experience);
  const concernLabel = routineConcerns.find(({ id }) => id === concern)?.label;
  const comparison = [...guided].sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true }));
  const ancPair = comparison.filter(({ code }) => code === "ANC5" || code === "ANC10");
  const hasAncPair = ancPair.length === 2;
  const sharedRoutine = hasAncPair && ancPair[0].guide.timing === ancPair[1].guide.timing
    && ancPair[0].guide.frequency === ancPair[1].guide.frequency;
  const otherProducts = hasAncPair ? comparison.filter((product) => !ancPair.includes(product)) : comparison;

  return <>
    <section className="one-bottle" id="one-bottle" tabIndex={-1} aria-labelledby="one-bottle-title">
      <h2 id="one-bottle-title">마리엔비의 한 병 루틴</h2>
      <p>고민과 사용 경험을 선택하면 공식 제품 안내에서 살펴볼 세럼을 보여드려요.</p>
      <Options name="routine-concern" label="가장 신경 쓰이는 피부 고민" options={routineConcerns} selection={concern} onChange={(value) => updateAnswer("concern", value)} />
      <Options name="routine-experience" label="액티브 세럼 사용 경험" options={experiences} selection={experience} onChange={(value) => updateAnswer("experience", value)} />
      <div className="routine-result-heading" aria-live="polite">
        {answered && (candidates.length
          ? <h3>{concernLabel} 고민에서 살펴볼 세럼 {candidates.length}종</h3>
          : <p>두 답변에 맞춰 후보를 좁힐 안내가 부족해요.</p>)}
      </div>
      {answered && (candidates.length ? <div className="candidate-grid">{candidates.map((p) => <SerumFacts key={p.slug} product={p} candidate />)}</div> : <a className="text-link" href="#compare">6종 전체 비교하기 →</a>)}
    </section>

    <section className="products-section" id="products">
      <h2>세럼 6종 둘러보기</h2>
      <div className="concern-filters" role="group" aria-label="피부 고민별 세럼 보기">{concerns.map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>
      <p className="collection-count" role="status">{concerns.find((c) => c.id === filter)?.label} · {filtered.length}종</p>
      <div className="product-grid">{filtered.map((p, index) => <ProductCard key={p.slug} product={p} index={index} />)}</div>
    </section>

    <section className="serum-comparison" id="compare" tabIndex={-1}>
      <h2>6종 성분·사용법 비교</h2>
      {hasAncPair && <section className="anc-comparison" aria-labelledby="anc-comparison-title">
        <h3 id="anc-comparison-title">ANC5와 ANC10 나란히 보기</h3>
        {sharedRoutine && <p>공통 안내 · 사용 시간은 {ancPair[0].guide.timing}. 첫 사용은 {ancPair[0].guide.frequency} 시작하세요.</p>}
        <div className="serum-facts-grid">{ancPair.map((p) => <SerumFacts key={p.slug} product={p} sharedRoutine={sharedRoutine} />)}</div>
        <p className="guide-footnote">병풀 추출물 함량은 웹 안내와 제공 라벨이 달라 실제 포장의 최신 표시를 확인해 주세요.</p>
      </section>}
      <div className="serum-facts-grid">{otherProducts.map((p) => <SerumFacts key={p.slug} product={p} />)}</div>
    </section>
  </>;
}
