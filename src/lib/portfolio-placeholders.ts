/* Placeholder project + media data — shown until real content is uploaded
 * via the admin dashboard. Shared by the /work index carousel and the
 * per-project deep-dive page so both fall back to the same fixtures. */
import type { PortfolioProject, PortfolioMedia } from "./db-portfolio";

export const PH_COVERS = [
  "https://picsum.photos/seed/walkrr-cover/1600/900",
  "https://picsum.photos/seed/bos-cover/1600/900",
  "https://picsum.photos/seed/temper-cover/1600/900",
  "https://picsum.photos/seed/recharge-cover/1600/900",
  "https://picsum.photos/seed/smallstitch-cover/1600/900",
  "https://picsum.photos/seed/icetea-cover/1600/900",
];

export const PLACEHOLDER_PROJECTS: PortfolioProject[] = [
  {
    id: 0, slug: "walkrr", title: "Walkrr", discipline: "Brand Design", client: "Walkrr",
    role: "Brand Designer", year: "2023", orderIndex: 0, visible: true, workGridTemplate: null,
    coverUrl: PH_COVERS[0], coverType: "image",
    deliverables: ["Activation stands", "Store front", "Campaign Assets", "Brand Guideline"],
    creativeTeam: ["Sam Ahhee"],
  },
  // Client/role/year/deliverables/creative team below are pulled from the
  // real case-study copy already on the site (src/lib/case-studies.ts and
  // the legacy /work/bos-ice-tea page) — not invented placeholder text.
  {
    id: 1, slug: "bos-ice-tea", title: "BOS Ice Tea", discipline: "360 Campaign", client: "BOS Ice Tea",
    role: "Senior Art Director (EMEA region)", year: "2018–2019", orderIndex: 1, visible: true, workGridTemplate: null,
    coverUrl: PH_COVERS[1], coverType: "image",
    deliverables: ["Trade toolkit", "Sales toolkit", "Digital campaign", "Influencer pack"],
    creativeTeam: ["Sam Ahhee — Senior Art Director", "Creative Director", "Copywriter", "DTP Artist", "Junior Designer"],
  },
  {
    id: 2, slug: "temper", title: "Temper", discipline: "Product", client: "Temper",
    role: "Visual Comms Design", year: "2024", orderIndex: 2, visible: true, workGridTemplate: null,
    coverUrl: PH_COVERS[2], coverType: "image",
    deliverables: ["App Redesign", "Visual System"],
    creativeTeam: ["Sam Ahhee"],
  },
  {
    id: 3, slug: "recharge", title: "Recharge.com", discipline: "Brand", client: "Recharge.com",
    role: "Brand Designer", year: "2024", orderIndex: 3, visible: true, workGridTemplate: null,
    coverUrl: PH_COVERS[3], coverType: "image",
    deliverables: ["Visual Design", "Illustration Direction"],
    creativeTeam: ["Sam Ahhee"],
  },
  {
    id: 4, slug: "small-stitch", title: "Small Stitch", discipline: "Brand Identity", client: "Small Stitch",
    role: "Brand Designer", year: "2023", orderIndex: 4, visible: true, workGridTemplate: null,
    coverUrl: PH_COVERS[4], coverType: "image",
    deliverables: ["Brand identity", "Packaging"],
    creativeTeam: ["Sam Ahhee"],
  },
];

function media(projectId: number, url: string, w: number, h: number, order: number): PortfolioMedia {
  return {
    id: order, projectId, surface: "work_grid", slotId: null, type: "image",
    url, width: w, height: h, aspectRatio: `${w}:${h}`, orderIndex: order,
  };
}

function workGrid(slug: string): PortfolioMedia[] {
  return [
    media(0, `https://picsum.photos/seed/${slug}-1/780/460`, 780, 460, 0),
    media(0, `https://picsum.photos/seed/${slug}-2/780/460`, 780, 460, 1),
    media(0, `https://picsum.photos/seed/${slug}-3/1520/940`, 1520, 940, 2),
    media(0, `https://picsum.photos/seed/${slug}-4/1800/340`, 1800, 340, 3),
  ];
}

/** Work-grid media for the deep-dive page, keyed by slug. First three items
 *  form the bento trio (two stacked left, one tall right); anything after
 *  that stacks as full-width rows below. Images are still seeded picsum
 *  placeholders — no real project imagery has been uploaded yet. */
