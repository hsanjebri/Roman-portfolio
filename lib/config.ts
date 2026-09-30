/**
 * Second of the hero clip at which the bird lands on the twig.
 * Nothing typographic moves until the video's currentTime reaches this.
 * If your footage lands earlier or later, change this one number.
 */
export const REVEAL_AT = 4.3;

/**
 * Hero footage. The default host sends `Access-Control-Allow-Origin: *`, so the
 * page can read its pixels and match the backdrop colour. If you switch to a
 * host without CORS headers, set VIDEO_CORS to false (drawing still works,
 * colour matching quietly falls back to the CSS value).
 */
export const VIDEO_SRC = "https://thinkingods.com/demos/kingfisher-hero/hero.mp4";
export const VIDEO_POSTER = "/hero-poster.jpg";
export const VIDEO_CORS = true;

/** Hard ceiling: the hero is revealed after this long no matter what the video does. */
export const REVEAL_FALLBACK_MS = 9000;

/** Preloader never holds the page longer than this. */
export const PRELOADER_MAX_MS = 2500;

export const SITE = {
  name: "Rowan Hawthorne",
  role: "Wildlife & Nature Photography",
  email: "studio@rowanhawthorne.com",
  instagram: "@rowan.hawthorne",
  instagramUrl: "https://www.instagram.com/",
  location: "Inverness, Scotland",
  author: { name: "Hassan Jebri", url: "https://hassan-jebri-portfolio.vercel.app/" },
  utm: "?utm_source=rowan_hawthorne_portfolio&utm_medium=referral",
} as const;
