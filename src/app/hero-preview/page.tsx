/**
 * Preview-only landing-hero exploration — fanned card deck.
 * Cards come from the curated /admin/hero list; if that's empty
 * we fall back to case studies + projects so the preview is never
 * blank.
 */

import { HeroCardDeck, type DeckCard } from "@/components/hero-card-deck";
import { getCaseStudies, getHeroCards, getProjects } from "@/lib/db";

export const metadata = { title: "Hero preview" };

export default async function HeroPreview() {
  const heroCards = await getHeroCards();

  let cards: DeckCard[] = heroCards.map((c) => ({
    href: c.href || "#",
    src: c.imageUrl,
    title: c.title,
    client: c.client,
    accentColor: c.accentColor,
    bgColor: c.bgColor,
    bgGradient: c.bgGradient,
  }));

  // Fallback — populate from existing work if the curated set is empty.
  if (cards.length === 0) {
    const [caseStudies, projects] = await Promise.all([
      getCaseStudies(),
      getProjects(),
    ]);
    cards = [
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
  }

  return (
    <div className="bg-[#1a0d10] text-white">
      <HeroCardDeck cards={cards} />

      <div className="px-[var(--spacing-page)] py-12 md:py-16 text-center">
        <p className="font-mono text-[color:var(--meta)] text-[10px] uppercase tracking-[0.14em]">
          Preview · not linked publicly. Edit deck at{" "}
          <a href="/admin/hero" className="underline">
            /admin/hero
          </a>
          .
        </p>
      </div>
    </div>
  );
}
