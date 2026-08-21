import type { BlockLayout } from "./db-portfolio";

/* The shape of every image row, in one place.
 *
 * The page and the admin's crop tool must agree exactly: the crop box is
 * a preview of the frame the image will actually be cut to, and if the
 * two drift the tool lies. They did — the crop box was hardcoded to 4:3
 * while a portrait slot renders 3:4, so dragging the focal point on a
 * portrait previewed an inverted frame. One table now feeds both.
 *
 * Column templates are chosen so every tile in a row lands on the same
 * height, whatever the viewport width. */
export const ROW_LAYOUTS: Record<
  BlockLayout,
  {
    className: string;
    aspects: readonly string[];
    /** The column class for a row that keeps its columns on a phone. */
    holdClassName?: string;
    /** When a multi-up row refuses to stack below `sm`:
     *  "always" for a row of fixed portrait frames, "portrait" for an
     *  image-led row that holds only if its pictures are portrait. */
    holdsColumns?: "always" | "portrait";
  }
> = {
  single: { className: "grid grid-cols-1", aspects: ["2 / 1"] },
  portrait_landscape: {
    className: "grid grid-cols-1 md:grid-cols-[1fr_2fr]",
    aspects: ["3 / 4", "3 / 2"],
  },
  landscape_portrait: {
    className: "grid grid-cols-1 md:grid-cols-[2fr_1fr]",
    aspects: ["3 / 2", "3 / 4"],
  },
  split: { className: "grid grid-cols-1 md:grid-cols-2", aspects: ["4 / 3", "4 / 3"] },
  /* A trio is composed as a row — three phone screens, three states of
     one idea — and stacking it on a phone breaks the comparison the row
     exists to make, at a cost of three screens of scrolling to say what
     one screen said. A portrait trio keeps its columns: a third of a
     phone's width is still a phone-shaped frame. */
  portrait_trio: {
    className: "grid grid-cols-1 sm:grid-cols-3",
    holdClassName: "grid grid-cols-3",
    aspects: ["3 / 4", "3 / 4", "3 / 4"],
    holdsColumns: "always",
  },
  /* Three across, sized by the pictures rather than a fixed portrait
     frame. The first image's proportions set the row so all three share
     a height; see rowAspect.
     Whether it holds its columns on a phone depends on those pictures:
     portrait frames survive at a third of the width, landscape ones do
     not — a 300×250 banner lands at 108×90 and reads as nothing. */
  trio: {
    className: "grid grid-cols-1 sm:grid-cols-3",
    holdClassName: "grid grid-cols-3",
    aspects: ["auto", "auto", "auto"],
    holdsColumns: "portrait",
  },
  /* Two across, sized by the pictures — for a pair of landscape clips or
     stills that a fixed 4:3 would crop. */
  duo: { className: "grid grid-cols-1 sm:grid-cols-2", aspects: ["auto", "auto"] },
  portrait_portrait: {
    className: "grid grid-cols-1 sm:grid-cols-2",
    aspects: ["3 / 4", "3 / 4"],
  },
  /** Before and after, behind a draggable divider. Both halves must share
   *  one frame or the wipe would reveal a differently-shaped picture. */
  compare: { className: "grid grid-cols-1", aspects: ["4 / 3", "4 / 3"] },
  /** Layered images that cycle. One slot holding however many layers. */
  stack: { className: "grid grid-cols-1", aspects: ["4 / 3"] },
  /** Uncropped — sized by the file itself, so it has no fixed aspect. */
  native: { className: "grid grid-cols-1", aspects: ["auto"] },
};

/** How many image slots a layout has. */
export function slotCount(layout: BlockLayout): number {
  return ROW_LAYOUTS[layout]?.aspects.length ?? 1;
}

/** An image's own proportions as a CSS aspect-ratio, when known. */
export function mediaAspect(m?: { width?: number | null; height?: number | null } | null): string | null {
  return m?.width && m?.height ? `${m.width} / ${m.height}` : null;
}

/** The frame a before/after row uses.
 *
 *  Both halves must share one frame or the wipe would reveal a
 *  differently-shaped picture, so the FIRST image's proportions win and
 *  the second is cover-cropped to match. A fixed 4:3 was wrong for any
 *  pair that is not 4:3 — which is most of them. */
export function compareAspect(first?: { width?: number | null; height?: number | null } | null): string {
  return mediaAspect(first) ?? "4 / 3";
}

/** Layouts whose frame comes from the pictures, not a fixed ratio. */
const IMAGE_LED = new Set<BlockLayout>(["compare", "trio", "duo"]);

/** The frame a whole row uses, when the row takes it from its first
 *  image rather than from a fixed ratio. Null means each slot is sized
 *  independently (native) or by the static table. */
export function rowAspect(
  layout: BlockLayout,
  first?: { width?: number | null; height?: number | null } | null,
): string | null {
  return IMAGE_LED.has(layout) ? compareAspect(first) : null;
}

/** The aspect one slot is cropped to, or null when it is not cropped. */
export function slotAspect(layout: BlockLayout, slot: number): string | null {
  const a = ROW_LAYOUTS[layout]?.aspects[slot];
  return !a || a === "auto" ? null : a;
}

/** A CSS aspect-ratio string ("563 / 1000", "3 / 4") as width÷height.
 *
 *  Returns null for "auto" or anything it cannot read, so callers can
 *  tell "no ratio" apart from a genuine 0. */
export function aspectRatioNumber(aspect?: string | null): number | null {
  if (!aspect) return null;
  const [w, h] = aspect.split("/").map((n) => Number(n.trim()));
  return Number.isFinite(w) && Number.isFinite(h) && h > 0 ? w / h : null;
}

/** How a row lays out, once its pictures are known.
 *
 *  `holds` is true when the row keeps its columns on a phone instead of
 *  stacking, which decides both the column class and whether a portrait
 *  frame needs the stacked-height cap. */
export function rowColumns(
  layout: BlockLayout,
  frameAspect?: string | null,
): { className: string; holds: boolean } {
  const row = ROW_LAYOUTS[layout] ?? ROW_LAYOUTS.single;
  const ar = aspectRatioNumber(frameAspect ?? row.aspects[0]);
  const holds =
    row.holdsColumns === "always" ||
    (row.holdsColumns === "portrait" && ar !== null && ar < 1);
  return { className: (holds && row.holdClassName) || row.className, holds };
}
