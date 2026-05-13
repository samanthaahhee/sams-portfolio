import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getProject, getProjects } from "@/lib/db";
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

  return (
    <div data-pair={project.palette}>
      <SiteHeader pageNo="P" />

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

        {/* ── Editorial header ───────────────────────────────────── */}
        <section className="px-[var(--spacing-page)] pt-8 md:pt-12 pb-10 md:pb-16">
          <div className="grid grid-cols-12 gap-4 items-baseline mb-8">
            <div className="col-span-12 md:col-span-3 md:col-start-2">
              <p className="font-mono text-[color:var(--meta)] mb-2">Brand</p>
              <p>{project.brand}</p>
            </div>
            <div className="col-span-6 md:col-span-3">
              <p className="font-mono text-[color:var(--meta)] mb-2">Discipline</p>
              <p>{project.tags.join(" · ")}</p>
            </div>
            <div className="col-span-6 md:col-span-3">
              <p className="font-mono text-[color:var(--meta)] mb-2">Format</p>
              <p>Project · Field note</p>
            </div>
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

        {/* ── Hero image ─────────────────────────────────────────── */}
        <section className="px-[var(--spacing-page)]">
          <div
            className="relative overflow-hidden rounded-sm"
            style={{
              background: "var(--pair-a)",
              aspectRatio: "16 / 10",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.gallery[0]}
              alt={`${project.title} — hero placeholder`}
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-multiply"
              style={{ background: "var(--pair-a)", opacity: 0.18 }}
            />
            <div
              aria-hidden
              className="absolute inset-0 halftone-fine opacity-20 mix-blend-multiply"
              style={{ ["--dot" as string]: "var(--pair-b)" }}
            />
          </div>
        </section>

        {/* ── Descriptor ─────────────────────────────────────────── */}
        <section className="px-[var(--spacing-page)] pt-16 md:pt-24">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3 md:col-start-2">
              <p className="font-mono text-[color:var(--meta)]">About</p>
            </div>
            <div className="col-span-12 md:col-span-6 md:col-start-6">
              <p className="text-lg md:text-xl leading-relaxed text-[color:var(--ink)]">
                {project.description}
              </p>
            </div>
          </div>
        </section>

        {/* ── Visual gallery — inset to match the body width ────── */}
        <section className="px-[var(--spacing-page)] pt-16 md:pt-24">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-10 md:col-start-2">
              <div className="flex items-baseline justify-between font-mono text-[color:var(--meta)] mb-6 md:mb-8">
                <span>Visuals</span>
                <span>{project.gallery.length} plates</span>
              </div>
              <div className="space-y-8 md:space-y-12">
                {project.gallery.slice(1).map((src, i) => (
                  <figure key={src} className="space-y-2">
                    <div
                      className="relative overflow-hidden rounded-sm"
                      style={{
                        background: "var(--pair-a)",
                        aspectRatio: "16 / 10",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`${project.title} plate ${i + 2}`}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div
                        aria-hidden
                        className="absolute inset-0 mix-blend-multiply"
                        style={{ background: "var(--pair-a)", opacity: 0.16 }}
                      />
                    </div>
                    <figcaption className="font-mono text-[color:var(--meta)]">
                      Fig. {String(i + 2).padStart(2, "0")} — placeholder
                    </figcaption>
                  </figure>
                ))}
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
