"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { blurHashToDataURL } from "@/lib/blurhash";
import { loaderFor } from "@/lib/image";
import type { Photo } from "@/lib/types";

export type VarStyle = CSSProperties & Record<`--${string}`, string | number>;

interface MediaProps {
  photo: Photo;
  sizes: string;
  priority?: boolean;
  /** Clip-path reveal on scroll (bottom → top, inner 1.15 → 1). */
  reveal?: boolean;
  className?: string;
  style?: VarStyle;
}

/**
 * A photo at its native aspect ratio (width/height reserve the space, so no
 * layout shift). Dominant colour first, then the decoded BlurHash, then the
 * full image fades in on top.
 */
export default function Media({ photo, sizes, priority = false, reveal = true, className, style }: MediaProps) {
  const [loaded, setLoaded] = useState(false);
  const [blur, setBlur] = useState<string | null>(null);

  useEffect(() => {
    setBlur(blurHashToDataURL(photo.blurHash));
  }, [photo.blurHash]);

  const vars: VarStyle = { "--c": photo.color, ...(blur ? { "--blur": `url(${blur})` } : {}), ...style };
  return (
    <div
      className={`media${className ? ` ${className}` : ""}`}
      style={vars}
      data-reveal={reveal ? "image" : undefined}
    >
      <div className="reveal__inner">
        <Image
          src={photo.src}
          loader={loaderFor(photo)}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={sizes}
          priority={priority}
          quality={85}
          className={loaded ? "is-loaded" : undefined}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