export const PLACEHOLDER_WORK_MEDIA: Record<string, PortfolioMedia[]> = {
  walkrr: workGrid("walkrr"),
  "bos-ice-tea": workGrid("bos-ice-tea"),
  temper: workGrid("temper"),
  recharge: workGrid("recharge"),
};

export type ThinkingSection = { title: string; body: string; image?: string };

const LOREM =
  "Lorem ipsum dolor sit amet consectetur. Ullamcorper vitae sollicitudin aliquet sodales auctor. Curabitur faucibus in eu mauris. At aliquet auctor fringilla tincidunt tellus gravida molestie vulputate pellentesque. Pulvinar sed venenatis aenean semper egestas orci diam sed. Non sollicitudin pretium tellus ut accumsan quis. Massa diam congue non in ut odio tellus. Nisl adipiscing senectus nisl etiam nibh tortor eu commodo egestas.";

/** "The Thinking" narrative, keyed by slug — each section has a title and
 *  body copy, with an optional supporting image. Content for bos-ice-tea,
 *  temper, and recharge is drawn from the real case-study copy already on
 *  the site (src/lib/case-studies.ts and the legacy /work/bos-ice-tea
 *  page), condensed to fit this format — not invented placeholder text.
 *  walkrr has no existing source copy yet, so it stays Lorem ipsum. */
