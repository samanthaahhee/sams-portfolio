import Link from "next/link";
import { getProjects, getCaseStudies, getExperience } from "@/lib/db";
import { ReorderControls } from "@/app/admin/_components/reorder-controls";

export default async function AdminHome() {
  const [projects, caseStudies, experience] = await Promise.all([
    getProjects(),
    getCaseStudies(),
    getExperience(),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono text-[color:var(--meta)] mb-2">Overview</p>
          <h1 className="font-display text-4xl md:text-5xl" style={{ lineHeight: 0.95 }}>
            Dashboard
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/hero"
            className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px] border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
          >
            Hero deck
          </Link>
          <Link
            href="/admin/settings"
            className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px] border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
          >
            Site settings
          </Link>
        </div>
      </header>

      {/* Projects */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl">Projects · {projects.length}</h2>
          <Link
            href="/admin/projects/new"
            className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px]"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            + New project
          </Link>
        </div>
        <ul className="border-t border-[color:var(--rule)]">
          {projects.map((p, i) => (
            <li
              key={p.slug}
              className="border-b border-[color:var(--rule)] py-3 flex items-center justify-between gap-4"
            >
              <Link
                href={`/admin/projects/${p.slug}`}
                className="flex items-baseline gap-4 flex-1 min-w-0 hover:text-[color:var(--ink)]"
              >
                <span className="font-mono text-[color:var(--meta)] w-24 shrink-0 truncate">{p.brand}</span>
                <span className="truncate">{p.title}</span>
              </Link>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-[color:var(--meta)] hidden md:inline">{p.tags.join(" · ")}</span>
                <ReorderControls
                  slug={p.slug}
                  kind="project"
                  isFirst={i === 0}
                  isLast={i === projects.length - 1}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Experience — drives the /about timeline */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl">
            CV experience · {experience.length}
          </h2>
          <Link
            href="/admin/experience/new"
            className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px]"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            + New role
          </Link>
        </div>
        <ul className="border-t border-[color:var(--rule)]">
          {experience.map((e) => (
            <li
              key={e.slug}
              className="border-b border-[color:var(--rule)] py-3 flex items-center justify-between gap-4"
            >
              <Link
                href={`/admin/experience/${e.slug}`}
                className="flex items-baseline gap-4 flex-1 min-w-0 hover:text-[color:var(--ink)]"
              >
                <span className="font-mono text-[color:var(--meta)] w-24 shrink-0 truncate">
                  {e.yearPill}
                </span>
                <span className="truncate">
                  {e.title} — {e.company}
                </span>
              </Link>
              <span className="font-mono text-[color:var(--meta)] hidden md:inline shrink-0">
                {e.dates}
              </span>
            </li>
          ))}
        </ul>
        <p className="font-mono text-[color:var(--meta)] text-[10px] mt-3">
          Reorder + edit individual roles at{" "}
          <Link
            href="/admin/experience"
            className="underline hover:text-[color:var(--ink)]"
          >
            /admin/experience
          </Link>
          .
        </p>
      </section>

      {/* Case studies */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl">Case studies · {caseStudies.length}</h2>
          <Link
            href="/admin/case-studies/new"
            className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px]"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            + New case study
          </Link>
        </div>
        <ul className="border-t border-[color:var(--rule)]">
          {caseStudies.map((c, i) => (
            <li
              key={c.slug}
              className="border-b border-[color:var(--rule)] py-3 flex items-center justify-between gap-4"
            >
              <Link
                href={`/admin/case-studies/${c.slug}`}
                className="flex items-baseline gap-4 flex-1 min-w-0 hover:text-[color:var(--ink)]"
              >
                <span className="font-mono text-[color:var(--meta)] w-12 shrink-0">No. {c.no}</span>
                <span className="truncate">{c.title}</span>
              </Link>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-[color:var(--meta)] hidden md:inline">{c.client}</span>
                <ReorderControls
                  slug={c.slug}
                  kind="case-study"
                  isFirst={i === 0}
                  isLast={i === caseStudies.length - 1}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
