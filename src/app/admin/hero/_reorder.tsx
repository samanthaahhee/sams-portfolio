"use client";

import { useState } from "react";
import Link from "next/link";
import type { HeroCard } from "@/lib/db";

export function HeroCardsReorder({ initial }: { initial: HeroCard[] }) {
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persist(next: HeroCard[]) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/hero/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((i) => i.id) }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Reorder failed");
    } finally {
      setSaving(false);
    }
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    void persist(next);
  }

  return (
    <div className="space-y-3">
      <ul className="border-t border-[color:var(--rule)]">
        {items.map((c, i) => (
          <li
            key={c.id}
            className="border-b border-[color:var(--rule)] py-3 flex items-center gap-4"
          >
            <Link
              href={`/admin/hero/${c.id}`}
              className="flex items-center gap-4 flex-1 min-w-0 hover:text-[color:var(--ink)]"
            >
              <div
                className="relative shrink-0 rounded-sm overflow-hidden"
                style={{ width: 96, height: 72, background: "#0a0506" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.imageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-display text-lg">{c.title}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--meta)] truncate">
                  {c.client ?? "—"} · {c.href}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {c.accentColor && (
                  <span
                    title={`Accent ${c.accentColor}`}
                    className="w-4 h-4 rounded-full border border-[color:var(--rule)]"
                    style={{ background: c.accentColor }}
                  />
                )}
                {c.bgColor && (
                  <span
                    title={`BG ${c.bgColor}`}
                    className="w-4 h-4 rounded-full border border-[color:var(--rule)]"
                    style={{ background: c.bgColor }}
                  />
                )}
              </div>
            </Link>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0 || saving}
                aria-label="Move up"
                className="font-mono w-7 h-7 rounded-full border border-[color:var(--rule)] disabled:opacity-30 hover:border-[color:var(--ink)] leading-none"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, +1)}
                disabled={i === items.length - 1 || saving}
                aria-label="Move down"
                className="font-mono w-7 h-7 rounded-full border border-[color:var(--rule)] disabled:opacity-30 hover:border-[color:var(--ink)] leading-none"
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error && (
        <p className="text-xs text-red-700 font-mono">{error}</p>
      )}
    </div>
  );
}
