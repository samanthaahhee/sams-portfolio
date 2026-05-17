"use client";

import { useEffect, useRef, useState } from "react";
import type { ExperienceEntry } from "@/lib/about";

/**
 * Career roadmap — quiet vertical list.
 *
 * Two-column card: a narrow LEFT column with the year-range pills
 * stacked vertically along a thin track, and a wide RIGHT column with
 * the active role's H3 + paragraph + bullets. As the user scrolls
 * vertically through the section (sized to `count × 100vh`), the
 * active entry advances top-to-bottom.
 *
 * Visuals route through tokens; `--pair-a` resolves to dusty pink via
 * the `data-pair="dustypink-ink"` wrapper around the section.
 */
export function CareerRoadmap({ items }: { items: ExperienceEntry[] }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);

  const total = items.length;

  /* Scroll → active index. rAF-throttled. */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) {
          ticking = false;
          return;
        }
        const rect = section.getBoundingClientRect();
        const scrolled = -rect.top;
        const scrollable = section.offsetHeight - window.innerHeight;
        const progress = Math.max(0, Math.min(1, scrolled / scrollable));
        const next = Math.min(total - 1, Math.floor(progress * total));
        setActive(next);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [total]);

  /* Smooth scroll the page to a given milestone's section position. */
  function jumpTo(i: number) {
    const section = sectionRef.current;
    if (!section) return;
    const scrollable = section.offsetHeight - window.innerHeight;
    const target =
      section.offsetTop + (i / Math.max(total - 1, 1)) * scrollable;
    window.scrollTo({ top: target, behavior: "smooth" });
  }

  const cardStyle = {
    ["--active-i" as string]: String(active),
    ["--total" as string]: String(total),
  } as React.CSSProperties;

  return (
    <section
      ref={sectionRef}
      className="roadmap-section"
      aria-labelledby="roadmap-h"
      style={{ height: `${total * 100}vh` }}
    >
      <h2 id="roadmap-h" className="sr-only">
        Career roadmap
      </h2>
      <div className="roadmap-sticky">
        <article className="roadmap-card" style={cardStyle}>
          {/* ── LEFT — vertical timeline list ──────────────────── */}
          <div className="timeline-col">
            <div className="track">
              {items.map((entry, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={`entry-${i}`}
                    type="button"
                    onClick={() => jumpTo(i)}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`${entry.company}, ${entry.dates}`}
                    className={`entry${isActive ? " is-active" : ""}`}
                  >
                    {entry.yearPill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT — role detail ────────────────────────────── */}
          <div
            className="detail-col"
            role="region"
            aria-live="polite"
          >
            {items.map((entry, i) => {
              const isActive = i === active;
              return (
                <div
                  key={`detail-${i}`}
                  className={`detail${isActive ? " is-active" : ""}`}
                  hidden={!isActive}
                >
                  <h3>{entry.shortTitle}</h3>
                  <p className="body">{entry.description}</p>
                  <ul>
                    {entry.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
