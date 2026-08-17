"use client";

import { useState, useTransition } from "react";
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

/* The project list as tiles rather than rows — for a portfolio, the
 * picture is the identifier, and a column of text made you open pages to
 * find the one you meant.
 *
 * Each tile is the homepage's own crop at the homepage's own 4:3, so
 * this doubles as a check on how the grid currently reads. Drag to
 * reorder, or use the arrows; both write through the same endpoint the
 * row list used. */
export function ProjectGrid({ projects }: { projects: GridProject[] }) {
  const router = useRouter();
  const [order, setOrder] = useState(projects);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  /* Adjust to a fresh server list during render rather than in an effect —
     an effect here would render the stale order first, then re-render. */
  const [seen, setSeen] = useState(projects);
  if (seen !== projects) {
    setSeen(projects);
    setOrder(projects);
  }

  async function persist(next: GridProject[]) {
    setSaving(true);
    setError(null);
    const previous = order;
    setOrder(next);
    try {
      const res = await fetch("/api/admin/work/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((p) => p.id) }),
      });
      if (!res.ok) {
        setOrder(previous);
        setError("Reorder failed");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setOrder(previous);
      setError("Reorder failed");
    } finally {
      setSaving(false);
    }
  }

  function move(id: number, dir: -1 | 1) {
    const i = order.findIndex((p) => p.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
  }

  function drop(targetId: number) {
    if (dragId === null || dragId === targetId) return;
    const from = order.findIndex((p) => p.id === dragId);
    const to = order.findIndex((p) => p.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setDragId(null);
    setOverId(null);
    persist(next);
  }

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <p className="font-mono text-[color:var(--meta)]">
          Projects · {String(order.length).padStart(2, "0")}
          {saving && " · saving…"}
        </p>
        <p className="font-mono text-[color:var(--meta)] text-[10px] hidden md:block">
          Drag a tile to reorder · ← → for touch
        </p>
      </div>

      {error && <p className="font-mono text-red-700 bg-red-50 px-3 py-2 rounded text-[11px]">{error}</p>}

      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {order.map((p, i) => (
          <li
            key={p.id}
            draggable
            onDragStart={() => setDragId(p.id)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverId(p.id);
            }}
            onDragLeave={() => setOverId((v) => (v === p.id ? null : v))}
            onDrop={() => drop(p.id)}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
            className="rounded-sm border transition-colors"
            style={{
              borderColor: overId === p.id ? "var(--ink)" : "var(--rule)",
              opacity: dragId === p.id ? 0.4 : 1,
            }}
          >
            <Link href={`/admin/work/${p.id}`} className="block group">
              <div className="aspect-[4/3] overflow-hidden rounded-t-sm bg-[color:var(--paper-soft)] grid place-items-center">
                {p.src ? (
                  <MediaBox
                    url={p.src}
                    draggable={false}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    style={{
                      objectPosition: `${p.focalX * 100}% ${p.focalY * 100}%`,
                      transform: p.zoom > 1 ? `scale(${p.zoom})` : undefined,
                      transformOrigin: `${p.focalX * 100}% ${p.focalY * 100}%`,
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
                  {p.accentColor && (
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 rounded-full border shrink-0"
                      style={{ background: p.accentColor, borderColor: "var(--rule)" }}
                    />
                  )}
                  <span className="truncate">{p.client || "—"}</span>
                </p>
                <p className="truncate text-[13px] flex items-center gap-2">
                  {p.title}
                  {!p.visible && (
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
                href={`/work/${p.slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--meta)] hover:text-[color:var(--ink)]"
              >
                View ↗
              </a>
              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(p.id, -1)}
                  disabled={i === 0 || saving}
                  aria-label="Move earlier"
                  className="font-mono text-[11px] w-6 h-6 rounded-full border border-[color:var(--rule)] disabled:opacity-30 leading-none"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(p.id, 1)}
                  disabled={i === order.length - 1 || saving}
                  aria-label="Move later"
                  className="font-mono text-[11px] w-6 h-6 rounded-full border border-[color:var(--rule)] disabled:opacity-30 leading-none"
                >
                  →
                </button>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
