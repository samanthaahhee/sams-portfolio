"use client";

import { useState } from "react";
import type { Testimonial } from "@/lib/about";

const COLLAPSED_LINES = 6;
const LINKEDIN_RECS_URL =
  "https://www.linkedin.com/in/samanthaahhee/details/recommendations/";

/**
 * Testimonials in a 2×2 grid (single column on mobile). Each card
 * clamps its quote to a fixed line count with an inline Read more /
 * Show less toggle so all cards present the same visual footprint
 * regardless of recommendation length. A "Read full on LinkedIn" link
 * points out to the source profile.
 */
export function TestimonialsGrid({ items }: { items: Testimonial[] }) {
  const valid = items.filter((t) => t.quote.trim().length > 0);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  if (valid.length === 0) return null;

  return (
    <section
      aria-label="Recommendations"
      className="px-[var(--spacing-page)] py-20 md:py-28"
    >
      <div className="max-w-2xl mb-10 md:mb-14">
        <p className="font-mono text-[color:var(--meta)] mb-4">
          What others say
        </p>
        <h2
          className="font-display"
          style={{ fontSize: "var(--text-d3)", lineHeight: 1.0 }}
        >
          Voices from the work.
        </h2>
      </div>

      <div
        role="list"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
      >
        {valid.map((t, i) => {
          const isOpen = expanded.has(i);
          return (
            <article
              key={i}
              role="listitem"
              className="testimonial-card"
            >
              <span aria-hidden className="testimonial-quote-mark">
                &ldquo;
              </span>

              <blockquote
                className={`testimonial-quote${isOpen ? " is-open" : ""}`}
                style={
                  isOpen
                    ? undefined
                    : ({
                        ["--clamp-lines" as string]: COLLAPSED_LINES,
                      } as React.CSSProperties)
                }
              >
                {t.quote}
              </blockquote>

              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="testimonial-toggle"
              >
                {isOpen ? "Show less ↑" : "Read more ↓"}
              </button>

              <footer className="testimonial-attrib">
                <p className="font-mono text-[color:var(--ink)]">{t.name}</p>
                <p className="font-mono text-[color:var(--meta)]">{t.role}</p>
                {(t.relationship || t.date) && (
                  <p className="font-mono text-[color:var(--meta)] text-[10px] uppercase tracking-[0.14em]">
                    {[t.relationship, t.date].filter(Boolean).join(" · ")}
                  </p>
                )}
                <a
                  href={LINKEDIN_RECS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] transition-colors"
                >
                  Read full on LinkedIn ↗
                </a>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
