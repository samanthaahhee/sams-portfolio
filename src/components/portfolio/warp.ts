/* Shared parameters for the viewport-bottom warp.
 *
 * The distortion is anchored to the VIEWPORT, not to the element: the
 * bottom BAND_FRACTION of the screen is a warp zone, and whatever content
 * passes through it gets bent, so the effect lands part-way up an image
 * rather than folding the whole element.
 *
 * Kept in one place because both the homepage work tiles (canvas) and the
 * flat-colour panels (clip-path) must bend by exactly the same amount —
 * they sit next to each other on the page. */

export const BAND_FRACTION = 0.125;
export const MASK_POINTS = 220;
/** Deepest point splays to 1.5x width. */
export const MAX_FLARE = 0.5;
/** High power => straight sides, then a sharp trumpet. */
export const FLARE_CURVE = 3;
/* On top of the flare the whole row slides sideways as it sinks, by an
   amount that depends only on depth — never on x. That makes every
   vertical line lean together, so the gutter bends as one channel instead
   of standing rigid, and because it is a pure translation no width
   changes: the gap stays exactly as wide at the floor as at the top.
   Expressed as a fraction of the row's combined tile width so it scales
   with the layout. */
export const MAX_SHEAR = 0.025;
