import Link from "next/link";
import { getExperience } from "@/lib/db";
import {
  DragReorderList,
  type DragItem,
} from "@/app/admin/_components/drag-reorder-list";

export default async function ExperienceList() {
  const items = await getExperience();

  const toItem = (e: (typeof items)[number]): DragItem => ({
    slug: e.slug,
    meta: e.yearPill,
    label: `${e.title} — ${e.company}`,
    secondary: e.dates,
    editHref: `/admin/experience/${e.slug}`,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[color:var(--meta)] mb-2">CV</p>
          <h1
            className="font-display text-4xl md:text-5xl"
            style={{ lineHeight: 0.95 }}
          >
            Experience
          </h1>
        </div>
        <Link
          href="/admin/experience/new"
          className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px]"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          + New role
        </Link>
      </div>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[color:var(--meta)]">
            All roles · {String(items.length).padStart(2, "0")}
          </p>
          <p className="font-mono text-[color:var(--meta)] text-[10px] hidden md:block">
            Drag rows to reorder · ↑ ↓ for touch
          </p>
        </div>
        {items.length === 0 ? (
          <p className="font-mono text-[color:var(--meta)] text-[11px] py-4">
            No experience entries yet — click + New role to add the first.
          </p>
        ) : (
          <DragReorderList
            items={items.map(toItem)}
            endpoint="/api/admin/experience/order"
          />
        )}
      </section>
    </div>
  );
}
