import { FALLBACK_FILMS } from "@/data/films";
import { FILM_QUERIES } from "./content";
import type { Film } from "./types";

const API = "https://api.pexels.com/videos/search";
const REVALIDATE = 86400;

interface PexelsFile {
  quality: string | null;
  file_type: string;
  width: number | null;
  height: number | null;
  link: string;
}

interface PexelsVideo {
  id: number;
  url: string;
  image: string;
  duration: number;
  user: { name: string; url: string };
  video_files: PexelsFile[];
}

function isPexelsVideo(value: unknown): value is PexelsVideo {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Partial<PexelsVideo>;
  return typeof v.id === "number" && typeof v.image === "string" && Array.isArray(v.video_files) && typeof v.user?.name === "string";
}

/** Largest MP4 no wider than `max`, else the smallest available. */
function pick(files: PexelsFile[], min: number, max: number): PexelsFile | undefined {
  const mp4 = files.filter((f) => f.file_type === "video/mp4" && typeof f.width === "number");
  const inRange = mp4.filter((f) => (f.width ?? 0) >= min && (f.width ?? 0) <= max).sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  if (inRange[0]) return inRange[0];
  return mp4.sort((a, b) => (a.width ?? 0) - (b.width ?? 0))[0];
}

async function searchOne(query: string, key: string, skip: Set<number>): Promise<PexelsVideo | undefined> {
  const params = new URLSearchParams({ query, per_page: "6", orientation: "landscape", size: "medium" });
  try {
    const res = await fetch(`${API}?${params}`, {
      headers: { Authorization: key },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return undefined;
    const json: unknown = await res.json();
    const videos = (json as { videos?: unknown }).videos;
    if (!Array.isArray(videos)) return undefined;
    // The kingfisher belongs to the hero only.
    return videos.filter(isPexelsVideo).find((v) => !skip.has(v.id) && v.duration >= 6 && !v.url.toLowerCase().includes("kingfisher"));
  } catch {
    return undefined;
  }
}

/**
 * Short nature films from Pexels, fetched server-side and cached for a day.
 * Without PEXELS_API_KEY the Films section is hidden.
 */
export async function getFilms(): Promise<Film[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return FALLBACK_FILMS;

  const seen = new Set<number>();
  const films: Film[] = [];
  // Sequential so duplicates across queries can be skipped.
  for (const q of FILM_QUERIES) {
    const v = await searchOne(q.query, key, seen);
    if (!v) continue;
    const hd = pick(v.video_files, 1280, 1920);
    const sd = pick(v.video_files, 540, 960);
    if (!hd || !sd) continue;
    seen.add(v.id);
    films.push({
      id: `px-${v.id}`,
      title: q.title,
      place: q.place,
      poster: v.image,
      hd: hd.link,
      sd: sd.link,
      duration: v.duration,
      credit: { name: v.user.name, url: v.user.url, platform: "Pexels" },
      sourceUrl: v.url,
    });
  }
  return films.length ? films : FALLBACK_FILMS;
}
