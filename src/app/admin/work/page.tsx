import Link from "next/link";
import { getAllPortfolioProjects } from "@/lib/db-portfolio";
import { PLACEHOLDER_PROJECTS } from "@/lib/portfolio-placeholders";
import {
  DragReorderList,
  type DragItem,
} from "@/app/admin/_components/drag-reorder-list";
import { ImportPlaceholderButton } from "./_import-placeholder";

export default async function WorkList() {
  const projects = await getAllPortfolioProjects();
  const visible = projects.filter((p) => p.visible);
  const hidden = projects.filter((p) => !p.visible);

  /* Fixtures with no database row yet. They render on the site from code,
     but there is nothing to edit until a row exists — so surface them here
     with a one-click import rather than leaving them invisible. */
  const inDb = new Set(projects.map((p) => p.slug));
  const notImported = PLACEHOLDER_PROJECTS.filter((p) => !inDb.has(p.slug));

  const toItem = (p: (typeof projects)[number]): DragItem => ({
    slug: String(p.id),
    meta: p.client || "—",
    label: p.title,
    secondary: p.discipline,
    editHref: `/admin/work/${p.id}`,
    viewHref: `/work/${p.slug}`,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[color:var(--meta)] mb-2">Rebuild</p>
          <h1 className="font-display text-4xl md:text-5xl" style={{ lineHeight: 0.95 }}>
            Work
          </h1>
        </div>
        <Link
          href="/admin/work/new"
          className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px]"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          + New project
        </Link>
      </div>

      <p className="font-mono text-[color:var(--meta)] text-[11px] max-w-2xl">
        This manages the new /work project pages (portfolio_* tables),
        separate from the legacy Projects/Case studies above. Open a
        project to set its accent colour, overview copy and page blocks;
        &ldquo;View&rdquo; opens the live page in a new tab.
      </p>

      {notImported.length > 0 && (
        <section className="space-y-3">
          <p className="font-mono text-[color:var(--meta)]">
            Not in the database yet · {String(notImported.length).padStart(2, "0")}
          </p>
          <p className="font-mono text-[color:var(--meta)] text-[10px] max-w-2xl">
            These render from code fixtures, so there is nothing to edit until
            they have a row. Adding one keeps the same slug and details.
          </p>
          <ul className="border-t border-[color:var(--rule)]">
            {notImported.map((p) => (
              <li
                key={p.slug}
                className="border-b border-[color:var(--rule)] py-3 flex items-center justify-between gap-4"
              >
                <span className="flex items-baseline gap-4 flex-1 min-w-0">
                  <span className="font-mono text-[color:var(--meta)] w-32 shrink-0 truncate">
                    {p.client || "—"}
                  </span>
                  <span className="truncate">{p.title}</span>
                </span>
                <span className="flex items-center gap-4 shrink-0">
                  <a
                    href={`/work/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[color:var(--meta)] text-[10px] uppercase tracking-[0.14em] hover:text-[color:var(--ink)]"
                  >
                    View ↗
                  </a>
                  <ImportPlaceholderButton project={p} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[color:var(--meta)]">
            Visible · {String(visible.length).padStart(2, "0")}
          </p>
          <p className="font-mono text-[color:var(--meta)] text-[10px] hidden md:block">
            Drag rows to reorder · ↑ ↓ for touch
          </p>
        </div>
        {visible.length === 0 ? (
          <p className="font-mono text-[color:var(--meta)] text-[11px] py-4">
            No visible projects yet.
          </p>
        ) : (
          <DragReorderList items={visible.map(toItem)} endpoint="/api/admin/work/order" />
        )}
      </section>

      {hidden.length > 0 && (
        <section className="space-y-3">
          <p className="font-mono text-[color:var(--meta)]">
            Hidden · {String(hidden.length).padStart(2, "0")}
          </p>
          <ul className="border-t border-[color:var(--rule)]">
            {hidden.map((p) => (
              <li
                key={p.id}
                className="border-b border-[color:var(--rule)] py-3 flex items-center justify-between gap-4"
              >
                <Link
                  href={`/admin/work/${p.id}`}
                  className="flex items-baseline gap-4 flex-1 min-w-0 hover:opacity-70"
                >
                  <span className="font-mono text-[color:var(--meta)] w-32 shrink-0 truncate">
                    {p.client || "—"}
                  </span>
                  <span className="truncate flex items-center gap-2">
                    {p.title}
                    <span
                      className="font-mono uppercase tracking-[0.14em] text-[9px] px-2 py-0.5 rounded-full border"
                      style={{ borderColor: "var(--rule)", color: "var(--meta)" }}
                    >
                      Hidden
                    </span>
                  </span>
                </Link>
                <span className="font-mono text-[color:var(--meta)] hidden md:inline shrink-0">
                  {p.discipline}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
