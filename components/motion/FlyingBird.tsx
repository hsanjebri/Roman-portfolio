"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

/** Cells in public/bird-flight.webp: ten of flight, then the perched bird. */
const SPRITE_FRAMES = 11;
const FLIGHT_FRAMES = 10;
const PERCHED_FRAME = 10;

/** Wingbeats per full crossing of the screen. */
const BEATS_PER_CROSSING = 30;
/** Full-width crossings before the landing approach begins. */
const CROSSINGS = 3;
/** Share of the flight spent tacking; the rest is the glide down to the perch. */
const LAND_FROM = 0.86;
/** Share of the landing spent moving. After this the bird is perched and still. */
const GLIDE_PART = 0.7;
/** The tack bottoms out here, leaving room to drop onto the perch. */
const TACK_DEPTH = 0.9;
/** Keeps the bird clear of the nav and the very bottom edge. */
const INSET_TOP = 88;
const INSET_BOTTOM = 64;
/** Where the twig sits in the perched cell, as a share of the cell height up
 *  from its bottom — used to stand the bird on the footer rule. */
const TWIG_FROM_BOTTOM = 0.21;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * Fold a straight line into a segment, reflecting at both ends — the bird turns
 * at the edge and carries on, instead of wrapping around to the other side.
 */
function fold(value: number, span: number): { v: number; dir: 1 | -1 } {
  const period = span * 2;
  let t = value % period;
  if (t < 0) t += period;
  // `<` not `<=`: exactly at the far edge the bird is already turning back.
  return t < span ? { v: t, dir: 1 } : { v: period - t, dir: -1 };
}

/**
 * A kingfisher that glides down across the page as you scroll, tacking left and
 * right. It turns at each side rather than wrapping around, and every leg
 * descends, so the path keeps making progress down the page.
 *
 * It stays out of the hero — that already has the bird itself — and over the
 * last stretch it breaks off the tack, glides to the bottom centre and settles
 * onto a perch.
 *
 * Position, heading and wingbeat are all driven by scroll, so the bird flies
 * while you scroll and rests when you stop. Decorative only: no pointer events,
 * hidden for reduced motion.
 */
export default function FlyingBird() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    registerGsap();

    const quickX = gsap.quickSetter(el, "x", "px");
    const quickY = gsap.quickSetter(el, "y", "px");
    const quickR = gsap.quickSetter(el, "rotate", "deg");
    const quickS = gsap.quickSetter(el, "scaleX");
    let lastFrame = -1;

    // Share of the page taken by the hero — the bird only appears past it.
    let heroShare = 0;
    // Viewport y the bird settles at, so it stands on the footer's hairline
    // rather than a fixed offset that would cover the links on short screens.
    let perchY = 0;
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const hero = document.querySelector<HTMLElement>(".hero");
      heroShare = hero && max > 0 ? Math.min(0.85, hero.offsetHeight / max) : 0;

      const h = el.offsetHeight;
      const rule = document.querySelector<HTMLElement>(".footer__grid");
      const fallback = window.innerHeight - h - INSET_BOTTOM;
      if (rule && max > 0) {
        // Where that rule lands in the viewport once the page is scrolled out.
        const ruleY = rule.getBoundingClientRect().top + window.scrollY - max;
        perchY = ruleY - h * (1 - TWIG_FROM_BOTTOM);
      } else {
        perchY = fallback;
      }
      perchY = Math.min(Math.max(perchY, INSET_TOP), window.innerHeight - h - 8);
    };

    const place = (progress: number) => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const spanX = Math.max(1, window.innerWidth - w);
      const spanY = Math.max(1, window.innerHeight - h - INSET_TOP - INSET_BOTTOM);

      const airborne = progress > heroShare;
      el.classList.toggle("is-flying", airborne);
      if (!airborne) return;

      const flight = clamp01((progress - heroShare) / Math.max(1e-6, 1 - heroShare));

      // Tacking phase. Past LAND_FROM this pins to its end state, which is what
      // the landing glide interpolates away from.
      const t = Math.min(flight, LAND_FROM) / LAND_FROM;
      const travelled = t * CROSSINGS * spanX;
      // The epsilon keeps the end of the tack on the leg the bird arrived on,
      // instead of landing exactly on a fold boundary and flipping to face back.
      const tack = fold(spanX + travelled - 1e-6, spanX);
      const tackY = INSET_TOP + t * spanY * TACK_DEPTH;
      const slope = (Math.atan2(spanY * TACK_DEPTH, CROSSINGS * spanX) * 180) / Math.PI;

      let x = tack.v;
      let y = tackY;
      let facingRight = tack.dir > 0;
      let rotation = tack.dir * slope;
      let frame = Math.floor(travelled / (spanX / (BEATS_PER_CROSSING * FLIGHT_FRAMES))) % FLIGHT_FRAMES;

      if (flight > LAND_FROM) {
        // Glide to the perch: bottom centre, levelling out as it arrives. The
        // move finishes at GLIDE_PART, so the perched bird is never in motion —
        // otherwise it looks like it is sliding along on its twig.
        const phase = (flight - LAND_FROM) / (1 - LAND_FROM);
        const k = easeOut(clamp01(phase / GLIDE_PART));
        const targetX = spanX / 2;
        const targetY = perchY;
        x = tack.v + (targetX - tack.v) * k;
        y = tackY + (targetY - tackY) * k;
        facingRight = targetX > tack.v;
        rotation *= 1 - k;
        if (phase >= GLIDE_PART) frame = PERCHED_FRAME;
      }

      quickX(x);
      quickY(y);
      // The sprite faces left, so mirror it whenever the bird heads right.
      quickS(facingRight ? -1 : 1);
      quickR(rotation);

      if (frame !== lastFrame) {
        lastFrame = frame;
        // The strip is SPRITE_FRAMES wide, so frame i sits at i/(n-1) of the travel.
        el.style.backgroundPositionX = `${(frame / (SPRITE_FRAMES - 1)) * 100}%`;
      }
    };

    measure();
    place(0);
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => place(self.progress),
      onRefresh: (self) => {
        measure();
        place(self.progress);
      },
    });

    return () => trigger.kill();
  }, []);

  return <div ref={ref} className="flybird" aria-hidden="true" />;
}
