import { Caveat, Plus_Jakarta_Sans } from "next/font/google";

/**
 * STAND-IN for LORE until the real TTFs land (Regular / Bold /
 * RegularAlternates / BoldAlternates — see
 * `sam-ahhee-portfolio-brief.md`). Caveat is the closest free
 * Google Font to the handwritten reference screens.
 *
 * Swap-in once the files arrive — replace this whole export with:
 *
 *   import localFont from "next/font/local";
 *   export const lore = localFont({
 *     variable: "--font-lore",
 *     src: [
 *       { path: "../../public/fonts/LORE-Regular.ttf", weight: "400", style: "normal" },
 *       { path: "../../public/fonts/LORE-Bold.ttf", weight: "700", style: "normal" },
 *     ],
 *     display: "swap",
 *   });
 *
 * Nothing else in the app needs to change — every usage references
 * the `--font-lore` CSS variable, not this file directly.
 */
export const lore = Caveat({
  subsets: ["latin"],
  variable: "--font-lore",
  weight: ["500", "700"],
  display: "swap",
});

export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta-portfolio",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
