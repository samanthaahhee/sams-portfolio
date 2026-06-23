"use client";

/**
 * Horizontal-tab navigator for long bespoke case-study bodies.
 *
 * Pattern: `<SectionTabs>` accepts any number of `<SectionTab num … label …>`
 * children. The parent reads their props to build the tab strip; only
 * the active panel is visually shown (the rest stay in the DOM as
 * `hidden`, so crawlers and screen readers still see everything).
 *
 * The tab strip is sticky just below the site header so visitors can
 * jump between sections without scrolling back up.
 */

import {
  Children,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

type TabProps = {
  /** Two-digit section number, e.g. "01". */
  num: string;
  label: string;
  children: ReactNode;
};

/** Data carrier — never renders directly. Picked up by SectionTabs. */
export function SectionTab(_: TabProps): null {
  return null;
}

export function SectionTabs({ children }: { children: ReactNode }) {
  const tabs: TabProps[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === SectionTab) {
      tabs.push((child as ReactElement<TabProps>).props);
    }
  });

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
            className="flex gap-1 overflow-x-auto -mx-1 px-1 py-3 scrollbar-none"
          >
            {tabs.map((t, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={t.num + t.label}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  className={`shrink-0 inline-flex items-baseline gap-2 px-3 py-1.5 rounded-full font-mono uppercase tracking-[0.12em] text-[10px] transition-colors border ${
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
                key={t.num + t.label}
                role="tabpanel"
                aria-labelledby={`${t.num}-${t.label}`}
                hidden={i !== activeIndex}
              >
                {t.children}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
