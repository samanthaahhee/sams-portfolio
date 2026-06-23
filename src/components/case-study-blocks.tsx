/**
 * Reusable inline blocks for bespoke case-study pages.
 *
 * These compose into longer-form, magazine-style layouts that the
 * generic CaseStudySections template can't represent. Each one is
 * intentionally minimal — type, rule, colour token — so it sits
 * inside the existing visual system without introducing new shapes.
 */

import type { ReactNode } from "react";

/* ── Section heading (numbered) ─────────────────────────────────── */

export function SectionHeading({
  no,
  children,
}: {
  no: string;
  children: ReactNode;
}) {
  return (
    <header className="mb-6 md:mb-8 flex items-baseline gap-4 md:gap-6">
      <span className="font-mono text-[color:var(--meta)]">
        {no.padStart(2, "0")}
      </span>
      <h2
        className="font-display text-3xl md:text-4xl lg:text-5xl"
        style={{ lineHeight: 1.05 }}
      >
        {children}
      </h2>
    </header>
  );
}

/* ── Pullquote ──────────────────────────────────────────────────── */

export function Pullquote({ children }: { children: ReactNode }) {
  return (
    <figure className="my-10 md:my-14 border-y border-[color:var(--rule)] py-8 md:py-10">
      <blockquote className="font-display text-[color:var(--ink)] leading-snug text-2xl md:text-3xl lg:text-4xl">
        <span
          aria-hidden
          className="font-mono text-[color:var(--meta)] mr-2 align-top"
        >
          “
        </span>
        {children}
      </blockquote>
    </figure>
  );
}

/* ── Highlight callout ──────────────────────────────────────────── */

export function Callout({
  label,
  children,
}: {
  /** Small uppercase label e.g. "The case I made". */
  label?: string;
  children: ReactNode;
}) {
  return (
    <aside className="my-8 md:my-12 rounded-md bg-[color:var(--paper-soft)] border border-[color:var(--rule)] p-6 md:p-8">
      {label && (
        <p className="font-mono uppercase tracking-[0.14em] text-[10px] text-[color:var(--meta)] mb-3">
          {label}
        </p>
      )}
      <div className="text-base md:text-lg leading-relaxed text-[color:var(--ink)]">
        {children}
      </div>
    </aside>
  );
}

/* ── Stats trio ─────────────────────────────────────────────────── */

export function Stats({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  return (
    <dl className="my-8 md:my-12 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 border-t border-b border-[color:var(--rule)] py-6 md:py-8">
      {items.map((s, i) => (
        <div key={`${s.value}-${i}`}>
          <dt className="font-display leading-none mb-2 text-3xl md:text-4xl lg:text-5xl">
            {s.value}
          </dt>
          <dd className="font-mono text-[color:var(--meta)] text-[11px] uppercase tracking-[0.12em]">
            {s.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ── Direction card (used in "Directions considered" sections) ──── */

export function DirectionCard({
  status,
  title,
  children,
}: {
  /** "Rejected" / "Chosen". Drives the meta line. */
  status: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="border-t border-[color:var(--rule)] pt-6 md:pt-8">
      <p className="font-mono uppercase tracking-[0.14em] text-[10px] text-[color:var(--meta)] mb-2">
        {status}
      </p>
      <h3
        className="font-display mb-3 text-2xl md:text-3xl"
        style={{ lineHeight: 1.1 }}
      >
        {title}
      </h3>
      <div className="text-base md:text-lg leading-relaxed text-[color:var(--ink-soft)]">
        {children}
      </div>
    </article>
  );
}

/* ── Body paragraph ─────────────────────────────────────────────── */

export function Body({ children }: { children: ReactNode }) {
  return (
    <p className="text-base md:text-xl leading-relaxed text-[color:var(--ink)] mb-4 last:mb-0">
      {children}
    </p>
  );
}

/* ── Section wrapper — left meta column + right content column ── */

export function Section({
  no,
  label,
  children,
}: {
  no: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <section
      id={`section-${no.padStart(2, "0")}`}
      className="px-[var(--spacing-page)] pt-20 md:pt-32 scroll-mt-20"
    >
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-3 md:col-start-2 mb-4 md:mb-0">
          <p className="font-mono text-[color:var(--meta)] sticky top-24">
            <span className="opacity-50 mr-3">
              {no.padStart(2, "0")}
            </span>
            <span className="uppercase tracking-[0.14em] text-[10px]">
              {label}
            </span>
          </p>
        </div>
        <div className="col-span-12 md:col-span-7 md:col-start-6">
          {children}
        </div>
      </div>
    </section>
  );
}
