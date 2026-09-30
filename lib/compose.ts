import type { Photo } from "./types";

export type RowKind = "bleed" | "wide" | "pair" | "pair-rev" | "single" | "single-portrait";

export interface Row {
  kind: RowKind;
  items: Photo[];
  /** Portrait singles alternate sides. */
  left?: boolean;
}

const ratio = (p: Photo) => p.width / p.height;

/**
 * Editorial rhythm for a series — never a uniform grid:
 * lead landscape (full-bleed if panoramic) → 2/3 + 1/3 → offset single → 1/3 + 2/3 → …
 * Every image keeps its own aspect ratio.
 */
export function compose(photos: Photo[]): Row[] {
  const rows: Row[] = [];
  const queue = [...photos];
  let step = 0;
  let portraitLeft = false;

  while (queue.length) {
    const beat = step % 4;
    step += 1;

    if (beat === 0) {
      const i = queue.findIndex((p) => ratio(p) >= 1.3);
      if (i >= 0) {
        const [p] = queue.splice(i, 1);
        rows.push({ kind: ratio(p) >= 1.6 ? "bleed" : "wide", items: [p] });
        continue;
      }
    }

    if ((beat === 1 || beat === 3) && queue.length >= 2) {
      let [major, minor] = queue.splice(0, 2);
      if (ratio(minor) > ratio(major)) [major, minor] = [minor, major];
      rows.push({ kind: beat === 1 ? "pair" : "pair-rev", items: [major, minor] });
      continue;
    }

    const p = queue.shift();
    if (!p) break;
    if (ratio(p) < 1) {
      rows.push({ kind: "single-portrait", items: [p], left: portraitLeft });
      portraitLeft = !portraitLeft;
    } else {
      rows.push({ kind: "single", items: [p] });
    }
  }
  return rows;
}

/** `sizes` for each slot, matching the CSS grid spans. */
export function sizesFor(kind: RowKind, slot: number): string {
  switch (kind) {
    case "bleed":
      return "100vw";
    case "wide":
      return "(min-width: 768px) 84vw, 100vw";
    case "pair":
    case "pair-rev":
      return slot === 0 ? "(min-width: 768px) 64vw, 100vw" : "(min-width: 768px) 26vw, 84vw";
    case "single":
      return "(min-width: 768px) 58vw, 100vw";
    case "single-portrait":
      return "(min-width: 768px) 34vw, 84vw";
  }
}
