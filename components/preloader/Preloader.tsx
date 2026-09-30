"use client";

import { useEffect, useRef } from "react";
import { PRELOADER_MAX_MS } from "@/lib/config";
import { INTRO_STORAGE_KEY, intro } from "@/lib/intro";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

/** How much of the hero video is ready, 0–1. */
function videoProgress(video: HTMLVideoElement | null): number {
  if (!video) return 1;
  if (video.readyState >= 4) return 1;
  if (video.error) return 1;
  const d = video.duration;
  if (!d || !Number.isFinite(d) || video.buffered.length === 0) return video.readyState >= 3 ? 0.85 : 0;
  return Math.min(1, video.buffered.end(video.buffered.length - 1) / d / 0.6); // 60% buffered is enough to start
}

/** Share of eager (non-lazy) images that have decoded. */
function imageProgress(): number {
  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img:not([loading="lazy"])'));
  if (!imgs.length) return 1;
  return imgs.filter((i) => i.complete).length / imgs.length;
}

/**
 * Bone screen with a 000 → 100 counter tied to real loading (hero video +
 * first images), capped at 2.5 s, then a vertical wipe. Skipped when the
 * visitor has already seen it this session, or prefers reduced motion.
 */
export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_STORAGE_KEY) === "1";
    } catch {
      /* storage blocked: show it */
    }

    if (!root || seen || prefersReducedMotion() || getComputedStyle(root).display === "none") {
      if (root) root.style.display = "none";
      intro.fire();
      return;
    }

    registerGsap();
    html.classList.add("is-loading");
    const video = document.querySelector<HTMLVideoElement>("video[data-hero-video]");
    const start = performance.now();
    let shown = 0;
    let raf = 0;
    let done = false;

    const finish = () => {
      done = true;
      try {
        sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      html.classList.remove("is-loading");
      intro.fire();
      gsap
        .timeline({ onComplete: () => void (root.style.display = "none") })
        .to(countRef.current, { yPercent: -40, autoAlpha: 0, duration: 0.9, ease: EASE })
        .to(root, { yPercent: -100, duration: 1.3, ease: "expo.inOut" }, 0.1);
    };

    const tick = () => {
      const elapsed = performance.now() - start;
      const real = videoProgress(video) * 0.75 + imageProgress() * 0.25;
      const floor = Math.min(1, elapsed / PRELOADER_MAX_MS);
      const target = Math.max(real, floor) * 100;
      shown += (target - shown) * 0.12 + 0.2;
      shown = Math.min(shown, target, 100);
      const n = Math.floor(shown);
      if (countRef.current) countRef.current.textContent = String(n).padStart(3, "0");
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown / 100})`;
      if (shown >= 99.5 || elapsed >= PRELOADER_MAX_MS) {
        if (countRef.current) countRef.current.textContent = "100";
        if (barRef.current) barRef.current.style.transform = "scaleX(1)";
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (!done) html.classList.remove("is-loading");
    };
  }, []);

  return (
    <div ref={rootRef} className="preloader" aria-hidden="true">
      <div className="wrap grid preloader__top">
        <span className="mono">Rowan Hawthorne</span>
        <span className="mono">Wildlife &amp; Nature Photography</span>
      </div>
      <div className="wrap grid preloader__bottom">
        <span ref={countRef} className="preloader__count">
          000
        </span>
        <span className="preloader__note mono">
          Loading plates
          <br />
          Series N° 07 · Rare birds
        </span>
        <div className="preloader__bar">
          <span ref={barRef} />
        </div>
      </div>
    </div>
  );
}
