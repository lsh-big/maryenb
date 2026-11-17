"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { concerns } from "../data/product-guides";
import { ProductCard } from "./product-card";
import { apiFetch } from "../lib/client-api";

export function ProductCollection({ products }) {
  const [concern, setConcern] = useState("all");
  const [inventory, setInventory] = useState([]);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PAGES_DEMO !== "true") return;
    apiFetch("/api/products").then((r) => r.json()).then(setInventory).catch(() => {});
  }, []);
  const currentProducts = products.map((product) => ({ ...product, ...inventory.find((p) => p.slug === product.slug) }));
  const filtered = currentProducts.filter((p) => concern === "all" || p.guide?.concerns.includes(concern));
  return <>
    <div className="concern-filters" role="group" aria-label="피부 고민별 세럼 보기">{concerns.map((item) => <button key={item.id} type="button" aria-pressed={concern === item.id} onClick={() => setConcern(item.id)}>{item.label}</button>)}</div>
    <p className="collection-count" role="status">{concerns.find((c) => c.id === concern)?.label} · {filtered.length}종 <a href="#compare">성분·사용법 한눈에 비교 ↗</a></p>
    <div className="product-grid">{filtered.map((product, index) => <ProductCard key={product.slug} product={product} index={index} />)}</div>
    {!filtered.length && <p className="payment-alert">해당 고민으로 안내된 제품이 없습니다. 전체 세럼을 확인해 주세요.</p>}
    <section className="serum-comparison" id="compare"><p className="eyebrow">COMPARE YOUR DAILY RITUAL</p><h2>숫자보다, 나에게 맞는 루틴</h2><p className="guide-intro">핵심 성분과 시작 방법을 나란히 놓고 비교해 보세요. 이 사이트는 30ml 옵션을 소개합니다.</p>
      <div className="comparison-scroll" tabIndex={0} role="region" aria-label="세럼 6종 비교표"><table><caption className="sr-only">마리엔비 세럼의 고민, 주요 성분, 시작 빈도 비교</caption><thead><tr><th scope="col">세럼</th><th scope="col">살펴볼 고민</th><th scope="col">주성분</th><th scope="col">처음 사용할 때</th><th scope="col">시간대</th></tr></thead><tbody>{products.filter((p) => p.guide).map((p) => <tr key={p.slug}><th scope="row"><Link href={`/products/${p.slug}`} style={{ color: p.guide.accent }}>{p.code} ↗</Link></th><td>{p.guide.tags.slice(0,2).join(" · ")}</td><td>{p.guide.focus}</td><td>{p.guide.frequency}</td><td>{p.guide.timing}</td></tr>)}</tbody></table></div>
      <p className="guide-footnote">함량이 높다고 더 좋은 결과를 의미하지 않습니다. ANC5와 ANC10은 함께 겹쳐 바르는 단계가 아닙니다. 사용 전 최신 제품 라벨을 확인하세요.</p>
    </section>
  </>;
}
