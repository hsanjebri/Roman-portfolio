"use client";

import { useEffect, useRef, useState } from "react";
import Media, { type VarStyle } from "@/components/ui/Media";
import Lightbox from "@/components/lightbox/Lightbox";
import Species from "@/components/ui/Species";
import { gsap, registerGsap } from "@/lib/motion";
import type { Photo } from "@/lib/types";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Pinned horizontal series. On desktop with motion, vertical scroll drives the
 * track sideways; on small screens or reduced motion it becomes a native,
 * snap-scrolling strip.
 */
export default function FeaturedSeries({ photos }: { photos: Photo[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(1);
  const [native, setNative] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const total = photos.length;

  useEffect(() => {
    registerGsap();
    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!section || !pin || !track || !viewport) return;

    let last = 1;
    const setPlate = (progress: number) => {
      const n = Math.min(total, Math.max(1, Math.round(progress * (total - 1)) + 1));
      if (n !== last) {
        last = n;
        setCurrent(n);
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    };

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      setNative(false);
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => setPlate(self.progress),
        },
      });
    });

    mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
      setNative(true);
      const onScroll = () => {
        const max = viewport.scrollWidth - viewport.clientWidth;
        setPlate(max > 0 ? viewport.scrollLeft / max : 0);
      };
      viewport.addEventListener("scroll", onScroll, { passive: true });
      return () => viewport.removeEventListener("scroll", onScroll);
    });

    return () => mm.revert();
  }, [total]);

  return (
    <section
      ref={sectionRef}
      id="rare-birds"
      className={`section section--night featured on-dark${native ? " is-native" : ""}`}
      data-bg="night"
      aria-labelledby="rare-birds-title"
    >
      <div ref={pinRef} className="featured__pin">
        <div className="wrap grid featured__head">
          <p className="kicker mono">
            <b>02</b> — Featured series
          </p>
          <p className="featured__count mono" aria-live="off">
            {pad(current)} / {pad(total)}
          </p>
        </div>

        <div ref={viewportRef} className="featured__viewport" data-motion-local>
          <div ref={trackRef} className="featured__track">
            <div className="featured__intro">
              <p className="mono kicker">Series N° 07 · 2020 — 2025 · {total} plates</p>
              <h2 id="rare-birds-title">
                Rare <em>Birds</em>
              </h2>
              <p>
                Six years, four continents, one bird at a time — from the shoebill&rsquo;s swamp in Uganda to the
                snowfields of the snowy owl. {total} plates, each one the result of a single long wait.
              </p>
            </div>

            {photos.map((p, i) => {
              const ar = p.width / p.height;
              return (
                <figure key={p.id} className="fplate" style={{ "--ar": ar } as VarStyle}>
                  <button
                    type="button"
                    className="plate__open"
                    data-cursor="view"
                    onClick={() => setOpen(i)}
                    aria-label={`View rare birds plate ${pad(i + 1)}, ${p.title}, full screen`}
                  >
                    <Media photo={p} reveal={false} sizes={`(min-width: 768px) ${Math.round(ar * 56)}vh, 80vw`} />
                  </button>
                  <figcaption className="cap">
                    <span className="cap__no mono">PL. {pad(i + 1)}</span>
                    <span>
                      <span className="cap__title">{p.title}</span>
                      <span className="cap__meta mono">
                        <Species photo={p} /> · {p.location} · {p.year}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>

        <div className="wrap">
          <div className="featured__progress" aria-hidden="true">
            <span ref={barRef} />
          </div>
        </div>
      </div>

      {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}
