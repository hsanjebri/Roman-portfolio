"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { prefersReducedMotion } from "@/lib/motion";
import { useDialog } from "@/lib/useDialog";
import type { Film } from "@/lib/types";

const pad = (n: number) => String(n).padStart(2, "0");
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

/**
 * A muted, looping preview that only loads and plays while in view.
 * `preload="none"` + no src until first intersection keeps it off the network.
 */
function FilmCard({ film, index, onOpen }: { film: Film; index: number; onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (prefersReducedMotion()) return; // poster only; the player still opens on click
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.getAttribute("src")) {
            video.src = isDesktop() ? film.hd : film.sd;
          }
          video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [film.hd, film.sd]);

  return (
    <figure className="film">
      <button type="button" className="film__open" data-cursor="play" onClick={onOpen} aria-label={`Play film: ${film.title}`}>
        <div className="film__media" data-reveal="image">
          <div className="reveal__inner">
            <video ref={videoRef} poster={film.poster} muted playsInline loop preload="none" aria-hidden="true" tabIndex={-1} />
          </div>
          <span className="film__play mono" aria-hidden="true">
            Play · {mmss(film.duration)}
          </span>
        </div>
      </button>
      <figcaption className="cap">
        <span className="cap__no mono">N° {pad(index + 1)}</span>
        <span>
          <span className="cap__title">{film.title}</span>
          <span className="cap__meta mono">
            {film.place} · Video by {film.credit.name}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

function FilmPlayer({ film, onClose }: { film: Film; onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  useDialog(rootRef, true, onClose);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (v.paused) v.play().catch(() => {});
  };

  const isPexels = film.credit.platform === "Pexels";

  return createPortal(
    <div ref={rootRef} className="viewer on-dark" role="dialog" aria-modal="true" aria-label={`Film: ${film.title}`}>
      <div className="wrap grid viewer__top">
        <p className="viewer__count mono">{film.place}</p>
        <button type="button" className="viewer__close mono" onClick={onClose} data-autofocus>
          Close <span aria-hidden="true">✕</span>
        </button>
      </div>
      <div className="viewer__stage">
        <video
          ref={videoRef}
          className="player__video"
          src={isDesktop() ? film.hd : film.sd}
          poster={film.poster}
          playsInline
          loop
          controls
          muted
        />
      </div>
      <div className="wrap grid viewer__bottom">
        <div className="viewer__cap">
          <p className="cap__title">{film.title}</p>
          <button type="button" className="link-arrow" onClick={toggleSound} aria-pressed={!muted}>
            {muted ? "Sound on" : "Sound off"}
          </button>
        </div>
        <p className="viewer__credit mono">
          Video by{" "}
          <a href={film.credit.url} target="_blank" rel="noopener noreferrer">
            {film.credit.name}
          </a>
          {isPexels && (
            <>
              {" "}
              on{" "}
              <a href={film.sourceUrl} target="_blank" rel="noopener noreferrer">
                Pexels
              </a>
            </>
          )}
        </p>
      </div>
    </div>,
    document.body,
  );
}

export default function Films({ films }: { films: Film[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const film = open !== null ? films[open] : undefined;

  return (
    <>
      <div className="grid films">
        {films.map((f, i) => (
          <FilmCard key={f.id} film={f} index={i} onOpen={() => setOpen(i)} />
        ))}
      </div>
      {film && <FilmPlayer film={film} onClose={close} />}
    </>
  );
}
