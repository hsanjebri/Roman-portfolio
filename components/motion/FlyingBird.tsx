"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

/** Height of each crossing, as a fraction of the viewport. One entry per pass. */
const LANES = [0.26, 0.62, 0.38, 0.72, 0.44, 0.58];

/** Off-screen on both ends, so the reset between passes is never seen. */
const FROM_X = 114;
const TO_X = -26;

/**
 * A bird that crosses the page right to left as you scroll — one pass per
 * section, at a different height each time, arcing gently upward mid-flight.
 * Purely decorative: no pointer events, hidden for reduced motion.
 */
export default function FlyingBird() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    registerGsap();

    // One pass per section below the hero (the hero has a real bird already).
    const sections = document.querySelectorAll("main [data-bg]").length;
    const passes = Math.max(3, Math.min(LANES.length, sections - 1));

    const quickX = gsap.quickSetter(el, "x", "vw");
    const quickY = gsap.quickSetter(el, "y", "px");
    const quickR = gsap.quickSetter(el, "rotate", "deg");

    const place = (progress: number) => {
      const p = progress * passes;
      const lane = LANES[Math.floor(p) % LANES.length];
      const phase = p % 1;
      // Arc: rises through the middle of the crossing, settles at both ends.
      const arc = Math.sin(phase * Math.PI) * -0.08;
      quickX(FROM_X + (TO_X - FROM_X) * phase);
      quickY((lane + arc) * window.innerHeight);
      // Nose follows the arc: up on the climb, level at the apex, down after.
      quickR(Math.cos(phase * Math.PI) * -7);
    };

    place(0);
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => place(self.progress),
      onRefresh: (self) => place(self.progress),
    });

    return () => trigger.kill();
  }, []);

  return (
    <div ref={ref} className="flybird" aria-hidden="true">
      <svg viewBox="0 0 92 60" width="100%" height="100%" fill="currentColor">
        {/* Seen from below, flying left: beak leads, forked tail streams behind. */}
        <path d="M4 30 C 14 26, 26 25, 40 26 L 66 27 L 89 21 L 82 30 L 89 39 L 66 33 L 40 34 C 26 35, 14 34, 4 30 Z" />
        {/* Wings compress toward the body on the downstroke — the foreshortening
            you actually see from underneath, rather than a hinge rotation. */}
        <g className="flybird__wings">
          <path d="M40 27 C 48 18, 60 8, 84 2 C 72 14, 60 24, 54 29 Z" />
          <path d="M40 33 C 48 42, 60 52, 84 58 C 72 46, 60 36, 54 31 Z" />
        </g>
      </svg>
    </div>
  );
}
