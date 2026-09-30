/**
 * Tiny cross-component signals (no context needed across server boundaries):
 *  - intro: the preloader has wiped away → the hero video may start.
 *  - hero:  the bird has landed → the nav may reveal.
 */
type Listener = () => void;

function signal() {
  let fired = false;
  const listeners = new Set<Listener>();
  return {
    get fired() {
      return fired;
    },
    /** Runs now if already fired. Returns an unsubscribe. */
    on(fn: Listener): () => void {
      if (fired) {
        fn();
        return () => {};
      }
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    fire() {
      if (fired) return;
      fired = true;
      listeners.forEach((fn) => fn());
      listeners.clear();
    },
  };
}

export const intro = signal();
export const heroLanded = signal();

export const INTRO_STORAGE_KEY = "ya:intro";
