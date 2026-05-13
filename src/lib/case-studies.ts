/**
 * Case study content — typed and local for now. Schema mirrors what
 * the Sanity model will be when the dashboard layer is added next.
 */

export type Palette =
  | "butter-slate"
  | "coral-sage"
  | "lavender-ochre"
  | "moss-butter"
  | "forest-amber"
  | "mint-clay"
  | "dustypink-ink";

export type CaseStudy = {
  slug: string;
  no: string;            // "01", "02"
  title: string;
  client: string;
  year: string;
  role: string[];
  /** Primary role label, shown above the descriptor on the home card.
   *  e.g. "Brand Designer", "Visual Comms Design", "Full-stack Designer" */
  primaryRole: string;
  /** Category of work, shown bottom-left of the card chrome.
   *  Matches the archive filter taxonomy: Brand / Product / Campaign / etc. */
  category: string;
  tags: string[];
  summary: string;
  palette: Palette | "custom";
  customColors?: {
    a: string;
    b: string;
    aInk: string;
    bInk: string;
  };
  /** Cover image for the home page Selected Work card.
   *  Currently a seeded picsum placeholder. Replace with real imagery
   *  from /public or (future) Sanity dashboard. */
  cover: string;
  context: string;
  problem: string;
  approach: string;
  decisions: { title: string; body: string }[];
  outcome: string;
  reflection: string;
  link?: { label: string; href: string };
};

const cs = (seed: string) => `https://picsum.photos/seed/${seed}/900/1080`;

