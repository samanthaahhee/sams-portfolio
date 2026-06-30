import { SiteFooter } from "@/components/site-footer";
import { WorkCard } from "@/components/work-card";
import { ArchiveSection } from "@/components/archive-section";
import { HeroCardDeck, type DeckCard } from "@/components/hero-card-deck";
import { ScrollTopOnMount } from "@/components/scroll-top-on-mount";
import {
  getProjects,
  getCaseStudies,
  getHeroCards,
} from "@/lib/db";

export default async function Home() {
  const [caseStudies, projects, heroCards] = await Promise.all([
    getCaseStudies(),
    getProjects(),
    getHeroCards(),
  ]);

  /* Hero deck — curated `/admin/hero` set, with case-studies +
     projects as a fallback so the homepage is never blank. */
  let cards: DeckCard[] = heroCards.map((c) => ({
    href: c.href || "#",
    src: c.imageUrl,
    title: c.title,
    client: c.client,
    accentColor: c.accentColor,
    bgColor: c.bgColor,
    bgGradient: c.bgGradient,
  }));
  if (cards.length === 0) {
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
    <div data-pair="butter-slate">
      {/* Force the page to land at the top on every visit, even
          when arriving via a stale `#selected-work` hash from a nav
          click. */}
      <ScrollTopOnMount />
      {/* ── Landing hero — kinetic card deck, owns its own nav.
          No SiteHeader on this page; the deck's top bar replaces it. */}
      <HeroCardDeck cards={cards} />

      {/* ── Rule + Selected work ────────────────────────────────── */}
      <div className="rule mx-[var(--spacing-page)]" />
      <section
        id="selected-work"
        className="px-[var(--spacing-page)] pt-12 md:pt-16 scroll-mt-20"
      >
        <div className="mb-10 md:mb-14 text-center">
          <p
            className="font-display"
            style={{
              fontSize: "clamp(1.25rem, 3.2vw, 2.8rem)",
              lineHeight: 1.0,
            }}
          >
            Selected work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {caseStudies.map((study, i) => (
            <WorkCard key={study.slug} study={study} index={i} />
          ))}
        </div>
      </section>

      {/* ── Additional Projects ─────────────────────────────────── */}
      <ArchiveSection projects={projects} />

      <SiteFooter />
    </div>
  );
}
