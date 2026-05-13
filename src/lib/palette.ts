import type { Palette } from "./case-studies";
import type { CustomColors } from "./projects";

/** All named palettes available in the form preset picker, in display order. */
export const NAMED_PALETTES: Palette[] = [
  "butter-slate",
  "coral-sage",
  "lavender-ochre",
  "moss-butter",
  "forest-amber",
  "mint-clay",
  "dustypink-ink",
];

/** Hex lookup for each named palette — used when the form picks a preset
 *  to fill the colour inputs, and as a fallback in the seed. */
export const PALETTE_HEX: Record<Palette, CustomColors> = {
  "butter-slate":   { a: "#f1e3a8", b: "#5a6470", aInk: "#2a2418", bInk: "#f5efe6" },
  "coral-sage":     { a: "#e89478", b: "#7c8a6c", aInk: "#2a1812", bInk: "#f5efe6" },
  "lavender-ochre": { a: "#c8b8d8", b: "#b88a4a", aInk: "#1a1626", bInk: "#2a1f12" },
  "moss-butter":    { a: "#6b7c5a", b: "#f1e3a8", aInk: "#f5efe6", bInk: "#2a2418" },
  "forest-amber":   { a: "#1f3d30", b: "#e8a04b", aInk: "#f5efe6", bInk: "#1f3d30" },
  "mint-clay":      { a: "#b8d4c0", b: "#c08068", aInk: "#14201a", bInk: "#2a1612" },
  "dustypink-ink":  { a: "#e8b8b8", b: "#2a1f1a", aInk: "#2a1418", bInk: "#f5efe6" },
};

/** Choose a contrasting ink colour for a given hex background. */
export function inkFor(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#1c1612";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#1c1612" : "#f5efe6";
}

/** Darken a hex colour by `amount` (0–1). Used to auto-derive the
 *  pair-b accent from the user-chosen background. */
export function darken(hex: string, amount = 0.35): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#000000";
  const n = parseInt(m[1], 16);
  const r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 255) * (1 - amount)));
  return `#${[r, g, b]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Build a full 4-value palette from a single user-chosen background.
 *  Used by the editor's one-colour input. */
export function paletteFromBg(bg: string): CustomColors {
  const accent = darken(bg, 0.35);
  return {
    a: bg,
    b: accent,
    aInk: inkFor(bg),
    bInk: inkFor(accent),
  };
}

/** Build the inline CSS variables for a custom palette so cards can
 *  apply the same --pair-a etc. tokens as the named palettes. */
export function customColorsToStyle(c: CustomColors): React.CSSProperties {
  return {
    ["--pair-a" as string]: c.a,
    ["--pair-b" as string]: c.b,
    ["--pair-a-ink" as string]: c.aInk,
    ["--pair-b-ink" as string]: c.bInk,
  };
}
