import generated from "@/data/photos.generated.json";
import { RateLimited, SUBJECTS, curate } from "./curation";
import type { CuratedPhoto, Library, Photo, SeriesKey } from "./types";

const REVALIDATE = 86400;
const FEATURED_COUNT = 12;

function isCurated(v: unknown): v is CuratedPhoto {
  if (typeof v !== "object" || v === null) return false;
  const p = v as Partial<CuratedPhoto>;
  return typeof p.id === "string" && typeof p.src === "string" && typeof p.slot === "string" && typeof p.subject === "string";
}

/** The committed, curated list — the site works from this alone. */
const SNAPSHOT: CuratedPhoto[] = (generated as unknown[]).filter(isCurated);

async function fetchJson(url: string, key: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
    next: { revalidate: REVALIDATE },
  });
  if (res.status === 403 || res.status === 429) throw new RateLimited();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * The site serves the committed snapshot (data/photos.generated.json).
 * With UNSPLASH_LIVE_REFRESH=true it re-curates on the server (cached 24h),
 * merged per subject with the snapshot so a failed or rate-limited subject
 * keeps its last good photo. Off by default: a full pass costs ~70 requests
 * and demo keys allow 50/hour.
 */
async function collection(): Promise<CuratedPhoto[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key || process.env.UNSPLASH_LIVE_REFRESH !== "true") return SNAPSHOT;
  try {
    const { photos } = await curate((url) => fetchJson(url, key));
    const live = new Map(photos.map((p) => [p.subject, p]));
    const old = new Map(SNAPSHOT.map((p) => [p.subject, p]));
    const seen = new Set<string>();
    const out: CuratedPhoto[] = [];
    for (const s of SUBJECTS) {
      const p = live.get(s.key) ?? old.get(s.key);
      if (p && !seen.has(p.id)) {
        seen.add(p.id);
        out.push(p);
      }
    }
    return out;
  } catch {
    return SNAPSHOT;
  }
}

const strip = ({ slot: _slot, subject: _subject, ...photo }: CuratedPhoto): Photo => photo;

export async function getLibrary(): Promise<Library> {
  const all = await collection();
  const pick = (slot: CuratedPhoto["slot"]) => all.filter((p) => p.slot === slot).map(strip);
  const series: Record<SeriesKey, Photo[]> = {
    birds: pick("birds"),
    landscapes: pick("landscapes"),
    wildlife: pick("wildlife"),
    macro: pick("macro"),
  };
  return {
    series,
    featured: series.birds.slice(0, FEATURED_COUNT),
    portrait: pick("portrait")[0] ?? null,
    prints: pick("prints")[0] ?? null,
    workshops: pick("workshops")[0] ?? null,
  };
}

/** Unique photos, for the credits page. */
export function allPhotos(lib: Library): Photo[] {
  const map = new Map<string, Photo>();
  const add = (p: Photo | null) => p && map.set(p.id, p);
  Object.values(lib.series).flat().forEach(add);
  lib.featured.forEach(add);
  [lib.portrait, lib.prints, lib.workshops].forEach(add);
  return [...map.values()];
}
