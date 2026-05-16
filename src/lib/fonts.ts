import { Plus_Jakarta_Sans, Sometype_Mono, Caveat } from "next/font/google";

/**
 * Plus Jakarta Sans does double duty — body and display.
 * At display sizes we lean on the 800 weight + tight tracking
 * to give it presence without sacrificing legibility.
 */
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const sometype = Sometype_Mono({
  subsets: ["latin"],
  variable: "--font-mono-sometype",
  weight: ["400", "500"],
  display: "swap",
});

/**
 * Caveat — script accent. Used for editorial section labels
 * ("starters —", "mains —", "sides & sweet —") on /about.
 */
export const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
