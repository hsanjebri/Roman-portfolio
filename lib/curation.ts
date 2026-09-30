/**
 * Curated Unsplash collection: one search per named subject, strict checks,
 * one photo per subject. Shared by the runtime (lib/unsplash.ts, cached 24h)
 * and `npm run curate` (writes data/photos.generated.json).
 *
 * Only type imports here, so Node can run it directly with type stripping.
 */
import type { CuratedPhoto, Slot } from "./types";

export interface Subject {
  key: string;
  slot: Slot;
  query: string;
  /** At least one must appear in the description, alt text or tags. */
  match: string[];
  /** None may appear ("kingfisher" is always excluded). */
  exclude?: string[];
  /** Preferred orientation, to vary the editorial layout. */
  prefer: "landscape" | "portrait";
  common: string;
  latin?: string;
  title: string;
  location: string;
  year: number;
  alt: string;
}

export const MIN_WIDTH = 4000;
const PER_PAGE = 6;
const ALWAYS_EXCLUDE = ["kingfisher"];

export const SUBJECTS: Subject[] = [
  // BIRDS — rare and striking species
  { key: "shoebill", slot: "birds", query: "shoebill", match: ["shoebill", "balaeniceps"], prefer: "portrait", common: "Shoebill", latin: "Balaeniceps rex", title: "The Patient One", location: "Mabamba Swamp, Uganda", year: 2024, alt: "A shoebill standing in swamp vegetation" },
  { key: "quetzal", slot: "birds", query: "resplendent quetzal", match: ["quetzal", "pharomachrus"], prefer: "portrait", common: "Resplendent Quetzal", latin: "Pharomachrus mocinno", title: "Cloud Forest Emerald", location: "Monteverde, Costa Rica", year: 2023, alt: "A resplendent quetzal perched in the cloud forest" },
  { key: "harpy", slot: "birds", query: "harpy eagle", match: ["harpy", "harpia"], prefer: "portrait", common: "Harpy Eagle", latin: "Harpia harpyja", title: "Crown of the Canopy", location: "Darién, Panama", year: 2022, alt: "A harpy eagle with its crest raised" },
  { key: "snowy-owl", slot: "birds", query: "snowy owl", match: ["snowy owl", "bubo scandiacus", "snow owl", "white owl"], prefer: "landscape", common: "Snowy Owl", latin: "Bubo scandiacus", title: "White on White", location: "Churchill, Manitoba", year: 2025, alt: "A snowy owl in a pale winter landscape" },
  { key: "roller", slot: "birds", query: "lilac breasted roller", match: ["lilac breasted", "lilac-breasted", "roller", "coracias"], exclude: ["coaster", "skate"], prefer: "landscape", common: "Lilac-breasted Roller", latin: "Coracias caudatus", title: "Every Colour at Once", location: "Maasai Mara, Kenya", year: 2021, alt: "A lilac-breasted roller perched on a branch" },
  { key: "puffin", slot: "birds", query: "atlantic puffin", match: ["puffin", "fratercula"], prefer: "landscape", common: "Atlantic Puffin", latin: "Fratercula arctica", title: "Cliff-top Sentinel", location: "Skomer, Wales", year: 2024, alt: "An Atlantic puffin on a grassy sea cliff" },
  { key: "macaw", slot: "birds", query: "hyacinth macaw", match: ["hyacinth", "anodorhynchus"], prefer: "portrait", common: "Hyacinth Macaw", latin: "Anodorhynchus hyacinthinus", title: "Cobalt Conversation", location: "Pantanal, Brazil", year: 2023, alt: "A hyacinth macaw in flight over turquoise water" },
  { key: "great-grey-owl", slot: "birds", query: "great grey owl", match: ["great grey owl", "great gray owl", "grey owl", "gray owl", "strix nebulosa"], prefer: "portrait", common: "Great Grey Owl", latin: "Strix nebulosa", title: "Ghost of the Taiga", location: "Oulu, Finland", year: 2025, alt: "A great grey owl with a pale facial disc" },
  { key: "bearded-vulture", slot: "birds", query: "bearded vulture", match: ["bearded vulture", "lammergeier", "lammergeyer", "gypaetus"], prefer: "landscape", common: "Bearded Vulture", latin: "Gypaetus barbatus", title: "Bone Breaker", location: "Drakensberg, Lesotho", year: 2020, alt: "A bearded vulture gliding over a dark forested slope" },
  { key: "mandarin", slot: "birds", query: "mandarin duck", match: ["mandarin", "aix galericulata"], prefer: "landscape", common: "Mandarin Duck", latin: "Aix galericulata", title: "Painted Water", location: "Virginia Water, Surrey", year: 2022, alt: "A male mandarin duck on still water" },
  { key: "secretary", slot: "birds", query: "secretary bird", match: ["secretary", "sagittarius"], prefer: "portrait", common: "Secretary Bird", latin: "Sagittarius serpentarius", title: "The Long Stride", location: "Serengeti, Tanzania", year: 2021, alt: "A secretary bird walking through savanna grass" },
  { key: "hoopoe", slot: "birds", query: "hoopoe bird", match: ["hoopoe", "upupa"], prefer: "landscape", common: "Eurasian Hoopoe", latin: "Upupa epops", title: "Crest Unfolded", location: "Merzouga, Morocco", year: 2023, alt: "A Eurasian hoopoe with its crest showing" },
  { key: "flamingo", slot: "birds", query: "greater flamingo", match: ["flamingo", "phoenicopterus"], prefer: "landscape", common: "Greater Flamingo", latin: "Phoenicopterus roseus", title: "Salt and Rose", location: "Walvis Bay, Namibia", year: 2024, alt: "Greater flamingos wading in shallow water in front of reeds" },
  { key: "peregrine", slot: "birds", query: "peregrine falcon", match: ["peregrine", "falco peregrinus"], prefer: "portrait", common: "Peregrine Falcon", latin: "Falco peregrinus", title: "Before the Stoop", location: "Big Sur, California", year: 2022, alt: "A peregrine falcon perched on rock" },

  // LANDSCAPES
  { key: "dunes-dawn", slot: "landscapes", query: "sahara desert dunes sunrise", match: ["dune", "sahara", "desert", "sand"], prefer: "landscape", common: "Sahara dunes at dawn", title: "The First Hour", location: "Erg Chebbi, Morocco", year: 2023, alt: "Sand dunes in low dawn light" },
  { key: "misty-ridge", slot: "landscapes", query: "misty mountain ridge", match: ["mist", "fog", "misty", "foggy", "haze"], prefer: "landscape", common: "Misty mountain ridge", title: "Ridge After Rain", location: "Great Smoky Mountains, Tennessee", year: 2021, alt: "Layered mountain ridges in mist" },
  { key: "salt-lake", slot: "landscapes", query: "salt flat lake desert", match: ["salt", "chott", "salar", "flat"], prefer: "landscape", common: "Salt lake", title: "Mirror of Salt", location: "Chott el Djerid, Tunisia", year: 2020, alt: "A vast salt flat under open sky" },
  { key: "cliffs", slot: "landscapes", query: "coastal cliffs ocean", match: ["cliff", "cliffs", "coast"], prefer: "portrait", common: "Coastal cliffs", title: "Where the Land Ends", location: "Isle of Skye, Scotland", year: 2024, alt: "Sea cliffs above the ocean" },
  { key: "fog-forest", slot: "landscapes", query: "forest in fog", match: ["fog", "mist", "foggy", "misty"], exclude: ["city", "street"], prefer: "portrait", common: "Forest in fog", title: "The Quiet Between Trees", location: "Olympic Peninsula, Washington", year: 2022, alt: "Tall trees disappearing into fog" },
  { key: "desert-stars", slot: "landscapes", query: "milky way desert night sky", match: ["milky way", "stars", "starry", "night sky", "astro"], prefer: "landscape", common: "Night sky over desert", title: "Long Exposure, No Moon", location: "Namib Desert, Namibia", year: 2025, alt: "Stars over a dark desert landscape" },

  // WILDLIFE
  { key: "fennec", slot: "wildlife", query: "fennec fox", match: ["fennec", "vulpes zerda"], prefer: "landscape", common: "Fennec Fox", latin: "Vulpes zerda", title: "All Ears", location: "Grand Erg Oriental, Algeria", year: 2023, alt: "Three fennec foxes resting together on a rock" },
  { key: "snow-leopard", slot: "wildlife", query: "snow leopard", match: ["snow leopard", "panthera uncia"], prefer: "landscape", common: "Snow Leopard", latin: "Panthera uncia", title: "Grey Ghost", location: "Spiti Valley, India", year: 2024, alt: "A snow leopard among rocks" },
  { key: "red-fox-snow", slot: "wildlife", query: "red fox snow", match: ["fox"], exclude: ["fennec", "arctic fox"], prefer: "portrait", common: "Red Fox", latin: "Vulpes vulpes", title: "Listening Under Snow", location: "Hokkaido, Japan", year: 2022, alt: "A red fox in snow" },
  { key: "arctic-wolf", slot: "wildlife", query: "arctic wolf", match: ["arctic wolf", "white wolf", "canis lupus arctos"], prefer: "landscape", common: "Arctic Wolf", latin: "Canis lupus arctos", title: "Pale Traveller", location: "Ellesmere Island, Nunavut", year: 2025, alt: "Two white Arctic wolves resting among fallen logs" },
  { key: "oryx", slot: "wildlife", query: "oryx desert", match: ["oryx", "gemsbok"], prefer: "landscape", common: "Gemsbok", latin: "Oryx gazella", title: "Horns and Heat", location: "Sossusvlei, Namibia", year: 2021, alt: "A lone oryx crossing red desert sand" },
  { key: "lynx", slot: "wildlife", query: "lynx", match: ["lynx"], prefer: "portrait", common: "Eurasian Lynx", latin: "Lynx lynx", title: "The Held Gaze", location: "Białowieża Forest, Poland", year: 2023, alt: "A lynx looking toward the camera" },

  // MACRO
  { key: "dragonfly", slot: "macro", query: "dragonfly dew", match: ["dragonfly", "dragon fly"], exclude: ["damselfly", "damselflies"], prefer: "landscape", common: "Dragonfly", latin: "Anisoptera", title: "Morning Weight", location: "Algonquin, Ontario", year: 2022, alt: "A dragonfly with black-and-white banded wings resting on a grass stem" },
  { key: "jumping-spider", slot: "macro", query: "jumping spider eyes macro", match: ["jumping spider", "salticid", "spider"], prefer: "landscape", common: "Jumping Spider", latin: "Salticidae", title: "Eight Eyes Open", location: "Kruger, South Africa", year: 2024, alt: "Close-up of a jumping spider's eyes" },
  { key: "butterfly-scales", slot: "macro", query: "butterfly wing macro", match: ["butterfly", "wing", "moth"], prefer: "landscape", common: "Butterfly wing scales", latin: "Lepidoptera", title: "Dust of Colour", location: "Mindo, Ecuador", year: 2023, alt: "Macro detail of butterfly wing scales" },
  { key: "frost-leaf", slot: "macro", query: "frost on leaves", match: ["frost", "ice", "frozen", "hoarfrost"], prefer: "portrait", common: "Hoarfrost on leaves", title: "Overnight Crystals", location: "Cairngorms, Scotland", year: 2025, alt: "Hoarfrost covering a carpet of fallen oak leaves" },

  // SITE
  { key: "portrait", slot: "portrait", query: "wildlife photographer telephoto lens", match: ["photographer", "camera", "lens", "photography"], exclude: ["bird", "owl", "eagle", "duck"], prefer: "portrait", common: "Rowan Hawthorne", title: "In the Field", location: "Cairngorms, Scotland", year: 2026, alt: "A wildlife photographer crouched with a camera in front of a red deer stag" },
  { key: "prints", slot: "prints", query: "desert dunes minimal", match: ["dune", "sand", "desert"], prefer: "landscape", common: "Namib dunes", title: "Edition I — Sand Line", location: "Sossusvlei, Namibia", year: 2024, alt: "Minimal sand dune ridge in soft light" },
  { key: "workshops", slot: "workshops", query: "photographer camera tripod outdoors sunrise", match: ["photographer", "camera", "tripod", "photography"], exclude: ["bird", "owl", "eagle"], prefer: "landscape", common: "Field workshop", title: "Before Sunrise", location: "Cairngorms, Scotland", year: 2026, alt: "A photographer silhouetted beside a tripod at sunset" },
];

