"use client";

import { useEffect, useRef } from "react";

export function PromoVideo() {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches || navigator.connection?.saveData || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      video.play().catch(() => {});
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return <figure className="promo-player" id="brand-film"><div className="promo-video-frame"><video ref={videoRef} controls muted loop playsInline preload="metadata" aria-label="마리엔비 세럼 홍보 영상" aria-describedby="brand-film-caption" width={1280} height={720}><source src="/videos/maryenb-brand-film.mp4" type="video/mp4" />브라우저에서 영상 재생을 지원하지 않습니다. <a href="/videos/maryenb-brand-film.mp4">홍보 영상 열기</a></video></div><figcaption id="brand-film-caption"><span>10초 브랜드 필름</span><span>기본 무음 · 재생바에서 소리와 일시정지를 조절하세요.</span></figcaption></figure>;
}
