"use client";

import type { MediaType } from "@/lib/db-portfolio";

/**
 * Renders a single portfolio media slot — image, GIF, or MP4 — behind
 * one consistent API. Video is muted/looped/autoplaying/playsinline
 * and lazy-loaded so the homepage and work index stay light.
 */
export function Media({
  src,
  type,
  alt = "",
  className,
  poster,
}: {
  src: string;
  type: MediaType;
  alt?: string;
  className?: string;
  poster?: string;
}) {
  if (type === "mp4") {
    return (
      <video
        className={className}
        src={src}
        poster={poster}
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
      />
    );
  }
  // Images and GIFs both render as <img> — the browser handles GIF
  // animation natively.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={src} alt={alt} loading="lazy" decoding="async" />;
}
