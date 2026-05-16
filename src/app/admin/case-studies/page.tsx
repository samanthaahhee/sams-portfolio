import Link from "next/link";
import { getAllCaseStudies } from "@/lib/db";
import {
  DragReorderList,
  type DragItem,
} from "@/app/admin/_components/drag-reorder-list";

export default async function CaseStudiesList() {
  const studies = await getAllCaseStudies();
  const published = studies.filter((c) => c.published !== false);
  const drafts = studies.filter((c) => c.published === false);

  const toItem = (c: (typeof studies)[number]): DragItem => ({
    slug: c.slug,
    meta: `No. ${c.no}`,
    label: c.title,
    secondary: c.client,
    editHref: `/admin/case-studies/${c.slug}`,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[color:var(--meta)] mb-2">
            Selected Work
          </p>
          <h1
            className="font-display text-4xl md:text-5xl"
            style={{ lineHeight: 0.95 }}
          >
            Case studies
          </h1>
        </div>
        <Link
          href="/admin/case-studies/new"
          className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px]"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          + New case study
        </Link>
      </div>

      {/* ── Published — drag-and-drop reorderable ────────────────── */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[color:var(--meta)]">
            Published · {String(published.length).padStart(2, "0")}
          </p>
          <p className="font-mono text-[color:var(--meta)] text-[10px] hidden md:block">
            Drag rows to reorder · ↑ ↓ for touch
          </p>
        </div>
        {published.length === 0 ? (
          <p className="font-mono text-[color:var(--meta)] text-[11px] py-4">
            No published case studies yet.
          </p>
        ) : (
          <DragReorderList
            items={published.map(toItem)}
            endpoint="/api/admin/case-studies/order"
          />
        )}
      </section>

      {/* ── Drafts — separate, not reorderable ────────────────────── */}
      {drafts.length > 0 && (
        <section className="space-y-3">
          <p className="font-mono text-[color:var(--meta)]">
            Drafts · {String(drafts.length).padStart(2, "0")}
          </p>
          <ul className="border-t border-[color:var(--rule)]">
            {drafts.map((c) => (
              <li
                key={c.slug}
                className="border-b border-[color:var(--rule)] py-3 flex items-center justify-between gap-4"
              >
                <Link
                  href={`/admin/case-studies/${c.slug}`}
                  className="flex items-baseline gap-4 flex-1 min-w-0 hover:opacity-70"
                >
                  <span className="font-mono text-[color:var(--meta)] w-12 shrink-0">
                    No. {c.no}
                  </span>
                  <span className="truncate flex items-center gap-2">
                    {c.title}
                    <span
                      className="font-mono uppercase tracking-[0.14em] text-[9px] px-2 py-0.5 rounded-full border"
                      style={{
                        borderColor: "var(--rule)",
                        color: "var(--meta)",
                      }}
                    >
                      Draft
                    </span>
                  </span>
                </Link>
                <span className="font-mono text-[color:var(--meta)] hidden md:inline shrink-0">
                  {c.client}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
