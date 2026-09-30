"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Media from "@/components/ui/Media";
import Lightbox from "@/components/lightbox/Lightbox";
import Species from "@/components/ui/Species";
import { compose, sizesFor } from "@/lib/compose";
import { SERIES } from "@/lib/content";
import { ScrollTrigger, prefersReducedMotion, revealAll } from "@/lib/motion";
import type { Photo, SeriesKey } from "@/lib/types";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Gallery({ series }: { series: Record<SeriesKey, Photo[]> }) {
  const [active, setActive] = useState<SeriesKey>("birds");
  const [shown, setShown] = useState<SeriesKey>("birds");
  const [out, setOut] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const rowsRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const swapTimer = useRef<number | undefined>(undefined);

  // Continuous plate numbers across series, like a printed book.
  const offsets = useMemo(() => {
    const map = {} as Record<SeriesKey, number>;
    let n = 0;
    for (const s of SERIES) {
      map[s.key] = n;
      n += series[s.key].length;
    }
    return map;
  }, [series]);

  const photos = series[shown];
  const rows = useMemo(() => compose(photos), [photos]);
  const indexOf = useMemo(() => new Map(photos.map((p, i) => [p.id, i])), [photos]);

  // Rust underline follows the active tab.
  const moveBar = useCallback(() => {
    const tab = tabsRef.current?.querySelector<HTMLElement>(`[data-key="${active}"]`);
    const bar = barRef.current;
    if (!tab || !bar) return;
    bar.style.width = `${tab.offsetWidth}px`;
    bar.style.transform = `translateX(${tab.offsetLeft}px)`;
  }, [active]);

  useLayoutEffect(() => {
    moveBar();
    window.addEventListener("resize", moveBar);
    return () => window.removeEventListener("resize", moveBar);
  }, [moveBar]);

  // Reveal the plates of the series on screen; re-run on every swap.
  useEffect(() => {
    const root = rowsRef.current;
    if (!root) return;
    const cleanup = revealAll(root);
    ScrollTrigger.refresh();
    return cleanup;
  }, [shown]);

  useEffect(() => () => window.clearTimeout(swapTimer.current), []);

  const select = (key: SeriesKey) => {
    if (key === active) return;
    setActive(key);
    if (prefersReducedMotion()) {
      setShown(key);
      return;
    }
    setOut(true);
    window.clearTimeout(swapTimer.current);
    swapTimer.current = window.setTimeout(() => {
      setShown(key);
      setOut(false);
    }, 450);
  };

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = SERIES.findIndex((s) => s.key === active);
    const next = SERIES[(i + (e.key === "ArrowRight" ? 1 : SERIES.length - 1)) % SERIES.length];
    select(next.key);
    tabsRef.current?.querySelector<HTMLElement>(`[data-key="${next.key}"]`)?.focus();
  };

  const close = useCallback(() => setOpen(null), []);

  return (
    <div data-motion-local>
      <div ref={tabsRef} className="tabs" role="tablist" aria-label="Series" onKeyDown={onTabKey}>
        {SERIES.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            id={`tab-${s.key}`}
            data-key={s.key}
            className="tab mono"
            aria-selected={active === s.key}
            aria-controls="series-panel"
            tabIndex={active === s.key ? 0 : -1}
            onClick={() => select(s.key)}
          >
            {s.label}
            <sup>{pad(series[s.key].length)}</sup>
          </button>
        ))}
        <span ref={barRef} className="tabs__bar" aria-hidden="true" />
      </div>

      <div
        ref={rowsRef}
        id="series-panel"
        role="tabpanel"
        aria-labelledby={`tab-${shown}`}
        className={`rows gallery-swap${out ? " is-out" : ""}`}
        data-motion-local
      >
        {rows.length === 0 && <p className="rows__empty mono">Plates for this series are being curated.</p>}
        {rows.map((row) => (
          <div
            key={`${shown}-${row.items[0].id}`}
            className={`row row--${row.kind}${row.left ? " is-left" : ""}`}
          >
            {row.items.map((p, slot) => {
              const i = indexOf.get(p.id) ?? 0;
              const no = pad(offsets[shown] + i + 1);
              return (
                <figure key={p.id} className="plate">
                  <button
                    type="button"
                    className="plate__open"
                    data-cursor="view"
                    onClick={() => setOpen(i)}
                    aria-label={`View plate ${no}, ${p.title}, full screen`}
                  >
                    <Media photo={p} sizes={sizesFor(row.kind, slot)} />
                  </button>
                  <figcaption className="cap">
                    <span className="cap__no mono">PL. {no}</span>
                    <span className="cap__body">
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
        ))}
      </div>

      {open !== null && (
        <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={close} numberOffset={offsets[shown]} />
      )}
    </div>
  );
}
