/**
 * npm run curate
 *
 * Runs the subject-by-subject Unsplash curation (lib/curation.ts) and writes
 * data/photos.generated.json, which the site uses when no API key is present.
 *
 * - Responses are cached in .cache/unsplash so re-runs cost no requests
 *   (pass --fresh to ignore the cache).
 * - Unsplash demo keys allow 50 requests/hour; a full run needs ~70. If the
 *   limit is hit, curated subjects are kept, the rest keep their previous
 *   entries, and a re-run an hour later completes the set.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { RateLimited, SUBJECTS, curate } from "../lib/curation.ts";
import type { CuratedPhoto } from "../lib/types.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "data", "photos.generated.json");
const CACHE = path.join(ROOT, ".cache", "unsplash");
const fresh = process.argv.includes("--fresh");

const key = process.env.UNSPLASH_ACCESS_KEY;
if (!key) {
  console.error("UNSPLASH_ACCESS_KEY is not set. Add it to .env.local (see .env.example).");
  process.exit(1);
}

let requests = 0;

async function fetchJson(url: string): Promise<unknown> {
  const file = path.join(CACHE, `${createHash("sha1").update(url).digest("hex")}.json`);
  if (!fresh) {
    try {
      return JSON.parse(await readFile(file, "utf8"));
    } catch {
      /* not cached */
    }
  }
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" } });
  requests += 1;
  if (res.status === 403 || res.status === 429) throw new RateLimited();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: unknown = await res.json();
  await mkdir(CACHE, { recursive: true });
  await writeFile(file, JSON.stringify(json));
  return json;
}

async function readPrevious(): Promise<CuratedPhoto[]> {
  try {
    const raw: unknown = JSON.parse(await readFile(OUT, "utf8"));
    return Array.isArray(raw) ? (raw as CuratedPhoto[]) : [];
  } catch {
    return [];
  }
}

console.log(`Curating ${SUBJECTS.length} subjects from Unsplash…\n`);
const previous = await readPrevious();
const { photos, skipped } = await curate(fetchJson, (m) => console.log(m));

// Keep previous entries for subjects that were rate-limited this run.
const limited = new Set(skipped.filter((s) => s.reason === "rate-limited").map((s) => s.subject));
const byKey = new Map(photos.map((p) => [p.subject, p]));
for (const p of previous) if (limited.has(p.subject) && !byKey.has(p.subject)) byKey.set(p.subject, p);

const seen = new Set<string>();
const final = SUBJECTS.map((s) => byKey.get(s.key)).filter((p): p is CuratedPhoto => {
  if (!p || seen.has(p.id)) return false;
  seen.add(p.id);
  return true;
});

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(final, null, 2) + "\n");

const count = (slot: string) => final.filter((p) => p.slot === slot).length;
console.log(`\nWrote ${final.length} photos → data/photos.generated.json  (${requests} API requests)`);
console.log(`  birds ${count("birds")} · landscapes ${count("landscapes")} · wildlife ${count("wildlife")} · macro ${count("macro")} · site ${count("portrait") + count("prints") + count("workshops")}`);
console.log(`  with EXIF: ${final.filter((p) => p.exif).length}`);
if (skipped.length) {
  console.log("\nSkipped:");
  for (const s of skipped) console.log(`  ${s.subject.padEnd(18)} ${s.reason}${limited.has(s.subject) && byKey.has(s.subject) ? " (kept previous)" : ""}`);
}
