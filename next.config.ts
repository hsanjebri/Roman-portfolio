import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Unsplash photos use a per-image loader (lib/image.ts): urls.raw with
    // w / q=85 / auto=format at each srcset width, resized by Unsplash's CDN.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1280, 1600, 1920, 2400, 3840],
    imageSizes: [96, 256, 384],
    qualities: [75, 85],
  },
};

export default nextConfig;
