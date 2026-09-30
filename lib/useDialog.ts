"use client";

import { useEffect, useRef, type RefObject } from "react";
import { lockScroll, unlockScroll } from "./motion";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal behaviour for full-screen overlays: scroll lock, focus trap, Esc to
 * close, initial focus, and focus restored to the opener on close.
 * Handlers are read through refs, so changing them never re-runs the setup.
 */
export function useDialog(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
  onKey?: (e: KeyboardEvent) => void,
): void {
  const closeRef = useRef(onClose);
  const keyRef = useRef(onKey);
  useEffect(() => {
    closeRef.current = onClose;
    keyRef.current = onKey;
  });

  useEffect(() => {
    if (!open) return;
    const root = ref.current;
    if (!root) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    lockScroll();
    const first = root.querySelector<HTMLElement>("[data-autofocus]") ?? root.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus({ preventScroll: true });

    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key === "Tab") {
        const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
        return;
      }
      keyRef.current?.(e);
    };
    document.addEventListener("keydown", handle);

    return () => {
      document.removeEventListener("keydown", handle);
      unlockScroll();
      opener?.focus({ preventScroll: true });
    };
  }, [open, ref]);
}
