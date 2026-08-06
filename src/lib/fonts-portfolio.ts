import localFont from "next/font/local";
import { Plus_Jakarta_Sans, DM_Mono, DM_Sans } from "next/font/google";

/**
 * LORE — the portfolio's handwritten/display typeface, self-hosted.
 * Four weights: Regular (400), Bold (700), and their Alternate cuts.
 * Used for: nav wordmark, heading display, floating interests copy,
 * hand-written body lines, paper-strip labels.
 *
 * Wired up as --font-lore CSS variable so every component references
 * the variable, not this file directly. Tailwind utility: `font-lore`.
 */
export const lore = localFont({
  variable: "--font-lore",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/LORE-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/LORE-RegularAlternates.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/LORE-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/LORE-BoldAlternates.ttf",
      weight: "700",
      style: "italic",
    },
  ],
});

/**
 * Plus Jakarta Sans — the functional UI typeface.
 * Used for: nav links, meta labels, body copy, dashboard.
 */
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta-portfolio",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * DM Mono — the rebuild's monospace voice.
 * Used for: services list, project meta rails, small labelling.
 */
export const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  display: "swap",
});

/**
 * DM Sans — the project pages' copy voice.
 * Used for: overview and text-block headers and body copy.
 */
export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
  display: "swap",
});
