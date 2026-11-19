"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ChevronsLeftRight, MoveHorizontal } from "lucide-react";
import { skinExamples } from "../data/skin-examples";

const views = [[100, "예시 A 전체"], [50, "반반 보기"], [0, "예시 B 전체"]];

export function SkinComparison({ code }) {
  const [position, setPosition] = useState(50);
  const id = useId();
  const example = skinExamples[code];
  if (!example) return null;

  const portrait = {
    src: example.image,
    width: 1774,
    height: 887,
    sizes: "(max-width: 510px) calc(200vw - 140px), 880px",
  };

  return <section className="skin-comparison" id="skin-example" aria-labelledby={`${id}-title`}>
    <div className="skin-comparison-heading">
      <h2 id={`${id}-title`}>피부 고민 AI 예시</h2>
      <span className="illustration-badge">AI 가상 일러스트</span>
    </div>
    <div className="skin-comparison-layout">
      <figure className="skin-comparison-figure">
        <div className="skin-comparison-stage" style={{ "--reveal": `${position}%` }}>
          <div className="skin-portrait skin-portrait-b" aria-hidden="true"><Image {...portrait} alt="" /></div>
          <div className="skin-portrait skin-portrait-a" aria-hidden="true"><Image {...portrait} alt="" /></div>
          {position >= 30 && <span className="skin-example-label skin-example-a" aria-hidden="true">예시 A</span>}
          {position <= 70 && <span className="skin-example-label skin-example-b" aria-hidden="true">예시 B</span>}
          {position > 0 && position < 100 && <div className="skin-comparison-divider" aria-hidden="true">
            <span><ChevronsLeftRight size={23} /></span>
          </div>}
          <input className="skin-comparison-range" type="range" min={0} max={100} step={1} value={position}
            onChange={(event) => setPosition(Number(event.target.value))} aria-label="가상 얼굴 이미지 비교 막대"
            aria-valuetext={`화면에 예시 A ${position}%, 예시 B ${100 - position}% 표시`}
            aria-describedby={`${id}-notice ${id}-hint`} />
          <span className="skin-image-notice">AI 생성 이미지 · 피부 고민 설명용</span>
        </div>
        <div className="skin-comparison-controls">
          {views.map(([value, label]) => <button key={value} type="button" onClick={() => setPosition(value)}
            aria-pressed={position === value}>{label}</button>)}
        </div>
        <figcaption id={`${id}-hint`}><MoveHorizontal size={16} aria-hidden="true" />막대를 움직이거나 좌우 방향키로 비교해 보세요.</figcaption>
      </figure>
      <div className="skin-comparison-copy">
        <h3>{example.title}</h3>
        <p id={`${id}-notice`} className="skin-comparison-disclosure">
          피부 고민을 설명하기 위해 AI로 만든 두 가지 표현입니다. 이미지 차이는 실제 제품 사용 결과나 함량별 효과와 무관합니다.
        </p>
        <div className="skin-observation">
          <strong>이미지에서 볼 부분</strong>
          <ul>{example.points.map((point) => <li key={point}>{point}</li>)}</ul>
        </div>
      </div>
    </div>
  </section>;
}