/* ------------------------------------------------------------------ API */

interface ApiTag {
  title?: string;
}

interface ApiExif {
  make?: string | null;
  model?: string | null;
  name?: string | null;
  exposure_time?: string | null;
  aperture?: string | null;
  focal_length?: string | null;
  iso?: number | null;
}

export interface ApiPhoto {
  id: string;
  width: number;
  height: number;
  color: string | null;
  blur_hash: string | null;
  likes: number;
  description: string | null;
  alt_description: string | null;
  urls: { raw: string };
  links: { html: string };
  user: { name: string; links: { html: string } };
  tags?: ApiTag[];
  exif?: ApiExif;
}

export class RateLimited extends Error {
  constructor() {
    super("Unsplash rate limit reached");
    this.name = "RateLimited";
  }
}

/** Fetch JSON or throw — RateLimited on 403/429. Injected so runtime and script can cache differently. */
export type FetchJson = (url: string) => Promise<unknown>;

export interface Skip {
  subject: string;
  reason: string;
}

export interface CurateResult {
  photos: CuratedPhoto[];
  skipped: Skip[];
}

const API = "https://api.unsplash.com";

function isApiPhoto(v: unknown): v is ApiPhoto {
  if (typeof v !== "object" || v === null) return false;
  const p = v as Partial<ApiPhoto>;
  return typeof p.id === "string" && typeof p.width === "number" && typeof p.height === "number" && typeof p.urls?.raw === "string" && typeof p.user?.name === "string";
}

