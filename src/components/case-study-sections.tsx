"use client";

import { useState, useMemo } from "react";

type Decision = { title: string; body: string };

type Props = {
  context: string;
  problem: string;
  approach: string;
  decisions: Decision[];
  outcome: string;
  reflection: string;
};

const ALL_SECTIONS = [
  "Context",
  "Problem",
  "Approach",
  "Decisions",
  "Outcome",
  "Reflection",
] as const;
type SectionLabel = (typeof ALL_SECTIONS)[number];

/**
 * Tabbed case study body sections. Empty sections are skipped entirely
 * — only tabs with real content render. All visible panels remain in
 * the DOM so screen readers + crawlers see everything; only the active
 * panel is visually shown via the `hidden` attribute.
 */
export function CaseStudySections({
  context,
  problem,
  approach,
  decisions,
  outcome,
  reflection,
}: Props) {
  const sections = useMemo(() => {
    const present: { label: SectionLabel; content: React.ReactNode }[] = [];
    if (context?.trim()) present.push({ label: "Context", content: <Body>{context}</Body> });
    if (problem?.trim()) present.push({ label: "Problem", content: <Body>{problem}</Body> });
    if (approach?.trim()) present.push({ label: "Approach", content: <Body>{approach}</Body> });
    if (decisions && decisions.length > 0) {
      present.push({
        label: "Decisions",
        content: <DecisionsList decisions={decisions} />,
      });
    }
    if (outcome?.trim()) present.push({ label: "Outcome", content: <Body>{outcome}</Body> });
    if (reflection?.trim()) present.push({ label: "Reflection", content: <Body>{reflection}</Body> });
    return present;
  }, [context, problem, approach, decisions, outcome, reflection]);

  const [active, setActive] = useState<SectionLabel | null>(
    sections[0]?.label ?? null,
  );

  // If the currently-active label has been removed (e.g. content cleared),
  // fall back to the first available section.
  const activeOrFallback =
    sections.find((s) => s.label === active)?.label ?? sections[0]?.label;

  if (sections.length === 0) return null;

  return (
    <section className="px-[var(--spacing-page)] pt-16 md:pt-24">
      <div className="grid grid-cols-12 gap-4">
        {/* Tab strip — left column on desktop, top row on mobile */}
        <nav
          aria-label="Case study sections"
          className="col-span-12 md:col-span-3 md:col-start-2 mb-6 md:mb-0"
        >
          <p className="font-mono text-[color:var(--meta)] mb-3">Sections</p>
          <ul
            className="flex flex-wrap md:flex-col gap-1.5 md:gap-0"
            role="tablist"
          >
            {sections.map(({ label }, i) => {
              const isActive = activeOrFallback === label;
              return (
                <li key={label}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(label)}
                    className={`group w-full text-left font-mono uppercase tracking-[0.14em] py-1.5 md:py-2 px-3 md:px-0 rounded-full md:rounded-none border md:border-0 md:border-l-2 transition-colors ${
                      isActive
                        ? "border-[color:var(--ink)] md:border-l-[color:var(--ink)] bg-[color:var(--ink)] md:bg-transparent text-[color:var(--paper)] md:text-[color:var(--ink)]"
                        : "border-[color:var(--rule)] md:border-l-[color:var(--rule)] text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] hover:border-[color:var(--ink-soft)] md:hover:border-l-[color:var(--ink-soft)]"
                    }`}
                    style={{ fontSize: "11px" }}
                  >
                    <span className="md:flex md:items-baseline md:gap-3 md:pl-3">
                      <span className="hidden md:inline opacity-50 group-aria-selected:opacity-100 transition-opacity">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{label}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Active panel */}
        <div className="col-span-12 md:col-span-6 md:col-start-6">
          {sections.map(({ label, content }) => (
            <div
              key={label}
              role="tabpanel"
              aria-labelledby={label}
              hidden={activeOrFallback !== label}
            >
              {content}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base md:text-xl leading-relaxed text-[color:var(--ink)]">
      {children}
    </p>
  );
}

function DecisionsList({ decisions }: { decisions: Decision[] }) {
  return (
    <div className="space-y-12">
      {decisions.map((d, i) => (
        <article
          key={d.title + i}
          className="border-t border-[color:var(--rule)] pt-6"
        >
          <div className="flex items-baseline gap-6 mb-3">
            <span className="font-mono text-[color:var(--meta)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-2xl md:text-3xl">{d.title}</h3>
          </div>
          {d.body?.trim() && (
            <p className="text-[color:var(--ink-soft)] text-base md:text-lg leading-relaxed md:pl-12">
              {d.body}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
