"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

/** Frames in public/bird-flight.webp. */
const FRAMES = 10;
/** Wingbeats per full crossing of the screen. */
const BEATS_PER_CROSSING = 30;
/** Full-width crossings over the whole page. Odd, so it finishes bottom-left. */
const CROSSINGS = 3;
/** Keeps the bird clear of the nav and the very bottom edge. */
const INSET_TOP = 88;
const INSET_BOTTOM = 64;

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
 * descends — the return leg carries on down instead of retracing the way it
 * came, so the path keeps making progress down the page.
 *
 * Position, heading and wingbeat are all driven by scroll, so the bird flies
 * while you scroll and rests when you stop. Decorative only: no pointer events,
 * hidden for reduced motion.
 *
 * The frames are the real bird from the hero clip, keyed off its flat backdrop.
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

    const place = (progress: number) => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const spanX = Math.max(1, window.innerWidth - w);
      const spanY = Math.max(1, window.innerHeight - h - INSET_TOP - INSET_BOTTOM);

      // Horizontal: tack back and forth. Offset by one span so the bird starts
      // at the right-hand edge heading left. The value fed to `fold` has to keep
      // increasing, or the direction it reports comes out inverted.
      const travelled = progress * CROSSINGS * spanX;
      // The epsilon keeps the last pixel of the page on the leg the bird arrived
      // on, instead of landing exactly on a fold boundary and flipping to face
      // back the way it came.
      const x = fold(spanX + travelled - 1e-6, spanX);
      // Vertical: one steady descent over the whole page, so both the leftward
      // and the rightward legs go down and the path never retraces itself.
      const y = progress * spanY;

      quickX(x.v);
      quickY(INSET_TOP + y);
      // The sprite faces left, so mirror it whenever the bird turns right.
      quickS(x.dir > 0 ? -1 : 1);
      // Nose on the real heading: the descent is shallow, so the tilt is slight.
      const slope = (Math.atan2(spanY, CROSSINGS * spanX) * 180) / Math.PI;
      quickR(x.dir * slope);

      const stride = spanX / (BEATS_PER_CROSSING * FRAMES);
      const frame = Math.floor(travelled / stride) % FRAMES;
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