function haystack(p: ApiPhoto): string {
  return [p.description, p.alt_description, ...(p.tags ?? []).map((t) => t.title)].filter(Boolean).join(" · ").toLowerCase();
}

function has(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w.toLowerCase()));
}

/** "Canon EOS R5 · 600mm · f/6.3 · 1/2000s · ISO 800" from real EXIF only; undefined if nothing usable. */
export function formatExif(exif: ApiExif | undefined): string | undefined {
  if (!exif) return undefined;
  const parts: string[] = [];
  const make = exif.make?.trim() ?? "";
  const model = exif.model?.trim() ?? "";
  let camera = model && make && !model.toLowerCase().startsWith(make.split(" ")[0].toLowerCase()) ? `${make} ${model}` : model || exif.name?.trim() || "";
  // Brand casing only — model codes stay exactly as recorded.
  camera = camera
    .replace(/\s+/g, " ")
    .replace(/^NIKON( CORPORATION)?(?=\s|$)/i, "Nikon")
    .replace(/^SONY(?=\s|$)/i, "Sony")
    .replace(/^OLYMPUS( IMAGING CORP\.| CORPORATION)?/i, "Olympus")
    .replace(/^FUJIFILM(?=\s|$)/i, "Fujifilm")
    .replace(/^Canon Canon/i, "Canon");
  if (camera) parts.push(camera);
  const focal = parseFloat(exif.focal_length ?? "");
  if (Number.isFinite(focal) && focal > 0) parts.push(`${Math.round(focal)}mm`);
  const ap = parseFloat(exif.aperture ?? "");
  if (Number.isFinite(ap) && ap > 0) parts.push(`f/${Number(ap.toFixed(1))}`);
  const exp = exif.exposure_time?.trim();
  if (exp) {
    const n = Number(exp);
    if (exp.includes("/")) parts.push(`${exp}s`);
    else if (Number.isFinite(n) && n > 0) parts.push(n >= 1 ? `${n}s` : `1/${Math.round(1 / n)}s`);
  }
  if (typeof exif.iso === "number" && exif.iso > 0) parts.push(`ISO ${exif.iso}`);
  // A camera alone isn't a technical line.
  return parts.length >= 2 ? parts.join(" · ") : undefined;
}

