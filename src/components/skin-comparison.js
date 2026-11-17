"use client";

import { useId, useState } from "react";
import { ChevronsLeftRight, MoveHorizontal } from "lucide-react";
import { skinExamples } from "../data/skin-examples";

export function SkinComparison({ code, guide }) {
  const [position, setPosition] = useState(50);
  const id = useId();
  const example = skinExamples[code];
  if (!example) return null;
  return <section className="skin-comparison" aria-labelledby={`${id}-title`}>
    <div className="skin-comparison-heading"><div><p className="eyebrow">EXPLORE SKIN APPEARANCE · {code}</p><h2 id={`${id}-title`}>{example.title}</h2><p className="guide-intro">20대 성인 여성의 가상 얼굴로 살펴보는 제품별 피부 고민.<br />막대를 움직여 같은 얼굴의 두 가지 표현을 비교해 보세요.</p></div><span className="illustration-badge">AI 가상 일러스트</span></div>
    <div className="skin-comparison-layout"><figure className="skin-comparison-figure">
      <div className="skin-comparison-stage" style={{ "--reveal": `${position}%`, "--skin-image": `url("${example.image}")` }}>
        <div className="skin-portrait skin-portrait-b" aria-hidden="true" />
        <div className="skin-portrait skin-portrait-a" aria-hidden="true" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }} />
        <span className="skin-example-label skin-example-a" aria-hidden="true">A · 고민 표현</span><span className="skin-example-label skin-example-b" aria-hidden="true">B · 다른 표현</span>
        <div className="skin-comparison-divider" aria-hidden="true"><span><ChevronsLeftRight size={24} strokeWidth={1.8} /></span></div>
        <input className="skin-comparison-range" type="range" min={0} max={100} step={1} value={position} onChange={(event) => setPosition(Number(event.target.value))} aria-label="가상 얼굴 이미지 비교 막대" aria-valuetext={`예시 A ${position}%, 예시 B ${100 - position}% 표시`} aria-describedby={`${id}-notice ${id}-hint`} />
        <span className="skin-image-notice">가상 이미지 · 실제 사용 전후 아님</span>
      </div>
      <div className="skin-comparison-controls"><button type="button" onClick={() => setPosition(100)} aria-pressed={position === 100}>예시 A 전체</button><button type="button" onClick={() => setPosition(50)} aria-pressed={position === 50}>반반 보기</button><button type="button" onClick={() => setPosition(0)} aria-pressed={position === 0}>예시 B 전체</button></div>
      <figcaption id={`${id}-hint`}><MoveHorizontal size={16} aria-hidden="true" /> 마우스·터치로 이동하거나, 막대에 초점을 맞춘 뒤 ← → 키를 사용하세요.</figcaption>
    </figure><div className="skin-comparison-copy"><span className="eyebrow">WHAT TO LOOK FOR</span><h3>{guide.headline}</h3><div className="skin-observation"><strong>이미지에서 살펴볼 부분</strong><ul>{example.points.map((point) => <li key={point}>{point}</li>)}</ul></div><p>{guide.summary}</p><div className="product-tags">{guide.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="skin-comparison-context"><strong>성분과 시작 방법도 함께 확인하세요</strong><p>{guide.focus}<br />{guide.frequency}<br />{guide.timing}</p></div><p id={`${id}-notice`} className="skin-comparison-disclosure">제품별 피부 고민을 설명하기 위해 AI로 만든 서로 다른 가상 일러스트입니다. 실제 인물의 제품 사용 전후, 임상시험 또는 예상 효과를 보여 주지 않으며, 이미지의 차이가 제품의 효능이나 효과의 크기를 뜻하지 않습니다.{code === "ANC5" || code === "ANC10" ? " ANC5·ANC10의 이미지 차이는 함량에 따른 효과 비교가 아닙니다." : ""}</p></div></div>
  </section>;
}
