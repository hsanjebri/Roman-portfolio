import type { ImageLoaderProps } from "next/image";
import type { Photo } from "./types";

/**
 * Every curated original is ≥ 4000px wide, so the srcset can go up to 3840
 * (4K full-bleed and the lightbox on retina). Most slots resolve to ≤ 2400.
 */
const MAX_W = 3840;

export function isUnsplash(src: string): boolean {
  return src.startsWith("https://images.unsplash.com/");
}

/** urls.raw + w / q / auto=format (AVIF or WebP, per the browser's Accept header). */
export function unsplashUrl(raw: string, width: number, quality = 85): string {
  const url = new URL(raw);
  url.searchParams.set("w", String(Math.min(Math.round(width), MAX_W)));
  url.searchParams.set("q", String(quality));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
}

/** next/image loader: Unsplash resizes and encodes at the edge. */
export function unsplashLoader({ src, width, quality }: ImageLoaderProps): string {
  return unsplashUrl(src, width, quality ?? 85);
}

export function loaderFor(photo: Pick<Photo, "src">): ((p: ImageLoaderProps) => string) | undefined {
  return isUnsplash(photo.src) ? unsplashLoader : undefined;
}

/** 64px version for the lightbox blur-up (used when there's no BlurHash). */
export function tinyUrl(photo: Pick<Photo, "src">): string {
  return isUnsplash(photo.src) ? unsplashUrl(photo.src, 64, 40) : photo.src;
}

export function withUtm(url: string, utm: string): string {
  if (!url.includes("unsplash.com")) return url;
  return url + (url.includes("?") ? `&${utm.slice(1)}` : utm);
}
