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
        {/* ── Editorial masthead ─────────────────────────────────────── */}
        <section className="relative px-[var(--spacing-page)] pt-12 md:pt-20 pb-20 md:pb-32">
          {/* Halftone wash behind masthead */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[60%] halftone opacity-[0.10] pointer-events-none"
            style={{ ["--dot" as string]: "var(--pair-b)" }}
          />


          <div className="col-span-12 flex items-center justify-between font-mono text-[color:var(--meta)] mb-12 md:mb-20">
            <span>Volume 01</span>
            <span className="hidden sm:inline">A portfolio in print form</span>
            <span>Est. 2026</span>
          </div>

          <div className="relative grid grid-cols-12 gap-4 items-center">
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

          <div className="relative grid grid-cols-12 gap-4 mt-12 md:mt-16">
            <div className="col-span-12 md:col-span-8 md:col-start-2">
              <p
                className="text-xl md:text-2xl leading-snug"
                style={{ color: "var(--ink)" }}
              >
                Hey, I'm Sam — a swiss-army-knife full-stack designer working
                across brand, product, and editorial. I make things that are
                beautiful first and useful always, for teams that want both.
              </p>
              <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-3">
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
          <div className="flex items-baseline justify-between font-mono text-[color:var(--meta)] mb-10">
            <span>Selected Work</span>
            <span>{String(caseStudies.length).padStart(2, "0")} pieces</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {caseStudies.map((study, i) => (
              <WorkCard key={study.slug} study={study} index={i} />
            ))}
          </div>
        </section>

        {/* ── Also from the Archive — supporting work ────────────────── */}
        <div className="rule mx-[var(--spacing-page)] mt-32 md:mt-40" />
        <ArchiveSection projects={projects} />

        {/* ── Closing editorial note ─────────────────────────────────── */}
        <section className="px-[var(--spacing-page)] pt-32 md:pt-48 pb-12">
          <div className="grid grid-cols-12 gap-4">
            <p
              className="col-span-12 md:col-span-8 md:col-start-3 font-display text-center"
              style={{
                fontSize: "var(--text-d3)",
                lineHeight: 1.05,
              }}
            >
              Design that holds the room and does the work.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
