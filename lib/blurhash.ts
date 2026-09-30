/**
 * Minimal BlurHash decoder (https://blurha.sh, MIT algorithm) → tiny data URL.
 * Renders a 32×32 image once per hash; the browser scales and blurs it.
 */
const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~";

function decode83(str: string): number {
  let v = 0;
  for (const c of str) v = v * 83 + CHARS.indexOf(c);
  return v;
}

function sRGBToLinear(v: number): number {
  const x = v / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function linearToSRGB(v: number): number {
  const x = Math.max(0, Math.min(1, v));
  return x <= 0.0031308 ? Math.round(x * 12.92 * 255 + 0.5) : Math.round((1.055 * Math.pow(x, 1 / 2.4) - 0.055) * 255 + 0.5);
}

const signPow = (v: number, e: number) => Math.sign(v) * Math.pow(Math.abs(v), e);

function decode(hash: string, w: number, h: number): Uint8ClampedArray | null {
  if (!hash || hash.length < 6) return null;
  const size = decode83(hash[0]);
  const ny = Math.floor(size / 9) + 1;
  const nx = (size % 9) + 1;
  if (hash.length !== 4 + 2 * nx * ny) return null;
  const maxAc = (decode83(hash[1]) + 1) / 166;

  const colors: Array<[number, number, number]> = [];
  const dc = decode83(hash.slice(2, 6));
  colors.push([sRGBToLinear(dc >> 16), sRGBToLinear((dc >> 8) & 255), sRGBToLinear(dc & 255)]);
  for (let i = 1; i < nx * ny; i++) {
    const v = decode83(hash.slice(4 + i * 2, 6 + i * 2));
    const q = (n: number) => signPow((n - 9) / 9, 2) * maxAc;
    colors.push([q(Math.floor(v / 361)), q(Math.floor(v / 19) % 19), q(v % 19)]);
  }

  const px = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0;
      for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
          const basis = Math.cos((Math.PI * x * i) / w) * Math.cos((Math.PI * y * j) / h);
          const c = colors[i + j * nx];
          r += c[0] * basis;
          g += c[1] * basis;
          b += c[2] * basis;
        }
      }
      const o = 4 * (x + y * w);
      px[o] = linearToSRGB(r);
      px[o + 1] = linearToSRGB(g);
      px[o + 2] = linearToSRGB(b);
      px[o + 3] = 255;
    }
  }
  return px;
}

const cache = new Map<string, string>();

/** Data URL for a BlurHash, or null (SSR, bad hash). */
export function blurHashToDataURL(hash: string | null, w = 32, h = 32): string | null {
  if (!hash || typeof document === "undefined") return null;
  const hit = cache.get(hash);
  if (hit) return hit;
  const px = decode(hash, w, h);
  if (!px) return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const data = ctx.createImageData(w, h);
  data.data.set(px);
  ctx.putImageData(data, 0, 0);
  const url = canvas.toDataURL();
  cache.set(hash, url);
  return url;
}
