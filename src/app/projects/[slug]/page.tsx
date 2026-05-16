import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { ImageGrid } from "@/components/image-grid";
import { ImageStack } from "@/components/image-stack";
import { MediaRow } from "@/components/media-row";
import { CaseStudySections } from "@/components/case-study-sections";
import { HalftoneCover } from "@/components/halftone-cover";
import { getProject, getProjects } from "@/lib/db";
import { customColorsToStyle } from "@/lib/palette";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} · ${project.brand}`,
    description: project.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, projects] = await Promise.all([
    getProject(slug),
    getProjects(),
  ]);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length];
  const useCustom = project.palette === "custom" && project.customColors;

  /* Editorial mode = any of the case-study fields are populated. When on,
   * we render the longer-form layout (cover plate, summary pullquote,
   * tabbed body sections); otherwise we keep the original compact
   * project layout. */
  const editorial = Boolean(
    project.summary?.trim() ||
      project.context?.trim() ||
      project.problem?.trim() ||
      project.approach?.trim() ||
      (project.decisions && project.decisions.length > 0) ||
      project.outcome?.trim() ||
      project.reflection?.trim(),
  );
  const clientLabel = project.client?.trim() || project.brand;

  return (
    <div
      data-pair={useCustom ? undefined : project.palette}
      style={useCustom ? customColorsToStyle(project.customColors!) : undefined}
    >
      <SiteHeader pageNo={editorial ? project.no ?? "P" : "P"} />

      <main>
        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        <div className="px-[var(--spacing-page)] pt-8 md:pt-10">
          <Link
            href="/#archive"
            className="font-mono text-[color:var(--meta)] hover:text-[color:var(--ink)] transition-colors"
          >
            ← Back to archive
          </Link>
        </div>

        {editorial ? (
          <>
            {/* ── Editorial cover plate ──────────────────────────── */}
            <section className="px-[var(--spacing-page)] pt-8 md:pt-12">
              <HalftoneCover
                no={project.no ?? ""}
                title={project.title}
                client={clientLabel}
                year={project.year ?? ""}
              />
            </section>

            {/* ── Title + summary + sidebar metadata ─────────────── */}
            <section className="px-[var(--spacing-page)] pt-16 md:pt-24">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-3 md:col-start-2 space-y-6 mb-10 md:mb-0">
                  {clientLabel?.trim() && (
                    <div>
                      <p className="font-mono text-[color:var(--meta)] mb-2">
                        Client
                      </p>
                      <p>{clientLabel}</p>
                    </div>
                  )}
                  {project.year?.trim() && (
                    <div>
                      <p className="font-mono text-[color:var(--meta)] mb-2">
                        Year
                      </p>
                      <p>{project.year}</p>
                    </div>
                  )}
                  {project.role && project.role.length > 0 && (
                    <div>
                      <p className="font-mono text-[color:var(--meta)] mb-2">
                        Role
                      </p>
                      <ul className="space-y-1">
                        {project.role.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.link && (
                    <div>
                      <p className="font-mono text-[color:var(--meta)] mb-2">
                        Live
                      </p>
                      <a
                        href={project.link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-4 hover:opacity-70 transition-opacity"
                      >
                        {project.link.label} ↗
                      </a>
                    </div>
                  )}
                </div>

                <div className="col-span-12 md:col-span-6 md:col-start-6">
                  {project.summary?.trim() ? (
                    <p className="text-base md:text-xl leading-relaxed font-bold text-[color:var(--ink)]">
                      {project.summary}
                    </p>
                  ) : (
                    <p className="text-base md:text-xl leading-relaxed text-[color:var(--ink)]">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* ── Tabbed body sections ───────────────────────────── */}
            <CaseStudySections
              context={project.context ?? ""}
              problem={project.problem ?? ""}
              approach={project.approach ?? ""}
              decisions={project.decisions ?? []}
              outcome={project.outcome ?? ""}
              reflection={project.reflection ?? ""}
            />
          </>
        ) : (
          <>
            {/* ── Compact editorial header (original) ────────────── */}
            <section className="px-[var(--spacing-page)] pt-8 md:pt-12 pb-10 md:pb-16">
              <div className="grid grid-cols-12 gap-4 items-baseline mb-8">
                {project.brand?.trim() && (
                  <div className="col-span-12 md:col-span-3 md:col-start-2">
                    <p className="font-mono text-[color:var(--meta)] mb-2">
                      Brand
                    </p>
                    <p>{project.brand}</p>
                  </div>
                )}
                {project.tags && project.tags.length > 0 && (
                  <div className="col-span-6 md:col-span-3">
                    <p className="font-mono text-[color:var(--meta)] mb-2">
                      Discipline
                    </p>
                    <p>{project.tags.join(" · ")}</p>
                  </div>
                )}
                {project.year?.trim() && (
                  <div className="col-span-6 md:col-span-3">
                    <p className="font-mono text-[color:var(--meta)] mb-2">
                      Year
                    </p>
                    <p>{project.year}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-12 gap-4">
                <h1
                  className="col-span-12 md:col-span-10 md:col-start-2 font-display mt-6 md:mt-8"
                  style={{
                    fontSize: "var(--text-d2)",
                    lineHeight: 0.94,
                    maxWidth: "16ch",
                  }}
                >
                  {project.title}
                </h1>
              </div>
            </section>

            {project.description?.trim() && (
              <section className="px-[var(--spacing-page)] pt-16 md:pt-24">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-3 md:col-start-2">
                    <p className="font-mono text-[color:var(--meta)]">
                      About
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-6 md:col-start-6">
                    <p className="text-base md:text-xl leading-relaxed text-[color:var(--ink)]">
                      {project.description}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Visual gallery — inset to match the body width ────── */}
        <section className="px-[var(--spacing-page)] pt-16 md:pt-24">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-10 md:col-start-2 md:px-[5%]">
              <div className="flex items-baseline justify-between font-mono text-[color:var(--meta)] mb-6 md:mb-8">
                <span>Visuals</span>
                <span>{project.gallery.length} plates</span>
              </div>
              <div className="space-y-8 md:space-y-12">
                {(project.visuals ?? []).map((v, i) => {
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
                          alt={v.caption ?? `${project.title} plate ${i + 1}`}
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
          </div>
        </section>

        {/* ── Next project ───────────────────────────────────────── */}
        <section className="px-[var(--spacing-page)] pt-32 md:pt-48 pb-12">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-10 md:col-start-2">
              <div className="rule mb-8" />
              <div data-pair={next.palette}>
                <Link
                  href={`/projects/${next.slug}`}
                  className="group flex items-baseline justify-between gap-6 py-4 border-b border-[color:var(--rule)]"
                >
                  <span className="flex items-baseline gap-6">
                    <span className="font-mono text-[color:var(--meta)]">Next project</span>
                    <span
                      className="font-display"
                      style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", color: "var(--ink)" }}
                    >
                      {next.title}
                    </span>
                  </span>
                  <span className="font-mono text-[color:var(--meta)] group-hover:text-[color:var(--ink)] transition-colors">
                    {next.brand} →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
