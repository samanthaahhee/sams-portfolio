"use client";

/**
 * Horizontal-tab navigator for long bespoke case-study bodies.
 *
 * Takes a `tabs` data array — each entry is `{ num, label, content }`
 * where content is any ReactNode (typically the inline blocks in
 * case-study-blocks.tsx). The tab strip is sticky just below the
 * site header so visitors can jump between sections without
 * scrolling back up. Only the active panel is visually shown; the
 * rest stay in the DOM as `hidden` so crawlers and screen readers
 * still see everything.
 *
 * Why data-prop and not a compound `<SectionTabs><SectionTab>...`
 * pattern? Compound components rely on `child.type === Foo` checks
 * to find their slots — those identity comparisons don't always
 * survive the Next.js Server→Client component boundary. A plain
 * data array does.
 */

import { useState, type ReactNode } from "react";

export type Tab = {
  /** Two-digit section number, e.g. "01". */
  num: string;
  label: string;
  content: ReactNode;
};

export function SectionTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  if (tabs.length === 0) return null;
  const activeIndex = Math.min(active, tabs.length - 1);

  return (
    <section className="pt-12 md:pt-16">
      {/* ── Sticky tab strip ─────────────────────────────────────── */}
      <div
        className="sticky z-30 bg-[color:var(--paper)]/95 backdrop-blur border-y border-[color:var(--rule)]"
        style={{ top: 56 }}
      >
        <div className="px-[var(--spacing-page)]">
          <nav
            aria-label="Case study sections"
            role="tablist"
            className="flex gap-1.5 overflow-x-auto -mx-1 px-1 py-3"
            style={{ scrollbarWidth: "none" }}
          >
            {tabs.map((t, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={`${t.num}-${t.label}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  className={`shrink-0 inline-flex items-baseline gap-2 px-3.5 py-2 rounded-full font-mono uppercase tracking-[0.12em] text-[10px] transition-colors border ${
                    isActive
                      ? "bg-[color:var(--ink)] text-[color:var(--paper)] border-[color:var(--ink)]"
                      : "text-[color:var(--ink-soft)] border-[color:var(--rule)] hover:border-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
                  }`}
                >
                  <span className="opacity-60">{t.num}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Panels ────────────────────────────────────────────────── */}
      <div className="px-[var(--spacing-page)] pt-12 md:pt-16">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-8 md:col-start-3">
            {tabs.map((t, i) => (
              <div
                key={`${t.num}-${t.label}`}
                role="tabpanel"
                aria-labelledby={`${t.num}-${t.label}`}
                hidden={i !== activeIndex}
              >
                {t.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
