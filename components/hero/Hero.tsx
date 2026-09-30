"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { REVEAL_AT, REVEAL_FALLBACK_MS, VIDEO_CORS, VIDEO_POSTER, VIDEO_SRC } from "@/lib/config";
import { heroLanded, intro } from "@/lib/intro";
import type { VarStyle } from "@/components/ui/Media";

const d = (n: number): VarStyle => ({ "--d": n });

/** Read the backdrop from the footage's top-right corner and match the page to it. */
function matchBackdrop(video: HTMLVideoElement): void {
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx || !video.videoWidth) return;
    ctx.drawImage(video, video.videoWidth * 0.94, video.videoHeight * 0.12, 1, 1, 0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    const k = 0.955;
    const root = document.documentElement.style;
    root.setProperty("--bg", `rgb(${r} ${g} ${b})`);
    root.setProperty("--ghost", `rgb(${Math.round(r * k)} ${Math.round(g * k)} ${Math.round(b * k)})`);
    document.body.style.backgroundColor = `rgb(${r} ${g} ${b})`;
  } catch {
    // Tainted canvas (no CORS headers, or file://): keep the CSS tokens.
  }
}

const fmt = (s: number) => {
  const t = Number.isFinite(s) ? Math.max(0, Math.floor(s)) : 0;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const fallbackRef = useRef<number | undefined>(undefined);
  const stillRef = useRef(false);

  const [revealed, setRevealed] = useState(false);
  const [still, setStill] = useState(false);

  const reveal = useCallback(() => setRevealed(true), []);

  const armFallback = useCallback(() => {
    window.clearTimeout(fallbackRef.current);
    fallbackRef.current = window.setTimeout(reveal, REVEAL_FALLBACK_MS);
  }, [reveal]);

  const jumpToEnd = useCallback((video: HTMLVideoElement) => {
    if (Number.isFinite(video.duration)) video.currentTime = Math.max(0, video.duration - 0.05);
  }, []);

  // Tell the nav once the bird has landed.
  useEffect(() => {
    if (revealed) heroLanded.fire();
  }, [revealed]);

  // Video lifecycle + choreography
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stillRef.current = reduce;
    setStill(reduce);
    video.muted = true;

    let sampled = false;
    let raf = 0;

    const paintProgress = () => {
      const p = video.duration ? video.currentTime / video.duration : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
      if (timeRef.current) timeRef.current.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
    };
    const loop = () => {
      paintProgress();
      if (!video.paused && !video.ended) raf = requestAnimationFrame(loop);
    };

    const onLoadedData = () => {
      if (sampled) return;
      sampled = true;
      matchBackdrop(video);
    };
    const onLoadedMetadata = () => {
      paintProgress();
      if (reduce) jumpToEnd(video);
    };
    const onTimeUpdate = () => {
      if (video.currentTime >= REVEAL_AT) reveal();
    };
    const onPlay = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };
    const onEnded = () => {
      reveal();
      paintProgress();
    };

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("seeked", paintProgress);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", reveal);

    // loadeddata may already have fired before hydration
    if (video.readyState >= 1) onLoadedMetadata();
    if (video.readyState >= 2) onLoadedData();

    let offIntro = () => {};
    if (reduce) {
      reveal();
    } else {
      // Start only once the preloader has wiped away, so the landing is seen.
      offIntro = intro.on(() => {
        armFallback();
        video.play().catch(reveal);
      });
    }

    return () => {
      offIntro();
      cancelAnimationFrame(raf);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("seeked", paintProgress);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", reveal);
      window.clearTimeout(fallbackRef.current);
    };
  }, [armFallback, jumpToEnd, reveal]);

  const replay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (stillRef.current) {
      jumpToEnd(video);
      reveal();
      return;
    }
    setRevealed(false);
    video.currentTime = 0;
    armFallback();
    video.play().catch(reveal);
  };

  const heroClass = ["hero", revealed && "is-revealed", still && "is-still"].filter(Boolean).join(" ");

  return (
    <section className={heroClass} id="top" aria-labelledby="hero-title" data-bg="hero">
      <div className="hero__stage" data-cursor="replay" onClick={replay} aria-hidden="true">
        <video
          ref={videoRef}
          className="hero__video"
          src={VIDEO_SRC}
          poster={VIDEO_POSTER}
          crossOrigin={VIDEO_CORS ? "anonymous" : undefined}
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
          data-hero-video
        />
      </div>

      <p className="hero__word" aria-hidden="true">
        Haw<em>thorne</em>
      </p>

      <div className="hero__band">
        <div className="wrap">
          <div className="grid hero__grid">
            <div className="hero__copy">
              <p className="hero__eyebrow mono rv" style={d(1)}>
                Wildlife &amp; Nature Photography — Est. 2014
              </p>
              <h1 id="hero-title" className="hero__title">
                <span className="line">
                  <span className="line__inner" style={d(2)}>Patience, then the</span>
                </span>
                <span className="line">
                  <span className="line__inner" style={d(3)}>
                    <em>perfect</em> frame.
                  </span>
                </span>
              </h1>
              <p className="hero__lede rv" style={d(5)}>
                Rare birds and wild places across Africa, the Arctic and the Americas — photographed slowly, in natural light.
              </p>
            </div>

            <div className="hlabel rv" style={d(6)}>
              <p className="hlabel__head">
                <span className="mono">PL. 01 —</span>
                <em>Alcedo atthis</em>
              </p>
              <p className="hlabel__meta mono">Lac Ichkeul · 37.16° N · 2026</p>
              <div className="hlabel__track" aria-hidden="true">
                <span ref={fillRef} className="hlabel__fill" />
              </div>
              <div className="hlabel__foot mono">
                <span ref={timeRef} aria-hidden="true">00:00 / 00:08</span>
                <button type="button" className="hlabel__replay mono" onClick={replay} aria-label="Replay the hero film">
                  Replay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
