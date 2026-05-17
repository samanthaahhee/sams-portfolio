"use client";

import { useEffect, useRef, useState } from "react";
import type { ExperienceEntry } from "@/lib/about";

/**
 * Career roadmap — arc layout.
 *
 * Two-column card: a left column with an SVG arc + 8 year-range pills
 * positioned along it via polar-math CSS transforms, and a right column
 * with a stacked image + role detail. As the user scrolls vertically
 * through the section (sized to `count × 100vh`), the active milestone
 * advances from top to bottom of the arc.
 *
 * Visuals route through tokens — `--pair-a` resolves to the dusty pink
 * fill via the `data-pair="dustypink-ink"` wrapper on the about page.
 *
 * Adding a 9th entry to `about.experience` adds a 9th pill on the arc,
 * automatically redistributed via the `--total` and `--i` custom
 * properties.
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

  /* `--active-i` and `--total` drive the per-pill polar transform from
     CSS. Pills carry their own `--i`. */
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
          {/* ── LEFT — vertical track + pills ──────────────────── */}
          <div className="arc-col">
            {/* The CSS draws the 1px line and the active marker. */}
            <span aria-hidden className="arc-line" />
            {items.map((entry, i) => {
              const isActive = i === active;
              return (
                <button
                  key={`pill-${i}`}
                  type="button"
                  onClick={() => jumpTo(i)}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`${entry.company}, ${entry.dates}`}
                  className={`arc-pill${isActive ? " is-active" : ""}`}
                  style={{ ["--i" as string]: i } as React.CSSProperties}
                >
                  {entry.yearPill}
                </button>
              );
            })}
          </div>

          {/* ── RIGHT — image + detail ─────────────────────────── */}
          <div className="content-col">
            <div className="image-stage">
              {items.map((entry, i) => {
                const isActive = i === active;
                return (
                  <div
                    key={`img-${i}`}
                    className={`role-image${isActive ? " is-active" : ""}`}
                    aria-hidden={!isActive}
                  >
                    <div className="frame">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.image.src}
                        alt={entry.image.alt}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="detail-stage"
              role="region"
              aria-live="polite"
            >
              {items.map((entry, i) => {
                const isActive = i === active;
                return (
                  <div
                    key={`detail-${i}`}
                    className={`role-detail${isActive ? " is-active" : ""}`}
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
          </div>
        </article>
      </div>
    </section>
  );
}
