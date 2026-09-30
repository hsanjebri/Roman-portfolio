# Rowan Hawthorne — Wildlife & Nature Photography

Concept portfolio for a fictional wildlife photographer. Next.js (App Router, TypeScript strict), GSAP + ScrollTrigger + SplitText, Lenis. No UI or CSS libraries.

Concept project — design & development by [Hassan Jebri](https://hassan-jebri-portfolio.vercel.app/).

## Run

```bash
npm install
cp .env.example .env.local   # add your keys (optional, see below)
npm run curate               # build the photo collection (needs UNSPLASH_ACCESS_KEY)
npm run dev                  # http://localhost:3000
npm run build && npm start
```

## Environment

| Variable | Where to get it | Used for |
| --- | --- | --- |
| `UNSPLASH_ACCESS_KEY` | [unsplash.com/oauth/applications](https://unsplash.com/oauth/applications) → New Application → **Access Key** | Photo curation (`npm run curate`) and the 24 h live refresh |
| `PEXELS_API_KEY` | [pexels.com/api](https://www.pexels.com/api/) → **Your API Key** | The Films section |

Both are optional at runtime. The site always renders from the committed `data/photos.generated.json`; set `UNSPLASH_LIVE_REFRESH=true` (production-tier key) to re-curate on the server every 24 h instead. Without a Pexels key the Films section is hidden.

## Photos

`lib/curation.ts` lists one **named subject** per image (Shoebill, Snowy Owl, fennec fox, jumping spider…) with its series, Latin name, title, location and year. For each subject it:

1. searches Unsplash once (`per_page` 6),
2. keeps only originals **≥ 4000 px wide**, not Unsplash+,
3. drops anything whose description, alt text or tags mention *kingfisher* (the kingfisher lives in the hero video only),
4. prefers the subject's orientation (to vary the layout), then likes,
5. confirms the subject against the full photo's tags, and reads its **EXIF**,
6. de-duplicates by photo id across all series; a subject with no genuine match is **skipped**, never substituted.

`npm run curate` writes the result to `data/photos.generated.json` and prints counts and skipped subjects. Responses are cached in `.cache/unsplash`, so re-runs are free; `--fresh` ignores the cache. A demo key allows 50 requests/hour and a full run needs ~70 — if the limit is hit, run it again an hour later and it completes from the cache.

Images are served from `urls.raw` with `w`, `q=85` and `auto=format`, through `next/image` with per-slot `sizes`, and paint their dominant colour and BlurHash before the full image fades in. Photographers are credited in the lightbox and on `/credits`, with Unsplash's UTM parameters.

## Hero timing

`REVEAL_AT` in `lib/config.ts` is the second at which the bird lands (default `4.3`). Nothing typographic moves before it.

## Structure

```
app/                 layout (fonts, boot script), page, credits
components/          hero, nav, gallery, lightbox, featured, films, about, prints, contact, footer, cursor, preloader, motion
lib/                 config, curation, unsplash, pexels, motion (GSAP presets), image loader, blurhash, useDialog
data/                photos.generated.json, films fallback
scripts/             curate-photos.ts
```
