"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Lightbox from "@/components/lightbox/Lightbox";
import Species from "@/components/ui/Species";
import type { VarStyle } from "@/components/ui/Media";
import { blurHashToDataURL } from "@/lib/blurhash";
import { SERIES } from "@/lib/content";
import { loaderFor } from "@/lib/image";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import type { Photo, SeriesKey } from "@/lib/types";

type TabKey = "all" | SeriesKey;

const TABS: ReadonlyArray<{ key: TabKey; label: string }> = [
  { key: "all", label: "All" },
  ...SERIES.map((s) => ({ key: s.key as TabKey, label: s.label })),
];

/** Below this the ring looks sparse, so short series repeat to fill it. */
const MIN_CARDS = 12;
/** Degrees per second of idle rotation. */
const AUTO_SPEED = 5.5;
/** Degrees of spin per pixel dragged. */
const DRAG_SENS = 0.26;
/** Past this a pointer counts as a drag, not a click on a card. */
const DRAG_SLOP = 6;
/** A little air between neighbours, so they don't literally touch. */
const GAP = 1.06;

const pad = (n: number) => String(n).padStart(2, "0");

/** Card size by viewport — smaller ring and cards on a phone. */
function cardWidth(vw: number): number {
  if (vw < 640) return 132;
  if (vw < 1024) return 178;
  return 224;
}

