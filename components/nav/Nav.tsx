"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { SITE } from "@/lib/config";
import { heroLanded } from "@/lib/intro";
import { scrollToHash } from "@/lib/motion";
import { useDialog } from "@/lib/useDialog";

/** In-page smooth scroll when the section exists here; normal navigation otherwise. */
function onSectionLink(e: MouseEvent<HTMLAnchorElement>, after?: () => void): void {
  const href = e.currentTarget.getAttribute("href") ?? "";
  if (!document.getElementById(href.split("#")[1] ?? "")) return;
  e.preventDefault();
  after?.();
  // Wait a frame so a closing overlay releases the scroll lock first.
  requestAnimationFrame(() => requestAnimationFrame(() => scrollToHash(href)));
}

const LINKS = [
  { href: "/#work", label: "Work" },
  { href: "/#films", label: "Films" },
  { href: "/#about", label: "About" },
  { href: "/#prints", label: "Prints" },
  { href: "/#contact", label: "Contact" },
] as const;

/**
 * Fixed nav. On the home page it waits for the bird to land; after the hero
 * it hides on scroll down and returns on scroll up, on a solid ground.
 */
export default function Nav({ waitForHero = false }: { waitForHero?: boolean }) {
  const [shown, setShown] = useState(!waitForHero);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!waitForHero) return;
    return heroLanded.on(() => setShown(true));
  }, [waitForHero]);

  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const past = y > window.innerHeight * 0.85;
      setSolid(past);
      setHidden(past && y > last + 2);
      if (y < last - 2 || !past) setHidden(false);
      last = y;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback(() => setOpen(false), []);
  useDialog(menuRef, open, close);

  const cls = ["nav", shown && "is-in", hidden && !open && "is-hidden", solid && "is-solid"].filter(Boolean).join(" ");

  return (
    <>
      <header className={cls}>
        <div className="wrap grid nav__inner">
          <Link href="/" className="nav__brand mono" aria-label={`${SITE.name} — home`}>
            Rowan Hawthorne
          </Link>
          <nav className="nav__links" aria-label="Primary">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="mono" onClick={(e) => onSectionLink(e)}>
                {l.label}
              </a>
            ))}
          </nav>
          <a href="/#contact" className="nav__cta btn" onClick={(e) => onSectionLink(e)}>
            <span>Book a shoot</span>
          </a>
          <button
            type="button"
            className="nav__menu mono"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
        </div>
      </header>

      {open && (
        <div ref={menuRef} id="site-menu" className="menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="wrap grid menu__top">
            <span className="mono">Rowan Hawthorne</span>
            <button type="button" className="menu__close mono" onClick={close} data-autofocus>
              Close
            </button>
          </div>
          <nav className="wrap menu__list" aria-label="Menu">
            {LINKS.map((l, i) => (
              <a key={l.href} href={l.href} onClick={(e) => onSectionLink(e, close)}>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="wrap menu__foot mono">
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <span>{SITE.location}</span>
          </div>
        </div>
      )}
    </>
  );
}
