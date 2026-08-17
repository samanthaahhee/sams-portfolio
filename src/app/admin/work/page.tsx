import Link from "next/link";
import { getAllPortfolioProjects } from "@/lib/db-portfolio";
import { PLACEHOLDER_PROJECTS } from "@/lib/portfolio-placeholders";
import { ImportPlaceholderButton } from "./_import-placeholder";
import { ProjectGrid, type GridProject } from "./_project-grid";

/* The admin must never serve a cached render: it is the surface you use
   to change the data it displays, so a stale list reads as the backend
   disagreeing with the live site. */
export const dynamic = "force-dynamic";
export const revalidate = 0;


export default async function WorkList() {
  const projects = await getAllPortfolioProjects();

  /* Fixtures with no database row yet. They render on the site from code,
     but there is nothing to edit until a row exists — so surface them here
     with a one-click import rather than leaving them invisible. */
  const inDb = new Set(projects.map((p) => p.slug));
  const notImported = PLACEHOLDER_PROJECTS.filter((p) => !inDb.has(p.slug));

  /* Tiles show exactly what the homepage shows — same image, same crop —
     so the list doubles as a read on how the grid currently looks. */
  const toTile = (p: (typeof projects)[number]): GridProject => ({
    id: p.id,
    slug: p.slug,
    client: p.client,
    title: p.title,
    year: p.year,
    visible: p.visible,
    accentColor: p.accentColor,
    src: p.thumbUrl ?? p.coverUrl,
    focalX: p.thumbUrl ? p.thumbFocalX : p.coverFocalX,
    focalY: p.thumbUrl ? p.thumbFocalY : p.coverFocalY,
    zoom: p.thumbUrl ? p.thumbZoom : p.coverZoom,
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
        Each tile is the image and crop the homepage uses. Open one to set
        its accent colour, copy, page blocks and crops; &ldquo;View&nbsp;↗&rdquo;
        opens the live page.
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

      <ProjectGrid projects={projects.map(toTile)} />
    </div>
  );
}
