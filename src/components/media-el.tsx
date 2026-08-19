"use client";

import { mediaTypeFor } from "@/lib/db-portfolio";

/** A still or a silent looping clip, whichever the URL turns out to be.
 *
 *  Every surface that paints a piece of media with a plain element goes
 *  through this, so an MP4 can never land in an <img> and render as a
 *  broken image. Canvas surfaces are the exception and handle motion by
 *  stepping aside — see WorkTile.
 *
 *  autoPlay + loop + muted + playsInline is the combination browsers
 *  require before they will start a clip unprompted; a silent loop is
 *  the point here, since these stand in for GIFs at a fraction of the
 *  weight. */
export function MediaEl({
  url,
  className,
  style,
  draggable,
}: {
  url: string;
  className?: string;
  style?: React.CSSProperties;
  draggable?: boolean;
}) {
  if (mediaTypeFor(url) === "mp4") {
    return (
      <video
        src={url}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className={className}
        style={style}
        draggable={draggable}
      />
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={url}
      alt=""
      loading="lazy"
      decoding="async"
      className={className}
      style={style}
      draggable={draggable}
    />
  );
}
