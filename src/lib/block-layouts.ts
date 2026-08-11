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
  { className: string; aspects: readonly string[] }
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
  portrait_trio: {
    className: "grid grid-cols-1 sm:grid-cols-3",
    aspects: ["3 / 4", "3 / 4", "3 / 4"],
  },
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

/** The aspect one slot is cropped to, or null when it is not cropped. */
export function slotAspect(layout: BlockLayout, slot: number): string | null {
  const a = ROW_LAYOUTS[layout]?.aspects[slot];
  return !a || a === "auto" ? null : a;
}
