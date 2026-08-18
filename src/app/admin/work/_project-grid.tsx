"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MediaBox } from "./_media-preview";

export type GridProject = {
  id: number;
  slug: string;
  client: string;
  title: string;
  year: string;
  visible: boolean;
  accentColor: string | null;
  /** Whatever the homepage tile shows, cropped the same way. */
  src: string | null;
  focalX: number;
  focalY: number;
  zoom: number;
};

/* One entry in the grid. The about panel sits in the same list as the
   projects because on the homepage it does too — it occupies a row in
   the flow, so ordering it separately from the work around it was always
   going to feel disconnected. */
type Item = { kind: "project"; project: GridProject } | { kind: "about" };

/* The homepage as an editable board.
 *
 * Two columns because the homepage is two-up, so what you drag is what
 * you get. Tiles reorder live under the cursor rather than only on drop,
 * which is what "drag into place" needs to feel like — the previous
 * version showed no sign of where a tile would land until you released
 * it, and the anchor inside each tile hijacked the drag as a link drag. */
export function ProjectGrid({
  projects,
  aboutAfterRows,
}: {
  projects: GridProject[];
  aboutAfterRows: number;
}) {
  const router = useRouter();

  const build = (list: GridProject[], rows: number): Item[] => {
    const items: Item[] = list.map((project) => ({ kind: "project", project }));
    const at = Math.max(0, Math.min(rows * 2, items.length));
    items.splice(at, 0, { kind: "about" });
    return items;
  };

  const [items, setItems] = useState<Item[]>(() => build(projects, aboutAfterRows));
  /* What to save. Reading `items` inside commit captured the array from
     the render the handler was created in — the order BEFORE the move —
     so every drag saved the old arrangement and the refresh put the tile
     straight back. A ref always holds the current one. */
  const itemsRef = useRef(items);
  /* Kept in step after any render — including the props-sync below, which
     may not go through apply(). Writing a ref during render is not
     allowed, so the mirror happens here. */
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  /** Only from event handlers, where touching a ref is fine. */
  const apply = (next: Item[]) => {
    itemsRef.current = next;
    setItems(next);
  };
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  /* Adjust to a fresh server list during render rather than in an effect. */
  const [seen, setSeen] = useState({ projects, aboutAfterRows });
  if (seen.projects !== projects || seen.aboutAfterRows !== aboutAfterRows) {
    setSeen({ projects, aboutAfterRows });
    setItems(build(projects, aboutAfterRows));
  }

  const aboutIndex = items.findIndex((i) => i.kind === "about");

  /** Reorder under the cursor. Nothing is saved until the drag ends. */
  function hoverOver(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...itemsRef.current];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    apply(next);
    setDragIndex(index);
  }

  async function commit() {
    setDragIndex(null);
    setSaving(true);
    setError(null);
    const current = itemsRef.current;
    const ids = current
      .filter((i): i is Extract<Item, { kind: "project" }> => i.kind === "project")
      .map((i) => i.project.id);
    /* The panel spans a whole row, so its slot is however many complete
       two-up rows of work sit above it. */
    const rows = Math.round(current.findIndex((i) => i.kind === "about") / 2);
    try {
      const [orderRes, aboutRes] = await Promise.all([
        fetch("/api/admin/work/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        }),
        rows === aboutAfterRows
          ? Promise.resolve(new Response(null, { status: 200 }))
          : fetch("/api/admin/homepage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ afterRows: rows }),
            }),
      ]);
      if (!orderRes.ok || !aboutRes.ok) {
        setError("Could not save the new order");
        apply(build(projects, aboutAfterRows));
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Could not save the new order");
      apply(build(projects, aboutAfterRows));
    } finally {
      setSaving(false);
    }
  }

  function nudge(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...itemsRef.current];
    [next[index], next[to]] = [next[to], next[index]];
    apply(next);
    setDragIndex(null);
    commit();
  }

  const dragProps = (index: number) => ({
    draggable: true,
    onDragStart: () => setDragIndex(index),
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      hoverOver(index);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      commit();
    },
    onDragEnd: () => commit(),
    style: { opacity: dragIndex === index ? 0.35 : 1, cursor: "grab" as const },
  });

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <p className="font-mono text-[color:var(--meta)]">
          Homepage grid · {projects.length} projects
          {saving && " · saving…"}
        </p>
        <p className="font-mono text-[color:var(--meta)] text-[10px]">
          Drag anything into place · ↑ ↓ also work
        </p>
      </div>

      {error && <p className="font-mono text-red-700 bg-red-50 px-3 py-2 rounded text-[11px]">{error}</p>}

      {/* Two columns, as the homepage is — the board is the page. */}
      <ul className="grid grid-cols-2 gap-4">
        {items.map((item, index) =>
          item.kind === "about" ? (
            <li
              key="about"
              {...dragProps(index)}
              className="col-span-2 rounded-sm border border-dashed p-4 flex items-center justify-between gap-4 flex-wrap"
              style={{ ...dragProps(index).style, borderColor: "var(--rule)", background: "#FCF9F9" }}
            >
              <span>
                <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-[color:var(--meta)] block">
                  About panel
                </span>
                <span className="font-mono text-[11px] text-[color:var(--meta)]">
                  {aboutIndex === 0
                    ? "above all projects"
                    : `after ${Math.round(aboutIndex / 2)} row${Math.round(aboutIndex / 2) === 1 ? "" : "s"}`}
                  {" · "}
                  <Link href="/admin/homepage" className="underline hover:text-[color:var(--ink)]">
                    edit its copy
                  </Link>
                </span>
              </span>
              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => nudge(index, -1)}
                  disabled={index === 0 || saving}
                  aria-label="Move up"
                  className="font-mono text-[11px] w-6 h-6 rounded-full border border-[color:var(--rule)] disabled:opacity-30 leading-none"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => nudge(index, 1)}
                  disabled={index === items.length - 1 || saving}
                  aria-label="Move down"
                  className="font-mono text-[11px] w-6 h-6 rounded-full border border-[color:var(--rule)] disabled:opacity-30 leading-none"
                >
                  ↓
                </button>
              </span>
            </li>
          ) : (
            <li
              key={item.project.id}
              {...dragProps(index)}
              className="rounded-sm border transition-colors"
              style={{ ...dragProps(index).style, borderColor: "var(--rule)" }}
            >
              {/* draggable={false} on the anchor: a link is draggable by
                  default, so grabbing a tile started a link drag instead
                  of a reorder. */}
              <Link
                href={`/admin/work/${item.project.id}`}
                draggable={false}
                className="block group"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-t-sm bg-[color:var(--paper-soft)] grid place-items-center">
                  {item.project.src ? (
                    <MediaBox
                      url={item.project.src}
                      draggable={false}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      style={{
                        objectPosition: `${item.project.focalX * 100}% ${item.project.focalY * 100}%`,
                        transform: item.project.zoom > 1 ? `scale(${item.project.zoom})` : undefined,
                        transformOrigin: `${item.project.focalX * 100}% ${item.project.focalY * 100}%`,
                      }}
                    />
                  ) : (
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--meta)]">
                      no image
                    </span>
                  )}
                </div>

                <div className="p-3 space-y-1">
                  <p className="font-mono text-[10px] text-[color:var(--meta)] truncate flex items-center gap-2">
                    {item.project.accentColor && (
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 rounded-full border shrink-0"
                        style={{ background: item.project.accentColor, borderColor: "var(--rule)" }}
                      />
                    )}
                    <span className="truncate">{item.project.client || "—"}</span>
                  </p>
                  <p className="truncate text-[13px] flex items-center gap-2">
                    {item.project.title}
                    {!item.project.visible && (
                      <span
                        className="font-mono uppercase tracking-[0.14em] text-[9px] px-1.5 py-0.5 rounded-full border shrink-0"
                        style={{ borderColor: "var(--rule)", color: "var(--meta)" }}
                      >
                        Hidden
                      </span>
                    )}
                  </p>
                </div>
              </Link>

              <div className="px-3 pb-3 flex items-center justify-between gap-2">
                <a
                  href={`/work/${item.project.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  draggable={false}
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--meta)] hover:text-[color:var(--ink)]"
                >
                  View ↗
                </a>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => nudge(index, -1)}
                    disabled={index === 0 || saving}
                    aria-label="Move earlier"
                    className="font-mono text-[11px] w-6 h-6 rounded-full border border-[color:var(--rule)] disabled:opacity-30 leading-none"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => nudge(index, 1)}
                    disabled={index === items.length - 1 || saving}
                    aria-label="Move later"
                    className="font-mono text-[11px] w-6 h-6 rounded-full border border-[color:var(--rule)] disabled:opacity-30 leading-none"
                  >
                    ↓
                  </button>
                </span>
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
