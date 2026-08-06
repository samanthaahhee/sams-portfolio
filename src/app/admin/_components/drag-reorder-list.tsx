"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export type DragItem = {
  slug: string;
  /** Left-hand label (e.g. brand or "No. 01"). */
  meta: string;
  /** Primary label (project title or case study title). */
  label: string;
  /** Right-hand secondary label (tag list / client). */
  secondary?: string;
  /** Detail page in the admin (where the row link goes). */
  editHref: string;
  /** Optional public URL — rendered as a "View ↗" link so the editor can
   *  jump straight to the live page. */
  viewHref?: string;
};

/**
 * Drag-and-drop reorderable list. Drag a row by the handle to a new
 * position; on drop, the new order is POSTed to `endpoint` as
 * `{ slugs: string[] }`. Optimistic local state keeps the UI snappy.
 *
 * The endpoint is also called by mobile-friendly ↑ / ↓ arrow buttons,
 * since native HTML drag-and-drop doesn't work on touch devices.
 */
export function DragReorderList({
  items,
  endpoint,
}: {
  items: DragItem[];
  endpoint: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [order, setOrder] = useState(items);
  const [draggedSlug, setDraggedSlug] = useState<string | null>(null);
  const [overSlug, setOverSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Sync if the server-side list changes (e.g. another tab edited). */
  useEffect(() => {
    setOrder(items);
  }, [items]);

  async function persist(next: DragItem[]) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: next.map((i) => i.slug) }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Reorder failed");
        // Revert
        setOrder(items);
        return;
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reorder failed");
      setOrder(items);
    } finally {
      setSaving(false);
    }
  }

  function move(slug: string, dir: -1 | 1) {
    const idx = order.findIndex((i) => i.slug === slug);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= order.length) return;
    const next = [...order];
    [next[idx], next[j]] = [next[j], next[idx]];
    setOrder(next);
    void persist(next);
  }

  function onDragStart(e: React.DragEvent, slug: string) {
    setDraggedSlug(slug);
    e.dataTransfer.effectAllowed = "move";
    /* Firefox needs some payload set on the dataTransfer object or the
     * drag never starts. The slug is fine. */
    e.dataTransfer.setData("text/plain", slug);
  }

  function onDragOver(e: React.DragEvent, slug: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (slug !== overSlug) setOverSlug(slug);
  }

  function onDrop(e: React.DragEvent, targetSlug: string) {
    e.preventDefault();
    const src = draggedSlug;
    setDraggedSlug(null);
    setOverSlug(null);
    if (!src || src === targetSlug) return;
    const from = order.findIndex((i) => i.slug === src);
    const to = order.findIndex((i) => i.slug === targetSlug);
    if (from < 0 || to < 0) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setOrder(next);
    void persist(next);
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="font-mono text-red-700 bg-red-50 px-3 py-2 rounded text-[11px]">
          {error}
        </p>
      )}
      <ul className="border-t border-[color:var(--rule)]">
        {order.map((item, i) => {
          const isDragging = draggedSlug === item.slug;
          const isOver = overSlug === item.slug && draggedSlug !== item.slug;
          return (
            <li
              key={item.slug}
              draggable
              onDragStart={(e) => onDragStart(e, item.slug)}
              onDragOver={(e) => onDragOver(e, item.slug)}
              onDragLeave={() =>
                overSlug === item.slug && setOverSlug(null)
              }
              onDrop={(e) => onDrop(e, item.slug)}
              onDragEnd={() => {
                setDraggedSlug(null);
                setOverSlug(null);
              }}
              className={`border-b border-[color:var(--rule)] py-3 flex items-center justify-between gap-4 transition-colors ${
                isDragging ? "opacity-40" : ""
              } ${isOver ? "bg-[color:var(--rule)]/30" : ""}`}
              style={{ cursor: saving ? "wait" : "default" }}
            >
              {/* Drag handle (visible on desktop only; touch users use
                  the arrows). */}
              <span
                aria-hidden
                className="hidden md:inline font-mono text-[color:var(--meta)] cursor-grab active:cursor-grabbing select-none"
                style={{ lineHeight: 1 }}
              >
                ⋮⋮
              </span>

              <Link
                href={item.editHref}
                className="flex items-baseline gap-4 flex-1 min-w-0 hover:opacity-70"
              >
                <span className="font-mono text-[color:var(--meta)] w-8 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[color:var(--meta)] w-32 shrink-0 truncate">
                  {item.meta}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>

              <div className="flex items-center gap-3 shrink-0">
                {item.secondary && (
                  <span className="font-mono text-[color:var(--meta)] hidden md:inline">
                    {item.secondary}
                  </span>
                )}
                {item.viewHref && (
                  <a
                    href={item.viewHref}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[color:var(--meta)] text-[10px] uppercase tracking-[0.14em] hover:text-[color:var(--ink)]"
                  >
                    View ↗
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => move(item.slug, -1)}
                  disabled={i === 0 || saving}
                  aria-label="Move up"
                  className="font-mono text-[12px] w-7 h-7 rounded-full border border-[color:var(--rule)] disabled:opacity-30 hover:border-[color:var(--ink)] transition-colors leading-none"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(item.slug, +1)}
                  disabled={i === order.length - 1 || saving}
                  aria-label="Move down"
                  className="font-mono text-[12px] w-7 h-7 rounded-full border border-[color:var(--rule)] disabled:opacity-30 hover:border-[color:var(--ink)] transition-colors leading-none"
                >
                  ↓
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {saving && (
        <p className="font-mono text-[color:var(--meta)] text-[10px]">
          Saving order…
        </p>
      )}
    </div>
  );
}
