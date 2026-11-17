"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

  return <section className="promo-section section-shell" id="brand-film" aria-labelledby="brand-film-title">
    <div className="promo-copy"><p className="eyebrow">MARYENB · BRAND FILM</p><h2 id="brand-film-title">나를 아끼는 순간,<br />영상으로 만나보세요.</h2><p>매일의 루틴에 더하는 한 병.<br />마리엔비의 세럼을 영상으로 만나보세요.</p><Link className="text-link" href="#products">영상 속 세럼 살펴보기 <ArrowRight size={15} /></Link></div>
    <figure className="promo-player"><div className="promo-video-frame"><video ref={videoRef} controls muted loop playsInline preload="metadata" poster="/images/homepage/mb-hero-lineup-20261015.jpg" aria-label="마리엔비 세럼 홍보 영상" aria-describedby="brand-film-caption" width={1280} height={720}><source src="/videos/maryenb-brand-film.mp4" type="video/mp4" />브라우저에서 영상 재생을 지원하지 않습니다. <a href="/videos/maryenb-brand-film.mp4">홍보 영상 열기</a></video></div><figcaption id="brand-film-caption"><span>10초 브랜드 필름</span><span>기본 무음 · 재생바에서 소리와 일시정지를 조절하세요.</span></figcaption></figure>
  </section>;
}
