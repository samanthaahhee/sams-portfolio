"use client";

/**
 * Horizontal-tab navigator for long bespoke case-study bodies.
 *
 * Takes a `tabs` data array — each entry is `{ num, label, content }`
 * where content is any ReactNode (typically the inline blocks in
 * case-study-blocks.tsx).
 *
 * Renders as a tab strip + a single visible panel. No outer section,
 * padding, or grid — the parent positions the component inside its
 * own layout (e.g. the right column of a meta + body grid).
 *
 * All panels stay in the DOM as `hidden` so crawlers and screen
 * readers still see everything.
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
    <div>
      <nav
        aria-label="Case study sections"
        role="tablist"
        className="flex flex-wrap gap-1.5 mb-10 md:mb-14"
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
              className={`inline-flex items-baseline gap-2 px-3.5 py-2 rounded-full font-mono uppercase tracking-[0.12em] text-[10px] transition-colors border ${
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

      <div>
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
  );
}