function toPhoto(p: ApiPhoto, s: Subject): CuratedPhoto {
  return {
    id: `us-${p.id}`,
    src: p.urls.raw,
    width: p.width,
    height: p.height,
    color: p.color ?? "#1A1B1A",
    blurHash: p.blur_hash ?? null,
    // Unsplash's generated alt text is often wrong about species ("black and
    // white eagle" for a snowy owl); the subject's own description is verified.
    alt: s.alt,
    title: s.title,
    common: s.common,
    latin: s.latin,
    location: s.location,
    year: s.year,
    exif: formatExif(p.exif),
    credit: { name: p.user.name, url: p.user.links.html, platform: "Unsplash" },
    sourceUrl: p.links.html,
    slot: s.slot,
    subject: s.key,
  };
}

/**
 * Curate every subject. Stops calling the API after a rate limit and reports
 * the remaining subjects as skipped, so callers can keep earlier results.
 */
export async function curate(fetchJson: FetchJson, log: (msg: string) => void = () => {}): Promise<CurateResult> {
  const used = new Set<string>();
  const photos: CuratedPhoto[] = [];
  const skipped: Skip[] = [];
  let limited = false;

  for (const s of SUBJECTS) {
    if (limited) {
      skipped.push({ subject: s.key, reason: "rate-limited" });
      continue;
    }
    try {
      const params = new URLSearchParams({ query: s.query, per_page: String(PER_PAGE), content_filter: "high" });
      const json = await fetchJson(`${API}/search/photos?${params}`);
      const results = (json as { results?: unknown }).results;
      const list = Array.isArray(results) ? results.filter(isApiPhoto) : [];
      const exclude = [...ALWAYS_EXCLUDE, ...(s.exclude ?? [])];

      const eligible = list
        .filter((p) => p.urls.raw.startsWith("https://images.unsplash.com/")) // skip Unsplash+ (licensed)
        .filter((p) => p.width >= MIN_WIDTH)
        .filter((p) => !used.has(p.id))
        .filter((p) => !has(haystack(p), exclude))
        .sort((a, b) => {
          const oa = (a.width >= a.height ? "landscape" : "portrait") === s.prefer ? 1 : 0;
          const ob = (b.width >= b.height ? "landscape" : "portrait") === s.prefer ? 1 : 0;
          return ob - oa || b.likes - a.likes;
        });

      // Search results carry a few tags; confirm against the full photo (all tags + EXIF).
      let chosen: ApiPhoto | undefined;
      for (const candidate of eligible.slice(0, 3)) {
        const quick = has(haystack(candidate), s.match);
        const detail = await fetchJson(`${API}/photos/${candidate.id}`);
        if (!isApiPhoto(detail)) continue;
        const text = haystack(detail);
        if (has(text, exclude)) continue;
        if (quick || has(text, s.match)) {
          chosen = detail;
          break;
        }
      }

      if (!chosen) {
        const reason = list.length === 0 ? "no results" : eligible.length === 0 ? `no result ≥ ${MIN_WIDTH}px wide` : "no result matched the subject";
        skipped.push({ subject: s.key, reason });
        log(`  ✕ ${s.key.padEnd(18)} ${reason}`);
        continue;
      }

      used.add(chosen.id);
      const photo = toPhoto(chosen, s);
      photos.push(photo);
      log(`  ✓ ${s.key.padEnd(18)} ${chosen.width}×${chosen.height}  ${photo.credit.name}${photo.exif ? `  [${photo.exif}]` : ""}`);
    } catch (err) {
      if (err instanceof RateLimited) {
        limited = true;
        skipped.push({ subject: s.key, reason: "rate-limited" });
        log(`  ! rate limit reached at ${s.key}`);
      } else {
        skipped.push({ subject: s.key, reason: err instanceof Error ? err.message : "request failed" });
      }
    }
  }
  return { photos, skipped };
}
