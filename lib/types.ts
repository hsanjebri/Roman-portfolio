export type SeriesKey = "birds" | "landscapes" | "wildlife" | "macro";

/** Where a curated photo is used on the site. */
export type Slot = SeriesKey | "portrait" | "prints" | "workshops";

export interface Credit {
  name: string;
  url: string;
  platform: "Unsplash" | "Pexels";
}

export interface Photo {
  /** Unsplash photo id, prefixed — unique across the collection. */
  id: string;
  /** urls.raw — the loader appends w / q / auto=format. */
  src: string;
  width: number;
  height: number;
  /** Dominant colour — painted behind the image so nothing pops in. */
  color: string;
  /** BlurHash from Unsplash, decoded client-side for the blur-up. */
  blurHash: string | null;
  alt: string;
  title: string;
  /** Common name, e.g. "Shoebill" or "Sahara dunes". */
  common: string;
  /** Correct binomial, e.g. "Balaeniceps rex". Absent for landscapes. */
  latin?: string;
  location: string;
  year: number;
  /** "Canon EOS R5 · 600mm · f/6.3 · 1/2000s · ISO 800" — only from real EXIF. */
  exif?: string;
  credit: Credit;
  /** Photo page on Unsplash. */
  sourceUrl: string;
}

export interface CuratedPhoto extends Photo {
  slot: Slot;
  /** Subject key from lib/curation.ts. */
  subject: string;
}

export interface Library {
  series: Record<SeriesKey, Photo[]>;
  /** Featured horizontal series — "Rare Birds". */
  featured: Photo[];
  portrait: Photo | null;
  prints: Photo | null;
  workshops: Photo | null;
}

export interface Film {
  id: string;
  title: string;
  place: string;
  poster: string;
  /** ~1920px file for desktop. */
  hd: string;
  /** ~640–960px file for mobile. */
  sd: string;
  duration: number;
  credit: Credit;
  sourceUrl: string;
}
