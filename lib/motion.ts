"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type Lenis from "lenis";

/** One easing language across CSS and GSAP. */
export const EASE = "expo.out";
export const EASE_CSS = "cubic-bezier(.19,1,.22,1)";
export const DUR = { fast: 0.9, base: 1.2, slow: 1.4 } as const;

let registered = false;

export function registerGsap(): typeof gsap {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    gsap.defaults({ ease: EASE, duration: DUR.base });
    registered = true;
  }
  return gsap;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------------------------------------------------------------- Lenis */

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null): void {
  lenis = instance;
}

export function getLenis(): Lenis | null {
  return lenis;
}

let locks = 0;

/** Freeze page scroll (lightbox, menu, film player). Nested calls are counted. */
export function lockScroll(): void {
  locks += 1;
  if (locks > 1) return;
  lenis?.stop();
  document.documentElement.classList.add("is-locked");
}

export function unlockScroll(): void {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  lenis?.start();
  document.documentElement.classList.remove("is-locked");
}

/**
 * Smooth-scroll to an in-page section from an "/#id" or "#id" link.
 * Returns false when the target isn't on this page (let the browser navigate).
 */
export function scrollToHash(href: string): boolean {
  const id = href.split("#")[1];
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = prefersReducedMotion();
  if (lenis) lenis.scrollTo(el, { duration: reduce ? 0 : 1.4, force: true });
  else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  history.replaceState(null, "", `#${id}`);
  return true;
}

/* -------------------------------------------------------------- Presets */

const START = "top 86%";

/**
 * Headline reveal: split into lines, each masked, sliding up 100% → 0.
 * Re-splits on resize (autoSplit) and keeps progress. Returns a cleanup.
 */
export function revealLines(el: HTMLElement, opts: { delay?: number; scroll?: boolean } = {}): () => void {
  registerGsap();
  if (prefersReducedMotion()) {
    gsap.set(el, { autoAlpha: 1 });
    return () => {};
  }
  const split = SplitText.create(el, {
    type: "lines",
    mask: "lines",
    linesClass: "split-line",
    autoSplit: true,
    onSplit(self) {
      gsap.set(el, { autoAlpha: 1 });
      return gsap.from(self.lines, {
        yPercent: 100,
        duration: DUR.slow,
        stagger: 0.09,
        delay: opts.delay ?? 0,
        ease: EASE,
        scrollTrigger: opts.scroll === false ? undefined : { trigger: el, start: START, once: true },
      });
    },
  });
  return () => split.revert();
}

/**
 * Image reveal: clip-path inset from the bottom up, with the inner image
 * settling from 1.15 → 1. Expects `el > .reveal__inner`.
 */
export function revealImage(el: HTMLElement, opts: { delay?: number; scroll?: boolean } = {}): () => void {
  registerGsap();
  const inner = el.querySelector<HTMLElement>(".reveal__inner");
  if (prefersReducedMotion()) {
    gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)" });
    if (inner) gsap.set(inner, { scale: 1 });
    return () => {};
  }
  const tl = gsap.timeline({
    delay: opts.delay ?? 0,
    scrollTrigger: opts.scroll === false ? undefined : { trigger: el, start: START, once: true },
  });
  tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: DUR.slow, ease: EASE });
  if (inner) tl.fromTo(inner, { scale: 1.15 }, { scale: 1, duration: DUR.slow + 0.4, ease: EASE }, 0);
  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
  };
}

/** Simple fade-up for small UI (labels, rows). */
export function revealFade(el: HTMLElement, opts: { delay?: number } = {}): () => void {
  registerGsap();
  if (prefersReducedMotion()) {
    gsap.set(el, { autoAlpha: 1, y: 0 });
    return () => {};
  }
  const tween = gsap.fromTo(
    el,
    { autoAlpha: 0, y: 24 },
    { autoAlpha: 1, y: 0, duration: DUR.base, delay: opts.delay ?? 0, scrollTrigger: { trigger: el, start: START, once: true } },
  );
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}

/** Wire every [data-reveal] inside `root`. Returns a single cleanup. */
export function revealAll(root: ParentNode): () => void {
  const cleanups: Array<() => void> = [];
  root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    if (el.closest("[data-motion-local]") && !(root instanceof HTMLElement && root.hasAttribute("data-motion-local"))) return;
    const delay = Number(el.dataset.revealDelay ?? 0);
    const kind = el.dataset.reveal;
    if (kind === "lines") cleanups.push(revealLines(el, { delay }));
    else if (kind === "image") cleanups.push(revealImage(el, { delay }));
    else if (kind === "fade") cleanups.push(revealFade(el, { delay }));
  });
  return () => cleanups.forEach((fn) => fn());
}

export { gsap, ScrollTrigger };
