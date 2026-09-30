"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

/**
 * Counts up once, when first seen. The server renders the final value, so the
 * number is correct without JS; the effect rewinds it to 0 only below the fold.
 */
export default function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    registerGsap();
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) return; // already on screen: leave it

    const state = { v: 0 };
    el.textContent = `0${suffix}`;
    let tween: gsap.core.Tween | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        tween = gsap.to(state, {
          v: to,
          duration: 1.8,
          ease: "expo.out",
          onUpdate: () => {
            el.textContent = `${Math.round(state.v)}${suffix}`;
          },
        });
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
      el.textContent = `${to}${suffix}`;
    };
  }, [to, suffix]);

  return (
    <span ref={ref}>
      {to}
      {suffix}
    </span>
  );
}
