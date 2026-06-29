import { Jacquard_12, Plus_Jakarta_Sans, Sometype_Mono } from "next/font/google";

/**
 * Jacquard 12 — chunky pixel-grid font. Used at very large sizes
 * so its pixel structure reads as texture rather than legible
 * typography.
 */
export const jacquard = Jacquard_12({
  subsets: ["latin"],
  variable: "--font-jacquard",
  weight: ["400"],
  display: "swap",
});

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