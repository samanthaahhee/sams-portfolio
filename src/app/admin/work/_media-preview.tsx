"use client";

import { mediaTypeFor } from "@/lib/db-portfolio";

/** An image or a silent looping clip, whichever the URL is.
 *
 *  Every preview in the admin goes through this so a video never renders
 *  as a broken image — the crop boxes, the library, the layout preview
 *  and the project grid all show the same thing the page will. */
export function MediaBox({
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
        className={className}
        style={style}
        draggable={draggable}
      />
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={url} alt="" className={className} style={style} draggable={draggable} />
  );
}
