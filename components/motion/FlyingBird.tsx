"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

/** Height of each crossing, as a fraction of the viewport. One entry per pass. */
const LANES = [0.26, 0.62, 0.38, 0.72, 0.44, 0.58];

/** Off-screen on both ends, so the reset between passes is never seen. */
const FROM_X = 114;
const TO_X = -26;

/** Frames in public/bird-flight.webp, and wingbeats per crossing. */
const FRAMES = 10;
const BEATS_PER_PASS = 7;

/**
 * A kingfisher that crosses the page right to left as you scroll — one pass
 * per section, at a different height each time, arcing gently upward
 * mid-flight. Position *and* wingbeat are both driven by scroll, so the bird
 * flies while you scroll and rests when you stop. Decorative only: no pointer
 * events, hidden for reduced motion.
 *
 * The frames are the real bird from the hero clip, keyed off its flat backdrop
 * and mirrored to face the direction of travel.
 */
export default function FlyingBird() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    registerGsap();

    // One pass per section below the hero (the hero has the bird itself).
    const sections = document.querySelectorAll("main [data-bg]").length;
    const passes = Math.max(3, Math.min(LANES.length, sections - 1));

    const quickX = gsap.quickSetter(el, "x", "vw");
    const quickY = gsap.quickSetter(el, "y", "px");
    const quickR = gsap.quickSetter(el, "rotate", "deg");
    let lastFrame = -1;

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

      const frame = Math.floor(phase * BEATS_PER_PASS * FRAMES) % FRAMES;
      if (frame !== lastFrame) {
        lastFrame = frame;
        // The strip is FRAMES wide, so frame i sits at i/(FRAMES-1) of the travel.
        el.style.backgroundPositionX = `${(frame / (FRAMES - 1)) * 100}%`;
      }
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

  return <div ref={ref} className="flybird" aria-hidden="true" />;
}
