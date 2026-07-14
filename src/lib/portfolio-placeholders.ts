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
  {
    id: 1, slug: "bos-ice-tea", title: "BOS Ice Tea", discipline: "360 Campaign", client: "BOS",
    role: "Art Director", year: "2022", orderIndex: 1, visible: true, workGridTemplate: null,
    coverUrl: PH_COVERS[1], coverType: "image",
    deliverables: ["Trade toolkit", "Activation", "Digital campaign", "Influencer kit"],
    creativeTeam: ["Sam Ahhee"],
  },
  {
    id: 2, slug: "temper", title: "Temper", discipline: "Brand System", client: "Temper",
    role: "Product Designer", year: "2022", orderIndex: 2, visible: true, workGridTemplate: null,
    coverUrl: PH_COVERS[2], coverType: "image",
    deliverables: ["Identity system", "Packaging", "Web design"],
    creativeTeam: ["Sam Ahhee"],
  },
  {
    id: 3, slug: "recharge", title: "Recharge.com", discipline: "Art Direction", client: "Recharge.com",
    role: "Visual Designer", year: "2021", orderIndex: 3, visible: true, workGridTemplate: null,
    coverUrl: PH_COVERS[3], coverType: "image",
    deliverables: ["Art direction", "Campaign visuals"],
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

/** Work-grid media for the deep-dive page, keyed by slug. First three items
 *  form the bento trio (two stacked left, one tall right); anything after
 *  that stacks as full-width rows below. */
export const PLACEHOLDER_WORK_MEDIA: Record<string, PortfolioMedia[]> = {
  walkrr: [
    media(0, "https://picsum.photos/seed/walkrr-1/780/460", 780, 460, 0),
    media(0, "https://picsum.photos/seed/walkrr-2/780/460", 780, 460, 1),
    media(0, "https://picsum.photos/seed/walkrr-3/1520/940", 1520, 940, 2),
    media(0, "https://picsum.photos/seed/walkrr-4/1800/340", 1800, 340, 3),
  ],
};
