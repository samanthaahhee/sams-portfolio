import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HalftoneCover } from "@/components/halftone-cover";
import { getCaseStudies, getCaseStudyBySlug } from "@/lib/db";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const caseStudies = await getCaseStudies();
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);
  if (!study) return {};
  return {
    title: study.title,
    description: study.summary,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [study, caseStudies] = await Promise.all([
    getCaseStudyBySlug(slug),
    getCaseStudies(),
  ]);
  if (!study) notFound();

  const others = caseStudies.filter((c) => c.slug !== study.slug);

  return (
    <div data-pair={study.palette}>
      <SiteHeader pageNo={study.no} />

      <main>
        {/* ── Back button ────────────────────────────────────────────── */}
        <div className="px-[var(--spacing-page)] pt-8 md:pt-10">
          <Link
            href="/"
            className="font-mono text-[color:var(--meta)] hover:text-[color:var(--ink)] transition-colors"
          >
            ← Back to selected work
          </Link>
        </div>

        {/* ── Editorial cover plate ──────────────────────────────────── */}
        <section className="px-[var(--spacing-page)] pt-8 md:pt-12">
          <HalftoneCover
            no={study.no}
            title={study.title}
            client={study.client}
            year={study.year}
          />
        </section>

        {/* ── Title + summary ────────────────────────────────────────── */}
        <section className="px-[var(--spacing-page)] pt-16 md:pt-24">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3 md:col-start-2 space-y-6 mb-10 md:mb-0">
              <div>
                <p className="font-mono text-[color:var(--meta)] mb-2">Client</p>
                <p>{study.client}</p>
              </div>
              <div>
                <p className="font-mono text-[color:var(--meta)] mb-2">Year</p>
                <p>{study.year}</p>
              </div>
              <div>
                <p className="font-mono text-[color:var(--meta)] mb-2">Role</p>
                <ul className="space-y-1">
                  {study.role.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              {study.link && (
                <div>
                  <p className="font-mono text-[color:var(--meta)] mb-2">Live</p>
                  <a
                    href={study.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 hover:opacity-70 transition-opacity"
                  >
                    {study.link.label} ↗
                  </a>
                </div>
              )}
            </div>

            <div className="col-span-12 md:col-span-6 md:col-start-6">
              <p
                className="font-display"
                style={{
                  fontSize: "var(--text-d3)",
                  lineHeight: 1.05,
                  marginBottom: "1.5em",
                }}
              >
                {study.summary}
              </p>
            </div>
          </div>
        </section>

        {/* ── Body: Context, Problem, Approach ───────────────────────── */}
        <Section label="Context">{study.context}</Section>
        <Section label="Problem">{study.problem}</Section>
        <Section label="Approach">{study.approach}</Section>

        {/* ── Decisions ──────────────────────────────────────────────── */}
        <section className="px-[var(--spacing-page)] pt-16 md:pt-24">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3 md:col-start-2">
              <p className="font-mono text-[color:var(--meta)]">Decisions</p>
            </div>
            <div className="col-span-12 md:col-span-6 md:col-start-6 space-y-12">
              {study.decisions.map((d, i) => (
                <article key={d.title} className="border-t border-[color:var(--rule)] pt-6">
                  <div className="flex items-baseline gap-6 mb-3">
                    <span className="font-mono text-[color:var(--meta)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl">
                      {d.title}
                    </h3>
                  </div>
                  <p className="text-[color:var(--ink-soft)] text-lg leading-relaxed md:pl-12">
                    {d.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Placeholder image plate (will be real screens from Sanity) */}
        <section className="px-[var(--spacing-page)] pt-16 md:pt-24">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-10 md:col-start-2">
              <div
                className="relative rounded-sm overflow-hidden halftone-overlay"
                style={{
                  background: "var(--pair-b)",
                  color: "var(--pair-b-ink)",
                  aspectRatio: "16 / 10",
                }}
              >
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center font-mono px-8">
                    <p className="mb-2">Plate 01</p>
                    <p className="opacity-70 max-w-md mx-auto">
                      Final brand artwork — to be replaced with real imagery
                      from the {study.client} case file
                    </p>
                  </div>
                </div>
              </div>
              <p className="font-mono text-[color:var(--meta)] mt-3">
                Fig. 01 — {study.client} identity, applied across surface.
              </p>
            </div>
          </div>
        </section>

        {/* ── Outcome + Reflection ───────────────────────────────────── */}
        <Section label="Outcome">{study.outcome}</Section>
        <Section label="Reflection">{study.reflection}</Section>

        {/* ── Next ───────────────────────────────────────────────────── */}
        <section className="px-[var(--spacing-page)] pt-32 md:pt-48 pb-12">
          <div className="rule mb-10" />
          <div className="grid grid-cols-12 gap-4 items-baseline">
            <p className="col-span-12 md:col-span-3 md:col-start-2 font-mono text-[color:var(--meta)]">
              Continue reading
            </p>
            <ul className="col-span-12 md:col-span-6 md:col-start-6 space-y-6">
              {others.map((o) => (
                <li key={o.slug} data-pair={o.palette}>
                  <Link
                    href={`/work/${o.slug}`}
                    className="group flex items-baseline justify-between gap-6 py-3 border-b border-[color:var(--rule)]"
                  >
                    <span className="flex items-baseline gap-6">
                      <span className="font-mono text-[color:var(--meta)]">
                        No. {o.no}
                      </span>
                      <span
                        className="font-display text-3xl md:text-4xl transition-colors"
                        style={{ color: "var(--ink)" }}
                      >
                        {o.title}
                      </span>
                    </span>
                    <span className="font-mono text-[color:var(--meta)] group-hover:text-[color:var(--ink)] transition-colors">
                      {o.client} →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-[var(--spacing-page)] pt-16 md:pt-24">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-3 md:col-start-2">
          <p className="font-mono text-[color:var(--meta)]">{label}</p>
        </div>
        <div className="col-span-12 md:col-span-6 md:col-start-6">
          <p className="text-lg md:text-xl leading-relaxed text-[color:var(--ink)]">
            {children}
          </p>
        </div>
      </div>
    </section>
  );
}
