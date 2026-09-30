"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { SITE } from "@/lib/config";
import { blurHashToDataURL } from "@/lib/blurhash";
import { loaderFor, tinyUrl, withUtm } from "@/lib/image";
import Species from "@/components/ui/Species";
import { useDialog } from "@/lib/useDialog";
import type { Photo } from "@/lib/types";
import type { VarStyle } from "@/components/ui/Media";

const pad = (n: number) => String(n).padStart(2, "0");

interface LightboxProps {
  photos: Photo[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  /** Plate numbering offset, so PL. numbers match the page. */
  numberOffset?: number;
}

/** One image: tiny blurred version first, full resolution fades in on top. */
function Frame({ photo, box }: { photo: Photo; box: { w: number; h: number } }) {
  const [loaded, setLoaded] = useState(false);
  const ar = photo.width / photo.height;
  const w = Math.min(box.w, box.h * ar);
  const h = w / ar;
  const style: VarStyle = { width: w || undefined, height: h || undefined, "--c": photo.color };
  return (
    <div className="viewer__frame" style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative 48px blur-up placeholder */}
      <img className="viewer__blur" src={blurHashToDataURL(photo.blurHash) ?? tinyUrl(photo)} alt="" aria-hidden="true" />
      <Image
        className={`viewer__full${loaded ? " is-loaded" : ""}`}
        src={photo.src}
        loader={loaderFor(photo)}
        alt={photo.alt}
        fill
        sizes="100vw"
        quality={85}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export default function Lightbox({ photos, index, onIndex, onClose, numberOffset = 0 }: LightboxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const count = photos.length;
  const photo = photos[index];
  const prev = useCallback(() => onIndex((index - 1 + count) % count), [index, count, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % count), [index, count, onIndex]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    },
    [prev, next],
  );
  useDialog(rootRef, true, onClose, onKey);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const cs = getComputedStyle(stage);
      const px = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      setBox({ w: stage.clientWidth - px, h: stage.clientHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // Warm the neighbours so prev/next feel instant.
  useEffect(() => {
    [photos[(index + 1) % count], photos[(index - 1 + count) % count]].forEach((p) => {
      const img = new window.Image();
      img.src = tinyUrl(p);
    });
  }, [index, count, photos]);

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
  };

  if (!photo) return null;
  const no = pad(numberOffset + index + 1);

  return createPortal(
    <div
      ref={rootRef}
      className="viewer on-dark"
      role="dialog"
      aria-modal="true"
      aria-label={`Plate ${no}: ${photo.title}`}
    >
      <div className="wrap grid viewer__top">
        <p className="viewer__count mono" aria-live="polite">
          {pad(index + 1)} / {pad(count)}
        </p>
        <button type="button" className="viewer__close mono" onClick={onClose} data-autofocus>
          Close <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div ref={stageRef} className="viewer__stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <Frame key={photo.id} photo={photo} box={box} />
        {count > 1 && (
          <>
            <button type="button" className="viewer__nav viewer__nav--prev mono" onClick={prev} aria-label="Previous plate">
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" className="viewer__nav viewer__nav--next mono" onClick={next} aria-label="Next plate">
              <span aria-hidden="true">→</span>
            </button>
          </>
        )}
      </div>

      <div className="wrap grid viewer__bottom">
        <div className="viewer__cap cap">
          <span className="cap__no mono">PL. {no}</span>
          <span>
            <span className="cap__title">{photo.title}</span>
            <span className="cap__meta mono">
              <Species photo={photo} /> · {photo.location} · {photo.year}
            </span>
            {photo.exif && <span className="cap__exif mono">{photo.exif}</span>}
          </span>
        </div>
        <p className="viewer__credit mono">
          Photo by{" "}
          <a href={withUtm(photo.credit.url, SITE.utm)} target="_blank" rel="noopener noreferrer">
            {photo.credit.name}
          </a>{" "}
          on{" "}
          <a href={withUtm("https://unsplash.com/", SITE.utm)} target="_blank" rel="noopener noreferrer">
            Unsplash
          </a>
        </p>
      </div>
    </div>,
    document.body,
  );
}
