"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ScrollTrigger, gsap, prefersReducedMotion, registerGsap, revealAll, setLenis } from "@/lib/motion";

const COLORS: Record<string, string> = {
  night: "#0C0D0D",
  bone: "#F1EDE6",
};

/** expo.out, the one easing used everywhere */
const expoOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Site-wide motion: Lenis smooth scroll synced to ScrollTrigger, [data-reveal]
 * presets, and the scroll-driven page background (hero → night → bone).
 */
export default function MotionRoot() {
  const pathname = usePathname();

  // Smooth scroll — once for the app, off for reduced motion.
  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ duration: 1.2, easing: expoOut, anchors: true, autoRaf: false });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Per page: reveals + background/tone transitions.
  useEffect(() => {
    registerGsap();
    const html = document.documentElement;
    const reduce = prefersReducedMotion();
    const cleanupReveals = revealAll(document);

    const apply = (key: string) => {
      const color = key === "hero" ? getComputedStyle(html).getPropertyValue("--bg").trim() : COLORS[key];
      if (!color) return;
      html.dataset.tone = key === "night" ? "dark" : "light";
      gsap.to(document.body, { backgroundColor: color, duration: reduce ? 0 : 1.1, ease: "expo.out", overwrite: "auto" });
    };

    const triggers = Array.from(document.querySelectorAll<HTMLElement>("[data-bg]")).map((section) =>
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) apply(section.dataset.bg ?? "");
        },
      }),
    );

    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) ScrollTrigger.refresh();
    });
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      alive = false;
      window.removeEventListener("load", onLoad);
      cleanupReveals();
      triggers.forEach((t) => t.kill());
    };
  }, [pathname]);

  return null;
}
