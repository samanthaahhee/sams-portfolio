/**
 * Halftone B&W portrait — fixed viewport-relative size so the slot is
 * known on the very first paint, with no dependency on parent flex/grid
 * recalc.
 *
 * Width is the smaller of 24vw and 320px; height is exactly 5/4 of that
 * (4:5 portrait). That means the dimensions are computed straight from
 * the viewport — there's no waiting for the parent column width to
 * resolve, so nothing can fold or shift after first paint.
 */

const PORTRAIT_SRC = "/sam-portrait.png";

export function PosterCollage() {
  return (
    <div
      className="relative bg-[color:var(--paper)] overflow-hidden"
      style={{
        width: "min(24vw, 320px)",
        height: "min(30vw, 400px)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PORTRAIT_SRC}
        alt="Sam Ahhee portrait"
        width={600}
        height={750}
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: "grayscale(100%) contrast(1.15) brightness(1.02)",
          transition: "none",
          animation: "none",
        }}
      />

      <div
        aria-hidden
        className="absolute inset-0 halftone-fine mix-blend-multiply"
        style={{ ["--dot" as string]: "#000", opacity: 0.22 }}
      />
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-multiply"
        style={{ background: "#f0e0c8", opacity: 0.08 }}
      />
    </div>
  );
}