export default function RingGallery({ series }: { series: Record<SeriesKey, Photo[]> }) {
  const [active, setActive] = useState<TabKey>("all");
  const [shown, setShown] = useState<TabKey>("all");
  const [open, setOpen] = useState<number | null>(null);
  const [front, setFront] = useState(0);
  const [cardW, setCardW] = useState(196);

  const ringRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const rotation = useRef(0);
  const velocity = useRef(AUTO_SPEED);
  const dragging = useRef(false);
  const hovering = useRef(false);
  const moved = useRef(0);
  const captured = useRef(false);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const frontRef = useRef(0);

  const all = useMemo(() => SERIES.flatMap((s) => series[s.key]), [series]);
  const photos = shown === "all" ? all : series[shown];

  /** Cards around the ring — a short series repeats so the ring stays full.
   *  Always a whole number of repeats, or the sequence restarts mid-ring and
   *  leaves a visible seam. */
  const cards = useMemo(() => {
    if (!photos.length) return [];
    const repeats = Math.max(1, Math.ceil(MIN_CARDS / photos.length));
    const target = photos.length * repeats;
    return Array.from({ length: target }, (_, i) => ({ photo: photos[i % photos.length], index: i % photos.length }));
  }, [photos]);

  const count = cards.length;
  const step = count ? 360 / count : 0;
  const cardH = Math.round(cardW * (4 / 3));
  // Chord of one segment equals the card width, so neighbours sit edge to edge.
  const radius = count > 1 ? Math.round((cardW * GAP) / 2 / Math.tan(Math.PI / count)) : 0;

  useLayoutEffect(() => {
    const update = () => setCardW(cardWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const innersOf = useCallback(
    () => cardsRef.current.map((el) => el?.firstElementChild).filter((el): el is HTMLElement => el instanceof HTMLElement),
    [],
  );

  /* ---- rotation + depth shading -------------------------------------- */
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring || !count) return;
    registerGsap();
    const reduce = prefersReducedMotion();
    let raf = 0;
    let last = performance.now();

    const paint = () => {
      const rot = rotation.current;
      ring.style.transform = `translateZ(${-radius}px) rotateY(${rot}deg)`;
      let bestIndex = 0;
      let bestFacing = -2;
      for (let i = 0; i < cardsRef.current.length; i++) {
        const el = cardsRef.current[i];
        if (!el) continue;
        // How square-on this card is: 1 dead ahead, -1 round the back.
        const facing = Math.cos(((i * step + rot) * Math.PI) / 180);
        const t = Math.pow((facing + 1) / 2, 1.4);
        el.style.opacity = String(0.14 + 0.86 * t);
        el.style.filter = `brightness(${(0.4 + 0.6 * t).toFixed(3)})`;
        // Only the cards turned toward us can be clicked.
        el.style.pointerEvents = facing > 0.3 ? "auto" : "none";
        if (facing > bestFacing) {
          bestFacing = facing;
          bestIndex = i;
        }
      }
      if (bestIndex !== frontRef.current) {
        frontRef.current = bestIndex;
        setFront(bestIndex);
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce && !dragging.current) {
        // Hovering brakes to a stop; letting go eases back up to the idle speed.
        const target = hovering.current ? 0 : AUTO_SPEED;
        // Brakes harder than it picks back up, so hovering feels responsive
        // while releasing still eases gently into the drift.
        const rate = hovering.current ? 5 : 2.2;
        velocity.current += (target - velocity.current) * Math.min(1, dt * rate);
        // Settle exactly on zero, or a hovered ring creeps forever.
        if (target === 0 && Math.abs(velocity.current) < 0.08) velocity.current = 0;
        rotation.current += velocity.current * dt;
      }
      paint();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [count, step, radius]);

  /* ---- cards fly in when the series changes --------------------------- */
  useEffect(() => {
    const inners = innersOf();
    if (!inners.length) return;
    if (prefersReducedMotion()) {
      gsap.set(inners, { opacity: 1, scale: 1 });
      return;
    }
    registerGsap();
    const tween = gsap.fromTo(
      inners,
      { opacity: 0, scale: 0.82 },
      { opacity: 1, scale: 1, duration: 0.75, ease: "expo.out", stagger: { each: 0.035, from: "center" } },
    );
    return () => {
      tween.kill();
    };
  }, [shown, innersOf]);

  const select = (key: TabKey) => {
    if (key === active) return;
    setActive(key);
    const inners = innersOf();
    if (prefersReducedMotion() || !inners.length) {
      setShown(key);
      return;
    }
    registerGsap();
    gsap.killTweensOf(inners);
    gsap.to(inners, {
      opacity: 0,
      scale: 0.82,
      duration: 0.36,
      ease: "power2.in",
      stagger: { each: 0.022, from: "edges" },
      onComplete: () => setShown(key),
    });
  };

  /* ---- drag to spin, with the throw carrying on ----------------------- */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    moved.current = 0;
    captured.current = false;
    lastX.current = e.clientX;
    lastT.current = performance.now();
    // Capture is deliberately not taken here: it retargets the click to the
    // stage, and a card would never receive its own click.
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const now = performance.now();
    const dx = e.clientX - lastX.current;
    const dt = Math.max(0.001, (now - lastT.current) / 1000);
    lastX.current = e.clientX;
    lastT.current = now;
    moved.current += Math.abs(dx);
    // Once this is a real drag, capture so it keeps tracking outside the stage.
    if (!captured.current && moved.current > DRAG_SLOP) {
      captured.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    rotation.current += dx * DRAG_SENS;
    // Hand the throw to the idle loop, which eases it back to the drift speed.
    velocity.current = (dx * DRAG_SENS) / dt;
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (captured.current && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    captured.current = false;
  };

  /** Keyboard focus brings that card round to the front. */
  const onCardFocus = (i: number) => {
    const turns = Math.round((rotation.current + i * step) / 360);
    rotation.current = turns * 360 - i * step;
    velocity.current = 0;
  };

  const close = useCallback(() => setOpen(null), []);
  const current = cards[front]?.photo;
  const style: VarStyle = { "--card-w": `${cardW}px`, "--card-h": `${cardH}px` };

  return (
    <div className="ring" style={style} data-motion-local>
      <div className="pills" role="tablist" aria-label="Series">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            className="pill mono"
            aria-selected={active === t.key}
            onClick={() => select(t.key)}
          >
            {t.label}
            <sup>{pad(t.key === "all" ? all.length : series[t.key].length)}</sup>
          </button>
        ))}
      </div>

      <div
        className="ring__stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => (hovering.current = true)}
        onMouseLeave={() => (hovering.current = false)}
      >
        <div ref={ringRef} className="ring__spin">
          {cards.map((card, i) => {
            const blur = blurHashToDataURL(card.photo.blurHash);
            const cardStyle: VarStyle = {
              transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
              "--c": card.photo.color,
              ...(blur ? { "--blur": `url(${blur})` } : {}),
            };
            return (
              <button
                key={`${shown}-${i}`}
                type="button"
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                className="ring__card"
                style={cardStyle}
                data-cursor="view"
                onFocus={() => onCardFocus(i)}
                onClick={() => {
                  if (moved.current > DRAG_SLOP) return;
                  setOpen(card.index);
                }}
                aria-label={`View ${card.photo.title}, ${card.photo.common}, full screen`}
              >
                <span className="ring__inner">
                  <Image
                    src={card.photo.src}
                    loader={loaderFor(card.photo)}
                    alt={card.photo.alt}
                    fill
                    sizes={`${cardW}px`}
                    quality={75}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {current && (
        <p className="ring__cap" aria-live="off">
          <span className="cap__no mono">PL. {pad((cards[front]?.index ?? 0) + 1)}</span>
          <span className="cap__title">{current.title}</span>
          <span className="cap__meta mono">
            <Species photo={current} /> · {current.location} · {current.year}
          </span>
        </p>
      )}

      {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={close} />}
    </div>
  );
}
