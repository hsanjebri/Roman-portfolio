import type { Film } from "@/lib/types";

/**
 * Films come from Pexels (PEXELS_API_KEY). Without a key the Films section is
 * hidden rather than filled with the hero clip — the kingfisher appears only
 * in the hero.
 */
export const FALLBACK_FILMS: Film[] = [];
