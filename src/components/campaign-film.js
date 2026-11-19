"use client";

import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CampaignFilm() {
  const [playing, setPlaying] = useState(false);
  const playButton = useRef(null);
  const closeButton = useRef(null);

  useEffect(() => {
    if (playing) closeButton.current?.focus();
  }, [playing]);

  function stop() {
    setPlaying(false);
    playButton.current?.focus({ preventScroll: true });
  }

  return <>
    <button ref={playButton} className="campaign-play" type="button" onClick={() => setPlaying(true)}>
      <Play size={16} aria-hidden="true" /> 브랜드 필름
    </button>
    {playing && <div className="campaign-clip" onKeyDown={(event) => { if (event.key === "Escape") stop(); }}>
      <video src="/videos/maryenb-brand-film.mp4" aria-label="마리엔비 브랜드 필름"
        autoPlay muted playsInline controls preload="metadata" />
      <button ref={closeButton} className="campaign-play" type="button" onClick={stop}>
        <X size={16} aria-hidden="true" /> 닫기
      </button>
    </div>}
  </>;
}