export const caseStudies: CaseStudy[] = [
  {
    slug: "recharge",
    no: "01",
    title: "Recharge, Uplifted",
    client: "Recharge.com",
    year: "2024",
    role: ["Brand", "Visual Design", "Illustration Direction"],
    primaryRole: "Brand Designer",
    category: "Brand",
    tags: ["Brand Uplift", "Illustration System", "Tone of Voice", "Website"],
    palette: "coral-sage",
    cover: cs("recharge-brand-uplift"),
    summary:
      "A brand uplift for the world's largest online top-up marketplace — focused on a new product illustration system, a refined editorial tone, and a website layout that finally gives the brand room to speak.",
    context:
      "Recharge.com is the global marketplace for instant mobile top-ups, gift cards, and gaming vouchers. The product worked. The colour palette stayed. The job was to make a high-performing system feel considered.",
    problem:
      "A brand uplift without a palette change is harder than a rebrand. The visual identity already had equity — green and the wordmark stayed — but the surface area around them had drifted: inconsistent product illustration, transactional copy, and a website layout that read like a conversion funnel rather than a brand.",
    approach:
      "Three pillars carried the uplift: a unified product illustration system, an editorial rewrite of the brand's tone of voice, and a website layout rebuilt around editorial pace. Same colours, new posture.",
    decisions: [
      {
        title: "A product illustration system",
        body: "Replaced the patchwork of stock imagery and one-off graphics with a single illustration language that scales across product categories — top-ups, gift cards, gaming. The system is built to be extended by the in-house team, not just used by it.",
      },
      {
        title: "Tone, rewritten",
        body: "Audited the writing across the funnel and rewrote it to sound like a person. Less category jargon, more direct copy that respects what the customer is actually trying to do — usually quickly, often from a phone, sometimes from a new country.",
      },
      {
        title: "Website layout with editorial pace",
        body: "The previous layout was relentlessly conversion-led. The uplifted layout uses publication-style hierarchy, more confident type, and breathing room between sections — without giving up the speed-to-purchase the product is known for.",
      },
    ],
    outcome:
      "A brand system now rolling across web, app, and marketing surfaces. The illustration system gave the in-house team a kit they can stretch without breaking it. The new tone is showing up across product copy, comms, and customer support.",
    reflection:
      "A brand uplift gets called \"making it prettier\" when it's really infrastructure work. Illustration, tone, and layout are systems — the surface only looks effortless when the system underneath is properly thought through.",
  },
  {
    slug: "temper",
    no: "02",
    title: "Small Change, Big Impact",
    client: "Temper",
    year: "2024",
    role: ["Visual Comms Design", "App Redesign", "Visual System"],
    primaryRole: "Visual Comms Design",
    category: "Product",
    tags: ["Visual Rebrand", "Dual-Model App", "Legal Reskin"],
    palette: "forest-amber",
    cover: cs("temper-app-green"),
    summary:
      "A \"Duplicate and Reskin\" rebrand for Temper — the Dutch contractor platform — built to meet a regulatory deadline without a ground-up rebuild. The work focused on the bones: type, illustration, and functional colour logic.",
    context:
      "Temper is a Dutch-born platform that connects independent contractors directly through an automated, rating-based ecosystem. In 2024 it hit an inflection point — increasing regulatory pressure and public scrutiny (similar to challenges faced by giants like Uber) required the rapid introduction of a new legal contract model.",
    problem:
      "To meet a gruelling regulatory deadline without the budget for a ground-up platform rebuild, the team had to execute a \"Duplicate and Reskin\" strategy — launching a second, distinct app experience that would coexist alongside the original. If a user couldn't immediately distinguish which legal framework they were browsing under, the platform faced massive liability. Three challenges intersected: a Dual-Model Identity Crisis (make two platforms feel like the same brand while keeping the distinction crystal clear), Legacy Debt (a patchwork of an old purple brand and an unfinished green rebrand), and Scalability (existing designs were dated, lacked hierarchy, and weren't accessible).",
    approach:
      "A \"Small Change, Big Impact\" strategy. A comprehensive Product & Brand Audit mapped the fragmentation inside the legacy \"Purple\" interface, revealing a \"Frankenstein\" UI: mismatched font weights, illustration that functioned as decoration rather than a navigational guide, and a colour palette lacking logical hierarchy for high-stakes legal actions. Those friction points became implementation opportunities — focused upgrades that didn't need a platform rebuild to land.",
    decisions: [
      {
        title: "Typography scale, standardised",
        body: "Replaced the mismatched font-weight patchwork with a single typographic scale tuned for information density — so legal actions, status, and supporting copy each get the weight they need without competing.",
      },
      {
        title: "Colour palette, accessibility-first",
        body: "Redefined the palette around functional colour logic for high-stakes legal actions. The brand green stayed central; what changed was the supporting system, rebuilt to meet contrast and accessibility standards across both app variants.",
      },
      {
        title: "Illustration as navigation, not decoration",
        body: "Re-cast the illustration system so it earned its place by guiding the user through the flow, not sitting alongside it. Each illustration now anchors a step, a state, or a distinction between the two coexisting app experiences.",
      },
    ],
    outcome:
      "A mandatory legal reskin transformed into a systematic upgrade. The new app didn't just look different — it felt significantly more professional and trustworthy than the version it replaced, while the second variant could ship alongside the original without brand confusion. Same colour, sharper bones.",
    reflection:
      "When you can't rebuild the platform, you rebuild the bones. The unglamorous work — type scale, colour logic, illustration hierarchy — is what shifted the perception of trust most. The brief asked for a reskin; the win was making the reskin do system work.",
  },
  {
    slug: "heyotis",
    no: "03",
    title: "Hey Otis",
    client: "HeyOtis (side project)",
    year: "2024–2025",
    role: ["Full-stack Design", "Brand", "Product"],
    primaryRole: "Full-stack Designer",
    category: "Product",
    tags: ["Product", "Brand", "Side Project"],
    palette: "mint-clay",
    cover: cs("heyotis-couples-calm"),
    summary:
      "A digital relationship-repair tool for long-term couples. Brand, product, voice, and visual system — all of it, end to end.",
    context: "Most couples don't fight because they're broken. They fight because they don't have language for what's actually happening. HeyOtis is a private space to find that language before the next conversation.",
    problem: "Therapy is expensive, books are passive, and couples apps tend to be either too clinical or too cute. Designing a tool that's warm without being twee is a brand problem before it's a product problem.",
    approach: "A calm, modern visual system built around a four-step repair flow. Soft mint and warm clay anchor the palette. Type stays human. Copy refuses self-help language.",
    decisions: [
      { title: "Voice first", body: "Wrote the copy before designing the UI. The product had to sound right before it could look right." },
      { title: "Frameworks, not feelings", body: "Five evidence-based psychological frameworks structure the flow. The design exposes the framework gently, never lecturing." },
      { title: "Private by design", body: "Visual cues — soft colour, no notifications, no streaks — communicate that this is a space for one person at a time." },
    ],
    outcome: "Live at heyotis.app. Early users report having the conversation they'd been avoiding for months — within a week of using the tool.",
    reflection: "Designing for emotional product is mostly about what you don't include. Every gamification pattern I considered would have ruined the trust.",
    link: { label: "heyotis.app", href: "https://www.heyotis.app" },
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}
