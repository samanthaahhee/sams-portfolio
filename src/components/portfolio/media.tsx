"use client";

import React from "react";
import type { MediaType } from "@/lib/db-portfolio";

export function Media({
  src,
  type,
  alt = "",
  className,
  style,
  poster,
}: {
  src: string;
  type: MediaType;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  poster?: string;
}) {
  if (type === "mp4") {
    return (
      <video
        className={className}
        style={style}
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
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} style={style} src={src} alt={alt} loading="lazy" decoding="async" />;
}
