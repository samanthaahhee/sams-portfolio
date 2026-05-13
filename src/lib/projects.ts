import type { Palette } from "./case-studies";

export type CustomColors = {
  /** Primary card background (was pair-a). */
  a: string;
  /** Accent (was pair-b). */
  b: string;
  /** Text colour on pair-a backgrounds. */
  aInk: string;
  /** Text colour on pair-b backgrounds. */
  bInk: string;
};

export type Project = {
  slug: string;
  title: string;
  /** Brand / client name — shown in the small archive card chrome
   *  instead of an index number. */
  brand: string;
  /** One or more category tags. First tag is the "primary" tag used by
   *  the archive filter chips and the top-right pill on the card. */
  tags: string[];
  year?: string;
  /** Named palette or "custom" — when "custom", customColors below is used. */
  palette: Palette | "custom";
  /** Optional override: 4 hex values that replace the named palette. */
  customColors?: CustomColors;
  /** Cover image — currently a seeded picsum placeholder. */
  cover: string;
  /** Short project descriptor for the condensed detail page. */
  description: string;
  /** Visual gallery for the detail page — placeholder picsum URLs for now. */
  gallery: string[];
  /** Optional external link (e.g., Behance project URL). */
  href?: string;
};

const gal = (slug: string): string[] => [
  `https://picsum.photos/seed/${slug}-a/1600/1000`,
  `https://picsum.photos/seed/${slug}-b/1200/1500`,
  `https://picsum.photos/seed/${slug}-c/1600/1000`,
  `https://picsum.photos/seed/${slug}-d/1200/1500`,
];

/** Picsum gives a stable image per seed — using the slug keeps placeholders
 *  consistent between deploys. Aspect-ratio 4:5 mirrors the card grid. */
const ph = (seed: string) => `https://picsum.photos/seed/${seed}/600/750`;

/**
 * Smaller work — brand, packaging, editorial, and supporting projects.
 * Sourced from behance.net/Samantha_ahhee.
 */
export const projects: Project[] = [
  {
    slug: "global-marketplace",
    brand: "Global Marketplace",
    title: "Marketplace Branding",
    tags: ["Brand"],
    palette: "coral-sage",
    cover: ph("global-marketplace"),
    description: "A brand identity for a global online marketplace — logo, palette, and visual system tuned for international trust signals. Placeholder description; full writeup to come.",
    gallery: gal("global-marketplace"),
  },
  {
    slug: "walkrr",
    brand: "Walkrr",
    title: "Platform Visual Guide",
    tags: ["Product"],
    palette: "lavender-ochre",
    cover: ph("walkrr-platform"),
    description: "Visual guide for the Walkrr platform — typography, components, and UI patterns documented for the product team. Placeholder description.",
    gallery: gal("walkrr"),
  },
  {
    slug: "money-2020",
    brand: "Recharge × Money2020",
    title: "Conference Invite",
    tags: ["Print"],
    palette: "butter-slate",
    cover: ph("money-2020-invite"),
    description: "Print + digital invite system for Recharge's appearance at Money 2020. A focused exercise in editorial pace at conference-grade detail.",
    gallery: gal("money-2020"),
  },
  {
    slug: "dig-for-days",
    brand: "Dig for Days",
    title: "Mining Calendar",
    tags: ["Print"],
    palette: "moss-butter",
    cover: ph("dig-for-days"),
    description: "Twelve-month wall calendar designed for the mining industry — equal parts utility and brand object.",
    gallery: gal("dig-for-days"),
  },
  {
    slug: "perfect-serve",
    brand: "BOS",
    title: "The Perfect Serve",
    tags: ["Campaign"],
    palette: "dustypink-ink",
    cover: ph("perfect-serve"),
    description: "Campaign work for BOS — print, social, and OOH built around the ritual of pouring the perfect serve.",
    gallery: gal("perfect-serve"),
  },
  {
    slug: "win-a-bmw",
    brand: "BMW",
    title: "Win a BMW Campaign",
    tags: ["Campaign"],
    palette: "forest-amber",
    cover: ph("win-a-bmw-campaign"),
    description: "Digital campaign creative for a high-stakes consumer giveaway. Built to convert at scale while still feeling brand-considered.",
    gallery: gal("win-a-bmw"),
  },
  {
    slug: "bos-shots",
    brand: "BOS",
    title: "Shots Packaging",
    tags: ["Packaging"],
    palette: "coral-sage",
    cover: ph("bos-shots-pack"),
    description: "Packaging design for BOS Shots — small format, big shelf presence. A study in restraint at point-of-sale.",
    gallery: gal("bos-shots"),
  },
  {
    slug: "appstore-screenshots",
    brand: "Recharge",
    title: "AppStore & Play Screens",
    tags: ["Product"],
    palette: "mint-clay",
    cover: ph("appstore-google"),
    description: "Store screenshots for Recharge — a tightly designed visual narrative built to convert in the half-second a user scrolls past the listing.",
    gallery: gal("appstore-screens"),
  },
  {
    slug: "small-stitch-emailers",
    brand: "Small Stitch",
    title: "Brand Emailers",
    tags: ["Email"],
    palette: "dustypink-ink",
    cover: ph("small-stitch-email"),
    description: "Email design system for Small Stitch — a clothing brand with a community-first voice. Templates designed to feel hand-stitched, not transactional.",
    gallery: gal("small-stitch"),
  },
  {
    slug: "krover",
    brand: "Krover",
    title: "Brand Strategy",
    tags: ["Brand"],
    palette: "butter-slate",
    cover: ph("krover-brand"),
    description: "Brand strategy and identity work for Krover — from positioning through to a starter visual system.",
    gallery: gal("krover"),
  },
  {
    slug: "skinny-bostails",
    brand: "BOS",
    title: "Skinny BOStails",
    tags: ["Packaging"],
    palette: "lavender-ochre",
    cover: ph("skinny-bostails"),
    description: "Limited-format packaging for the Skinny BOStails range. Quick read at a glance; brand DNA on closer inspection.",
    gallery: gal("skinny-bostails"),
  },
  {
    slug: "bring-your-human",
    brand: "Bring Your Human",
    title: "Brand Identity",
    tags: ["Brand"],
    palette: "mint-clay",
    cover: ph("bring-your-human"),
    description: "Brand identity for Bring Your Human — a programme about leadership and humanity at work. Warm, considered, never corporate.",
    gallery: gal("bring-your-human"),
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/** Ordered filter taxonomy used by the Archive section. "All" prefix is
 *  added by the UI; this is the source of truth for category order. */
export const projectCategories = [
  "Brand",
  "Product",
  "Campaign",
  "Packaging",
  "Print",
  "Email",
] as const;
export type ProjectCategory = (typeof projectCategories)[number];
