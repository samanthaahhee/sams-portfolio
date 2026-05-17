import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WorkCard } from "@/components/work-card";
import { ArchiveSection } from "@/components/archive-section";
import { PosterCollage } from "@/components/poster-collage";
import { FloatingConfetti } from "@/components/floating-confetti";
import { ContactButton } from "@/components/contact-button";
import { MobileConfettiButton } from "@/components/mobile-confetti-button";
import { getProjects, getCaseStudies } from "@/lib/db";

export default async function Home() {
  const [caseStudies, projects] = await Promise.all([
    getCaseStudies(),
    getProjects(),
  ]);
  return (
    <div data-pair="butter-slate">
      <SiteHeader pageNo="01" />

      <main>
        {/* ── Editorial masthead — heading + portrait sit on the
            halftone wash. Bio copy lives in its own section below so
            it falls in the clear paper area, not on the dots. ─── */}
        <section className="relative px-[var(--spacing-page)] pt-12 md:pt-20 pb-12 md:pb-16">
          {/* Halftone wash behind the heading only */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 bottom-0 halftone opacity-[0.10] pointer-events-none"
            style={{ ["--dot" as string]: "var(--pair-b)" }}
          />

          <div className="relative grid grid-cols-12 gap-4 items-center pt-4 md:pt-8">
            <h1
              className="col-span-12 md:col-span-7 font-display relative z-10"
              style={{
                fontSize: "var(--text-d1)",
                lineHeight: 0.86,
              }}
            >
              Sam
              <br />
              Ahhee.
            </h1>

            {/* Portrait + paper confetti falling onto + around it */}
            <div className="hidden md:flex md:col-span-5 md:col-start-8 justify-end items-center">
              <div className="relative w-[60%] -translate-x-[40%]">
                <PosterCollage />
                <FloatingConfetti />
              </div>
            </div>
          </div>
        </section>

        {/* ── Bio — single column, three stacked paragraphs at the
            same body size, on clear paper. ────────────────────── */}
        <section className="px-[var(--spacing-page)] pt-16 md:pt-24 pb-20 md:pb-28">
          <div className="grid grid-cols-12 gap-4">
            <div
              className="col-span-12 md:col-span-8 md:col-start-2 space-y-5 md:space-y-6"
              style={{ color: "var(--ink-soft)" }}
            >
              <p className="text-base md:text-lg leading-relaxed">
                Sam is a multidisciplinary designer with 13+ years of
                experience across FMCG, fintech, and consumer tech.
                Originally from Cape Town and now based in Amsterdam, she
                works at the intersection of brand, product, and visual
                communication.
              </p>
              <p className="text-base md:text-lg leading-relaxed">
                Her work focuses on building scalable, human-centered
                experiences that connect across every touchpoint. With a
                background spanning both agencies and startups, Sam
                combines strategic thinking with hands-on execution —
                bringing clarity, emotion, and systems thinking to
                everything from visual identities to product experiences.
              </p>
              <p className="text-base md:text-lg leading-relaxed">
                Part strategist, part maker, part problem-solver — she’s a
                creative Swiss army knife for modern brands.
              </p>
              <div className="pt-2 md:pt-4 flex flex-wrap items-center gap-4">
                <ContactButton />
                <MobileConfettiButton className="md:hidden" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Rule + section heading ─────────────────────────────────── */}
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
              Long-term in-house work shaping brand, product, and marketing
              systems across multiple channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {caseStudies.map((study, i) => (
              <WorkCard key={study.slug} study={study} index={i} />
            ))}
          </div>
        </section>

        {/* ── Also from the Archive — supporting work ────────────────── */}
        <div className="rule mx-[var(--spacing-page)] mt-16 md:mt-24" />
        <ArchiveSection projects={projects} />

      </main>

      <SiteFooter />
    </div>
  );
}
