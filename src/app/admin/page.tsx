import Link from "next/link";
import { getProjects, getCaseStudies } from "@/lib/db";

export default async function AdminHome() {
  const [projects, caseStudies] = await Promise.all([
    getProjects(),
    getCaseStudies(),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header>
        <p className="font-mono text-[color:var(--meta)] mb-2">Overview</p>
        <h1 className="font-display text-4xl md:text-5xl" style={{ lineHeight: 0.95 }}>
          Dashboard
        </h1>
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
          {projects.map((p) => (
            <li
              key={p.slug}
              className="border-b border-[color:var(--rule)] py-3 flex items-baseline justify-between gap-4"
            >
              <Link
                href={`/admin/projects/${p.slug}`}
                className="flex items-baseline gap-4 hover:text-[color:var(--ink)]"
              >
                <span className="font-mono text-[color:var(--meta)] w-24">{p.brand}</span>
                <span>{p.title}</span>
              </Link>
              <span className="font-mono text-[color:var(--meta)]">{p.tags.join(" · ")}</span>
            </li>
          ))}
        </ul>
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
          {caseStudies.map((c) => (
            <li
              key={c.slug}
              className="border-b border-[color:var(--rule)] py-3 flex items-baseline justify-between gap-4"
            >
              <Link
                href={`/admin/case-studies/${c.slug}`}
                className="flex items-baseline gap-4 hover:text-[color:var(--ink)]"
              >
                <span className="font-mono text-[color:var(--meta)] w-12">No. {c.no}</span>
                <span>{c.title}</span>
              </Link>
              <span className="font-mono text-[color:var(--meta)]">{c.client}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
