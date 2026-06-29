/**
 * Preview-only landing-hero exploration — fanned card deck of every
 * case study + project, auto-shuffling every few seconds. Click any
 * card to open it. Live homepage is unchanged.
 */

import { SiteHeader } from "@/components/site-header";
import { HeroCardDeck, type DeckCard } from "@/components/hero-card-deck";
import { getCaseStudies, getProjects } from "@/lib/db";

export const metadata = { title: "Hero preview" };

export default async function HeroPreview() {
  const [caseStudies, projects] = await Promise.all([
    getCaseStudies(),
    getProjects(),
  ]);

  const cards: DeckCard[] = [
    ...caseStudies.map((c) => ({
      href: `/work/${c.slug}`,
      src: c.cover,
      title: c.title,
      client: c.client,
    })),
    ...projects.map((p) => ({
      href: `/projects/${p.slug}`,
      src: p.cover,
      title: p.title,
      client: p.brand,
    })),
  ].filter((c) => Boolean(c.src));

  return (
    <div className="bg-[#1a0d10] text-white">
      <SiteHeader pageNo="HP" />
      <HeroCardDeck cards={cards} />
      <div className="px-[var(--spacing-page)] py-12 md:py-16 text-center">
        <p className="font-mono text-[color:var(--meta)] text-[10px] uppercase tracking-[0.14em]">
          Preview · not linked publicly. Live homepage is unchanged.
        </p>
      </div>
    </div>
  );
}