export const PLACEHOLDER_THINKING: Record<string, ThinkingSection[]> = {
  walkrr: [
    { title: "Context", body: LOREM },
    { title: "Brand problem", body: LOREM, image: "https://picsum.photos/seed/walkrr-thinking-1/1200/900" },
    { title: "Approach", body: LOREM },
  ],
  "bos-ice-tea": [
    {
      title: "Context",
      body: "BOS Ice Tea is a South African brand built on Rooibos, a naturally sweet indigenous tea that gives BOS its distinctive flavour and lower sugar profile. In South Africa it has genuine cultural weight: bold, irreverent, and rooted in a product that is uniquely its own — none of that lands automatically in the Benelux. When BOS began expanding into the EU, it entered one of the most competitive cold beverage markets in the world with a budget denominated in South African rand. What BOS had instead was a genuinely distinctive product and a brand personality built around four pillars: nature, art and music, design, and sustainability.",
    },
    {
      title: "Brand problem",
      body: "BOS had no name recognition in the Benelux. The goal at this stage wasn't to convert, it was to spark curiosity first — showing up consistently and memorably across trade, activation, digital, and influencer, all on a budget that demanded every execution earned its place. The strategic bet was that personality could do the work that spend couldn't: not materials that explained the brand, but ones that embodied it.",
      image: "https://picsum.photos/seed/bos-ice-tea-thinking-1/1200/900",
    },
    {
      title: "Directions considered",
      body: "Rejected: leading with the red original — the signature BOS pack is yellow, so a red launch product muddied recognition being built from zero. Rejected: standard trade and campaign branding — safe, logo-heavy, and entirely forgettable next to well-funded competitors. Chosen: a personality-first approach across every channel, filtered through one question — would this feel unmistakably BOS without the logo?",
    },
    {
      title: "Approach",
      body: "As Senior Art Director, I led concepting and design across the full campaign, working with a Creative Director and a copywriter, and managing a DTP artist and junior designer. Trade and activation centred on items venues would actively choose to display — a surfboard shower, a sandwich-board planter, seasonal coasters — plus a shipping-container boombox activation at Zandvoort and a tuk-tuk sampling vehicle for golf courses. The sales toolkit was a custom BOS-yellow backpack organised for samples, garnish, and a perfect-serve copper mug, paired with a tea-towel printed with the BOS origin story. Digital ads were fully concepted, not just produced, to stop the scroll in a category default to product shots. The influencer pack was built as a layered \"unboxing\" experience where the unwrapping was the content.",
    },
    {
      title: "Outcome",
      body: "BOS secured new retail and venue listings across the Benelux during this period. The trade toolkit gave the sales team something genuinely differentiated to walk into accounts with, shifting the conversation from \"here is our product\" to \"here is our world.\" In a market where brand recognition started at zero and budget was limited, the work showed that personality and creative consistency can substitute for spend when every execution is held to the same standard.",
    },
    {
      title: "Reflection",
      body: "The thing I'd push harder on next time is measurement across channels — trade placement, digital performance, and activation reach were never tracked systematically enough to know which executions did the most work. What I'd protect is the single creative filter: would this feel unmistakably BOS without the logo? It kept the work honest across a wide range of formats and budgets.",
    },
  ],
  temper: [
    {
      title: "Context",
      body: "Temper is a Dutch-born platform that connects independent contractors directly through an automated, rating-based ecosystem. In 2024 it hit an inflection point — increasing regulatory pressure and public scrutiny required the rapid introduction of a new legal contract model.",
    },
    {
      title: "Brand problem",
      body: "To meet a gruelling regulatory deadline without the budget for a ground-up rebuild, the team had to execute a \"Duplicate and Reskin\" strategy — launching a second, distinct app experience that would coexist alongside the original. Three challenges intersected: a dual-model identity crisis (make two platforms feel like the same brand while keeping the legal distinction crystal clear), legacy debt (a patchwork of an old purple brand and an unfinished green rebrand), and scalability (dated designs lacking hierarchy and accessibility).",
      image: "https://picsum.photos/seed/temper-thinking-1/1200/900",
    },
    {
      title: "Approach",
      body: "A \"Small Change, Big Impact\" strategy. A comprehensive product and brand audit mapped the fragmentation inside the legacy interface — mismatched font weights, decorative rather than navigational illustration, and a colour palette with no logical hierarchy for high-stakes legal actions. Those friction points became focused implementation opportunities that didn't need a platform rebuild to land.",
    },
    {
      title: "Key decisions",
      body: "Typography scale, standardised — a single scale tuned for information density, so legal actions, status, and supporting copy each get the weight they need. Colour palette, accessibility-first — the brand green stayed central; the supporting system was rebuilt to meet contrast standards across both app variants. Illustration as navigation, not decoration — each illustration now anchors a step, a state, or a distinction between the two coexisting app experiences.",
    },
    {
      title: "Outcome",
      body: "A mandatory legal reskin became a systematic upgrade. The new app felt significantly more professional and trustworthy than the version it replaced, and the second variant shipped alongside the original without brand confusion. Same colour, sharper bones.",
    },
    {
      title: "Reflection",
      body: "When you can't rebuild the platform, you rebuild the bones. The unglamorous work — type scale, colour logic, illustration hierarchy — shifted the perception of trust the most. The brief asked for a reskin; the win was making the reskin do system work.",
    },
  ],
  recharge: [
    {
      title: "Context",
      body: "Recharge.com is the global marketplace for instant mobile top-ups, gift cards, and gaming vouchers. The product worked, and the colour palette stayed — the job was to make a high-performing system feel considered.",
    },
    {
      title: "Brand problem",
      body: "A brand uplift without a palette change is harder than a rebrand. The visual identity already had equity — green and the wordmark stayed — but the surface area around them had drifted: inconsistent product illustration, transactional copy, and a website layout that read like a conversion funnel rather than a brand.",
      image: "https://picsum.photos/seed/recharge-thinking-1/1200/900",
    },
    {
      title: "Approach",
      body: "Three pillars carried the uplift: a unified product illustration system, an editorial rewrite of the brand's tone of voice, and a website layout rebuilt around editorial pace. Same colours, new posture.",
    },
    {
      title: "Key decisions",
      body: "A product illustration system replaced the patchwork of stock imagery and one-off graphics with a single illustration language that scales across top-ups, gift cards, and gaming — built to be extended by the in-house team. Tone, rewritten — audited the writing across the funnel and rewrote it to sound like a person, respecting what the customer is actually trying to do. Website layout with editorial pace — publication-style hierarchy and breathing room, without giving up the speed-to-purchase the product is known for.",
    },
    {
      title: "Outcome",
      body: "A brand system now rolling across web, app, and marketing surfaces. The illustration system gave the in-house team a kit they can stretch without breaking it, and the new tone is showing up across product copy, comms, and customer support.",
    },
    {
      title: "Reflection",
      body: "A brand uplift gets called \"making it prettier\" when it's really infrastructure work. Illustration, tone, and layout are systems — the surface only looks effortless when the system underneath is properly thought through.",
    },
  ],
};
