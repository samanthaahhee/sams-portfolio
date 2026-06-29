/**
 * Alternative landing-hero exploration — type-led, strict-grid,
 * curated to three pieces, with a fixed muted palette and an
 * explicit CTA. Addresses the visual-comms-designer hero feedback
 * point-by-point. Not linked from anywhere; the live homepage and
 * /hero-preview stay untouched.
 */

import Link from "next/link";
import { HeroNav } from "@/components/hero-nav";
import { SiteFooter } from "@/components/site-footer";
import { getCaseStudies, getHeroCards, getProjects } from "@/lib/db";

export const metadata = { title: "Hero — alternative preview" };

type HeroPiece = {
  href: string;
  src: string;
  title: string;
  client?: string | null;
};

export default async function HeroAltPage() {
  // Same sourcing as /hero-preview, but capped at the top three so
  // the grid stays curated rather than infinite.
  const heroCards = await getHeroCards();
  let all: HeroPiece[] = heroCards.map((c) => ({
    href: c.href || "#",
    src: c.imageUrl,
    title: c.title,
    client: c.client,
  }));
  if (all.length === 0) {
    const [caseStudies, projects] = await Promise.all([
      getCaseStudies(),
      getProjects(),
    ]);
    all = [
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
  const pieces = all.slice(0, 3);

  return (
    <div
      className="min-h-screen text-white"
      style={{
        // Fixed warm-mahogany gradient — stays put regardless of which
        // card you hover, so the page has a stable colour story.
        background:
          "linear-gradient(170deg, #2a1612 0%, #1d0e0c 55%, #120907 100%)",
      }}
    >
      <div className="px-[var(--spacing-page)] pt-8 md:pt-10">
        <HeroNav tone="dark" />
      </div>

      <main className="px-[var(--spacing-page)] pt-16 md:pt-24 pb-24 md:pb-32">
        {/* ── 12-col strict grid for the whole hero ──────────────── */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Eyebrow — anchors the type column */}
          <div className="col-span-12 md:col-span-10 md:col-start-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55 mb-8 md:mb-12">
              Sam Ahhee  ·  Visual Communications Designer  ·
              Amsterdam ⤬ Cape Town
            </p>

            {/* Editorial headline — POV, not a job title */}
            <h1
              className="font-display font-bold leading-[0.92] tracking-[-0.025em]"
              style={{ fontSize: "clamp(2.5rem, 7vw, 6.5rem)" }}
            >
              Translating complex briefs<br />
              into clear visual systems<br />
              <span className="text-white/55">
                for brands that need to mean something.
              </span>
            </h1>

            {/* Short descriptor — single line, mono cadence */}
            <p className="mt-8 md:mt-12 text-white/70 text-[13px] md:text-sm leading-relaxed max-w-[60ch]">
              13+ years across FMCG, fintech and consumer tech. Brand
              systems, product, editorial, illustration — work that
              earns its place at every touchpoint.
            </p>
          </div>

          {/* Curated 3-up work grid */}
          <div className="col-span-12 md:col-span-10 md:col-start-2 mt-12 md:mt-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {pieces.map((p, i) => (
                <Link
                  key={p.href + i}
                  href={p.href}
                  className="group block relative overflow-hidden rounded-sm bg-[#0a0506]"
                  style={{ aspectRatio: "4 / 5" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.src}
                    alt={p.title}
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)",
                    }}
                  />
                  <div className="absolute left-4 right-4 bottom-4 text-white">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/75 mb-1">
                      {String(i + 1).padStart(2, "0")}{p.client ? `  ·  ${p.client}` : ""}
                    </p>
                    <p className="font-display text-sm md:text-base leading-tight">
                      {p.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Explicit primary CTA */}
          <div className="col-span-12 md:col-span-10 md:col-start-2 mt-10 md:mt-14 flex items-baseline justify-between gap-6 flex-wrap">
            <Link
              href="/#selected-work"
              className="group inline-flex items-baseline gap-3 font-display text-lg md:text-2xl font-semibold border-b border-white/40 pb-1 hover:border-white transition-colors"
            >
              <span>Selected work</span>
              <span aria-hidden className="text-white/60 group-hover:text-white transition-colors">
                →
              </span>
            </Link>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
              {pieces.length} of {all.length} pieces shown
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
