import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HalftoneCover } from "@/components/halftone-cover";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { ImageGrid } from "@/components/image-grid";
import { ImageStack } from "@/components/image-stack";
import { MediaRow } from "@/components/media-row";
import { CaseStudySections } from "@/components/case-study-sections";
import { getCaseStudies, getCaseStudyBySlug } from "@/lib/db";
import { customColorsToStyle } from "@/lib/palette";
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
  const useCustom = study.palette === "custom" && study.customColors;

  return (
    <div
      data-pair={useCustom ? undefined : study.palette}
      style={useCustom ? customColorsToStyle(study.customColors!) : undefined}
    >
      <SiteHeader pageNo={study.no} />

      <main>
        {/* ── Back button ────────────────────────────────────────────── */}
        <div className="px-[var(--spacing-page)] pt-8 md:pt-10">
          <Link
            href="/#selected-work"
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
              {study.client?.trim() && (
                <div>
                  <p className="font-mono text-[color:var(--meta)] mb-2">Client</p>
                  <p>{study.client}</p>
                </div>
              )}
              {study.year?.trim() && (
                <div>
                  <p className="font-mono text-[color:var(--meta)] mb-2">Year</p>
                  <p>{study.year}</p>
                </div>
              )}
              {study.role && study.role.length > 0 && (
                <div>
                  <p className="font-mono text-[color:var(--meta)] mb-2">Role</p>
                  <ul className="space-y-1">
                    {study.role.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
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
              <p className="text-base md:text-xl leading-relaxed font-bold text-[color:var(--ink)]">
                {study.summary}
              </p>
            </div>
          </div>
        </section>

        {/* ── Tabbed body sections ───────────────────────────────────── */}
        <CaseStudySections
          context={study.context}
          problem={study.problem}
          approach={study.approach}
          decisions={study.decisions}
          outcome={study.outcome}
          reflection={study.reflection}
        />

        {/* ── Visuals (images + before/after sliders, one ordered list) */}
        {study.visuals && study.visuals.length > 0 && (
          <section className="px-[var(--spacing-page)] pt-16 md:pt-24">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-10 md:col-start-2 space-y-8 md:space-y-12 md:px-[5%]">
                {study.visuals.map((v, i) => {
                  const figLabel = `Fig. ${String(i + 1).padStart(2, "0")}`;
                  const cap = v.caption
                    ? `${figLabel} — ${v.caption}`
                    : figLabel;
                  if (v.kind === "compare") {
                    return (
                      <BeforeAfterSlider
                        key={`v-${i}`}
                        before={v.before}
                        after={v.after}
                        caption={cap}
                      />
                    );
                  }
                  if (v.kind === "grid") {
                    return (
                      <ImageGrid key={`v-${i}`} images={v.images} caption={cap} />
                    );
                  }
                  if (v.kind === "stack") {
                    return (
                      <ImageStack key={`v-${i}`} images={v.images} caption={cap} />
                    );
                  }
                  if (v.kind === "media") {
                    return (
                      <MediaRow
                        key={`v-${i}`}
                        images={v.images}
                        layout={v.layout}
                        caption={cap}
                      />
                    );
                  }
                  return (
                    <figure key={`v-${i}-${v.url}`} className="space-y-2">
                      <div
                        className="relative overflow-hidden rounded-sm"
                        style={{
                          background: "transparent",
                          aspectRatio: "16 / 10",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={v.url}
                          alt={v.caption ?? `${study.title} plate ${i + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <figcaption className="font-mono text-[color:var(--meta)]">
                        {cap}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Next ───────────────────────────────────────────────────── */}
        <section className="px-[var(--spacing-page)] pt-32 md:pt-48 pb-24 md:pb-32">
          <div className="rule mb-10" />
          <div className="grid grid-cols-12 gap-4 items-baseline">
            <p className="col-span-12 md:col-span-3 md:col-start-2 font-mono text-[color:var(--meta)]">
              Continue reading
            </p>
            <ul className="col-span-12 md:col-span-6 md:col-start-6 space-y-8 md:space-y-10 mb-12 md:mb-16">
              {others.map((o) => (
                <li key={o.slug} data-pair={o.palette}>
                  <Link
                    href={`/work/${o.slug}`}
                    className="group flex items-baseline justify-between gap-6 py-4 border-b border-[color:var(--rule)]"
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
