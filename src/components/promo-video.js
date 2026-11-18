"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";

export function PromoVideo() {
  const [playing, setPlaying] = useState(false);
  return (
    <figure className="promo-player">
      <div className="promo-video-frame">
        {playing ? (
          <video controls autoPlay muted playsInline preload="metadata" aria-label="마리엔비 브랜드 영상"
            ref={(element) => element?.focus({ preventScroll: true })} tabIndex={0} src="/videos/maryenb-brand-film.mp4">
            <a href="/videos/maryenb-brand-film.mp4">영상 파일 열기</a>
          </video>
        ) : (
          <button className="video-poster" type="button" onClick={() => setPlaying(true)}>
            <Image src="/images/homepage/mb-hero-lineup-20261015.jpg" alt="" fill sizes="(max-width: 760px) 100vw, 720px" />
            <span><Play size={18} /> 브랜드 영상 재생</span>
          </button>
        )}
      </div>
    </figure>
  );
}
