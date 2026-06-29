import { SiteFooter } from "@/components/site-footer";
import { WorkCard } from "@/components/work-card";
import { ArchiveSection } from "@/components/archive-section";
import { PosterCollage } from "@/components/poster-collage";
import { FloatingConfetti } from "@/components/floating-confetti";
import { ContactButton } from "@/components/contact-button";
import { MobileConfettiButton } from "@/components/mobile-confetti-button";
import { HeroCardDeck, type DeckCard } from "@/components/hero-card-deck";
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
      {/* ── Landing hero — kinetic card deck, owns its own nav.
          No SiteHeader on this page; the deck's top bar replaces it. */}
      <HeroCardDeck cards={cards} />

      {/* ── About me — what used to be the editorial masthead.
          Portrait + paper confetti at the top, three-paragraph bio
          underneath, contact CTA. ───────────────────────────────── */}
      <section
        id="about"
        className="relative px-[var(--spacing-page)] pt-20 md:pt-32 pb-12 md:pb-16 scroll-mt-20"
      >
        {/* Halftone wash behind the heading + portrait */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 bottom-0 halftone opacity-[0.10] pointer-events-none"
          style={{ ["--dot" as string]: "var(--pair-b)" }}
        />

        <div className="relative grid grid-cols-12 gap-4 items-center pt-4 md:pt-8">
          <div className="col-span-12 md:col-span-7 relative z-10">
            <p className="font-mono text-[color:var(--meta)] text-[10px] uppercase tracking-[0.14em] mb-3 md:mb-5">
              About me
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: "var(--text-d2)",
                lineHeight: 0.92,
              }}
            >
              Sam
              <br />
              Ahhee.
            </h2>
          </div>

          <div className="hidden md:flex md:col-span-5 md:col-start-8 justify-end items-center">
            <div className="relative w-[60%] -translate-x-[40%]">
              <PosterCollage />
              <FloatingConfetti />
            </div>
          </div>
        </div>
      </section>

      <section className="px-[var(--spacing-page)] pt-8 md:pt-12 pb-20 md:pb-28">
        <div className="grid grid-cols-12 gap-4">
          <div
            className="col-span-12 md:col-span-8 md:col-start-2 space-y-5 md:space-y-6"
            style={{ color: "var(--ink-soft)" }}
          >
            <p className="text-base md:text-lg leading-relaxed">
              I&rsquo;m a multidisciplinary designer with 13+ years of
              experience working across FMCG, fintech, and consumer
              tech. Originally from Cape Town and now based in
              Amsterdam, I work across brand, product, illustration,
              and visual communication.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              Over the years I&rsquo;ve worked with both agencies and
              startups, which means I&rsquo;m just as comfortable
              thinking about the bigger picture as I am getting stuck
              into the details. From shaping visual identities to
              improving product experiences, I enjoy finding simple,
              thoughtful ways to connect brands with people.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              I&rsquo;m naturally curious, hands on, and probably
              happiest when I&rsquo;m creating, refining, and
              problem-solving. A bit of a creative Swiss army knife,
              with a soft spot for good storytelling, clean and
              conceptual design.
            </p>
            <div className="pt-2 md:pt-4 flex flex-wrap items-center gap-4">
              <ContactButton />
              <MobileConfettiButton className="md:hidden" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Rule + Selected work ────────────────────────────────── */}
      <div className="rule mx-[var(--spacing-page)]" />
      <section
        id="selected-work"
        className="px-[var(--spacing-page)] pt-12 md:pt-16 scroll-mt-20"
      >
        <div className="mb-10 md:mb-14 max-w-2xl">
          <p
            className="font-display"
            style={{ fontSize: "var(--text-d3)", lineHeight: 1.0 }}
          >
            Selected work.
          </p>
          <p className="mt-4 md:mt-5 text-base md:text-lg leading-relaxed text-[color:var(--ink-soft)]">
            Long term in house work shaping brand, product, and
            marketing systems across multiple channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {caseStudies.map((study, i) => (
            <WorkCard key={study.slug} study={study} index={i} />
          ))}
        </div>
      </section>

      {/* ── Additional Projects ─────────────────────────────────── */}
      <div className="rule mx-[var(--spacing-page)] mt-16 md:mt-24" />
      <ArchiveSection projects={projects} />

      <SiteFooter />
    </div>
  );
}
