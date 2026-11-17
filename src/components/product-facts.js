"use client";

import { useEffect, useState } from "react";
import { productFacts, factsCheckedAt, factSources } from "../data/product-facts";
import { formatPrice } from "../lib/products";
import { apiFetch } from "../lib/client-api";

export function ProductFacts({ product }) {
  const facts = productFacts[product.code];
  const [shippingFee, setShippingFee] = useState(null);
  const [virtual, setVirtual] = useState(true);
  useEffect(() => { apiFetch("/api/checkout").then((r) => r.json()).then((data) => { setShippingFee(data.shippingFee); setVirtual(Boolean(data.virtual)); }).catch(() => {}); }, []);
  if (!facts) return null;
  return <section className="product-facts" id="product-facts" aria-labelledby="product-facts-title">
    <p className="eyebrow">KNOW WHAT YOU CHOOSE</p><h2 id="product-facts-title">구매 전에 확인할 7가지</h2><p className="guide-intro">공식 설명, 확인되지 않은 자료, 이 사이트의 시연 설정을 구분했습니다.</p>
    <div className="fact-grid">
      <article className="fact-card"><span className="fact-number">01</span><h3>주력 피부 고민</h3><span className="fact-badge">공식 안내</span><strong className="fact-focus">{facts.mainConcern}</strong><p>{facts.positioning}</p><Source href={facts.source}>제품·성분 안내</Source></article>
      <article className="fact-card"><span className="fact-number">02</span><h3>효과의 근거</h3><span className="fact-badge fact-unconfirmed">공개 자료 미확인</span><p>검토한 공식 안내와 제공 자료에서 이 제품의 인체적용시험 성적서를 확인하지 못했습니다. 시험이 없다는 뜻은 아닙니다.</p><dl className="fact-rows"><div><dt>개선 수치</dt><dd>확인 자료 없음</dd></div><div><dt>시험 기간·대상</dt><dd>확인 자료 없음</dd></div><div><dt>기관·조건·방법</dt><dd>확인 자료 없음</dd></div></dl><p className="fact-note">성분 설명과 AI 얼굴 이미지는 완제품 효과의 시험 근거가 아닙니다.</p></article>
      <article className="fact-card fact-wide"><span className="fact-number">03</span><h3>핵심 성분과 배합에서의 역할</h3><span className="fact-badge">공식 성분 안내</span><div className="ingredient-role-list">{facts.roles.map(([name, role]) => <div key={name}><strong>{name}</strong><p>{role}</p></div>)}</div><p className="fact-note">함량은 배합을 구분하는 정보입니다. 더 높은 수치가 더 큰 효과나 더 높은 피부 적합성을 증명하지 않습니다.</p>{product.guide?.labelNote && <p className="label-difference">{product.guide.labelNote}</p>}<Source href={factSources.ingredients}>공식 성분 가이드</Source><Source href={facts.source}>제품별 안내</Source></article>
      <article className="fact-card"><span className="fact-number">04</span><h3>사용감 · 제형</h3><span className="fact-badge">브랜드 설명 기준</span><p>{facts.sensory}</p><p>{facts.sensoryUnknown}</p><p>{facts.makeup}</p><p className="fact-note">병·라벨 사진과 가상 얼굴 이미지는 실제 제형 촬영 자료가 아닙니다.</p><Source href={factSources.comparison}>공식 사용감 비교</Source></article>
      <article className="fact-card"><span className="fact-number">05</span><h3>피부 적합성 · 향료</h3><span className="fact-badge">확인 범위 표시</span><p>{facts.suitability}</p><p>{facts.fragrance}</p><p><strong>자극 테스트:</strong> 제품별 시험기관·대상·결과가 담긴 자료를 확인하지 못했습니다. ‘저자극 테스트 완료’로 표시하지 않습니다.</p><p className="fact-note">사용 전 소량 테스트는 제품의 인체 자극시험과 다릅니다. 처음에는 소량으로 시작하고 불편함이 생기면 사용을 멈추세요.</p><Source href={facts.source}>제품별 안내</Source><Source href={factSources.faq}>브랜드 사용 안내</Source></article>
      <article className="fact-card"><span className="fact-number">06</span><h3>실제 구매 후기</h3><span className="fact-badge fact-unconfirmed">검증 자료 미등록</span><p>구매 사실과 게시 동의를 확인한 실제 후기 자료가 아직 등록되어 있지 않습니다. 임의 평점·별점·후기를 표시하지 않습니다.</p><p className="fact-note">후기는 구매 확인, 피부 타입·고민, 사용 기간, 작성일과 협찬 여부를 확인한 자료에 한해 소개합니다. 가상 주문은 실제 구매 후기로 집계하지 않습니다.</p></article>
      <article className="fact-card"><span className="fact-number">07</span><h3>용량 · 가격 · 구매 조건</h3><span className="fact-badge fact-demo">{virtual ? "시연 설정" : "사이트 판매 설정"}</span><dl className="fact-rows"><div><dt>구성</dt><dd>30ml 단품 1개</dd></div><div><dt>{virtual ? "시연 설정가" : "사이트 판매가"}</dt><dd>{formatPrice(product.price)}원</dd></div><div><dt>1ml당 가격</dt><dd>약 {product.price == null ? "미확인" : (product.price / 30).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}원</dd></div><div><dt>배송비</dt><dd>{shippingFee == null ? "주문서에서 확인" : `${formatPrice(shippingFee)}원${virtual ? " (가상 주문)" : ""}`}</dd></div><div><dt>세트·쿠폰·할인</dt><dd>별도 구성·조건 미설정</dd></div></dl><p className="fact-note">{virtual ? "위 금액은 시연용 설정이며 실제 결제·배송은 없습니다. 공식 판매처의 현재 판매가나 할인 조건을 검증한 표시가 아닙니다." : "최종 결제 금액은 주문서에서 확인해 주세요."}</p></article>
    </div>
    <p className="fact-audit">공식 안내 확인일 {factsCheckedAt} · 브랜드가 공개한 설명과 사이트 설정을 정리한 정보이며, 독립적인 시험 검증을 의미하지 않습니다.</p>
  </section>;
}

function Source({ href, children }) { return <a className="fact-source" href={href} target="_blank" rel="noreferrer">{children} ↗</a>; }
