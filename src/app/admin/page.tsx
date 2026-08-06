import Link from "next/link";
import { getAllPortfolioProjects } from "@/lib/db-portfolio";
import { PLACEHOLDER_PROJECTS } from "@/lib/portfolio-placeholders";

/* The rebuild has one content type: a project. The legacy dashboard split
 * the same idea across "Projects" and "Case studies" and carried a CV
 * section besides; all three are retired here. Their tables and API
 * routes are untouched, so nothing is lost — only the editors are gone. */

export default async function AdminHome() {
  const projects = await getAllPortfolioProjects();
  const inDb = new Set(projects.map((p) => p.slug));
  const notImported = PLACEHOLDER_PROJECTS.filter((p) => !inDb.has(p.slug));

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

      <section>
        <div className="flex items-baseline justify-between mb-4 gap-4 flex-wrap">
          <h2 className="font-display text-2xl">Projects · {projects.length}</h2>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/work"
              className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px] border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
            >
              Reorder
            </Link>
            <Link
              href="/admin/work/new"
              className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px]"
              style={{ background: "var(--ink)", color: "var(--paper)" }}
            >
              + New project
            </Link>
          </div>
        </div>

        <ul className="border-t border-[color:var(--rule)]">
          {projects.map((p) => (
            <li
              key={p.id}
              className="border-b border-[color:var(--rule)] py-3 flex items-center justify-between gap-4"
            >
              <Link
                href={`/admin/work/${p.id}`}
                className="flex items-baseline gap-4 flex-1 min-w-0 hover:text-[color:var(--ink)]"
              >
                <span className="font-mono text-[color:var(--meta)] w-32 shrink-0 truncate">
                  {p.client || "—"}
                </span>
                <span className="truncate flex items-center gap-2">
                  {p.title}
                  {!p.visible && (
                    <span
                      className="font-mono uppercase tracking-[0.14em] text-[9px] px-2 py-0.5 rounded-full border"
                      style={{ borderColor: "var(--rule)", color: "var(--meta)" }}
                    >
                      Hidden
                    </span>
                  )}
                </span>
              </Link>
              <div className="flex items-center gap-3 shrink-0">
                {p.accentColor && (
                  <span
                    aria-label={`Accent ${p.accentColor}`}
                    className="h-4 w-4 rounded-full border"
                    style={{ background: p.accentColor, borderColor: "var(--rule)" }}
                  />
                )}
                <span className="font-mono text-[color:var(--meta)] hidden md:inline">
                  {p.year}
                </span>
                <a
                  href={`/work/${p.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[color:var(--meta)] text-[10px] uppercase tracking-[0.14em] hover:text-[color:var(--ink)]"
                >
                  View ↗
                </a>
              </div>
            </li>
          ))}
        </ul>

        {notImported.length > 0 && (
          <p className="font-mono text-[color:var(--meta)] text-[10px] mt-3">
            {notImported.length} more render from code fixtures and need adding to
            the database before they can be edited —{" "}
            <Link href="/admin/work" className="underline hover:text-[color:var(--ink)]">
              /admin/work
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}
