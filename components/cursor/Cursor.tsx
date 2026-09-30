"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

const LABELS: Record<string, string> = {
  view: "View",
  replay: "Replay",
  play: "Play",
};

/**
 * Desktop-only cursor: a small dot that becomes a labelled disc over images
 * ("View"), the hero film ("Replay") and films ("Play"). Never rendered on
 * touch / coarse pointers.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const label = labelRef.current;
    if (!root || !label) return;
    registerGsap();
    const html = document.documentElement;
    html.classList.add("has-cursor");

    const dur = prefersReducedMotion() ? 0 : 0.5;
    const toX = gsap.quickTo(root, "x", { duration: dur, ease: "expo.out" });
    const toY = gsap.quickTo(root, "y", { duration: dur, ease: "expo.out" });
    let mode = "";

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      toX(e.clientX);
      toY(e.clientY);
      root.classList.add("is-active");
      const target = e.target instanceof Element ? e.target : null;
      const zone = target?.closest<HTMLElement>("[data-cursor]");
      const next = zone?.dataset.cursor ?? (target?.closest("a, button, [role='tab'], label") ? "link" : "");
      if (next === mode) return;
      mode = next;
      root.classList.toggle("is-label", next in LABELS);
      root.classList.toggle("is-link", next === "link");
      label.textContent = LABELS[next] ?? "";
    };
    const onLeave = () => root.classList.remove("is-active");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={rootRef} className="cursor" aria-hidden="true">
      <span className="cursor__dot">
        <span ref={labelRef} className="cursor__label" />
      </span>
    </div>
  );
}
