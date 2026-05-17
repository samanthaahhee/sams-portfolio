"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Testimonial } from "@/lib/about";

const COLLAPSED_LINES = 6;

/**
 * Horizontal testimonial carousel. Each slide is a uniform-height card
 * with a clamped quote and a "Read more" toggle, so long and short
 * recommendations occupy the same visual footprint until the user
 * expands one. CSS scroll-snap on the track; arrow + dot controls.
 *
 * `prefers-reduced-motion: reduce` strips the smooth-scroll.
 */
export function TestimonialCarousel({
  items,
}: {
  items: Testimonial[];
}) {
  const valid = items.filter((t) => t.quote.trim().length > 0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  /* Track scroll position → active dot. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const { scrollLeft, clientWidth } = track;
        const i = Math.round(scrollLeft / clientWidth);
        setActive((prev) => (prev !== i ? i : prev));
        ticking = false;
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(valid.length - 1, i));
      track.scrollTo({
        left: clamped * track.clientWidth,
        behavior: "smooth",
      });
    },
    [valid.length],
  );

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
      className="relative px-[var(--spacing-page)] py-16 md:py-24"
    >
      <div className="max-w-2xl mb-8 md:mb-10">
        <p
          className="font-display"
          style={{ fontSize: "var(--text-d3)", lineHeight: 1.0 }}
        >
          What others say.
        </p>
        <p className="mt-4 md:mt-5 text-base md:text-lg leading-relaxed text-[color:var(--ink-soft)]">
          A few words from people I’ve worked with — directly pulled
          from LinkedIn recommendations.
        </p>
      </div>

      <div
        ref={trackRef}
        className="testimonial-track"
        role="region"
        aria-roledescription="carousel"
        aria-live="polite"
      >
        {valid.map((t, i) => {
          const isOpen = expanded.has(i);
          return (
            <div
              key={i}
              className="testimonial-slide"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${valid.length}`}
            >
              <article className="testimonial-card">
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
                  <p className="font-mono text-[color:var(--ink)]">
                    {t.name}
                  </p>
                  <p className="font-mono text-[color:var(--meta)]">
                    {t.role}
                  </p>
                  {(t.relationship || t.date) && (
                    <p className="font-mono text-[color:var(--meta)] text-[10px] uppercase tracking-[0.14em]">
                      {[t.relationship, t.date].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </footer>
              </article>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
        <ol
          className="flex items-center gap-2"
          aria-label="Carousel position"
        >
          {valid.map((_, i) => {
            const isActive = i === active;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => scrollTo(i)}
                  aria-label={`Show recommendation ${i + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className="block rounded-full transition-all"
                  style={{
                    width: isActive ? 20 : 8,
                    height: 8,
                    background: isActive
                      ? "var(--ink)"
                      : "var(--rule-strong)",
                  }}
                />
              </li>
            );
          })}
        </ol>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollTo(active - 1)}
            disabled={active === 0}
            aria-label="Previous recommendation"
            className="w-9 h-9 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] disabled:opacity-30 transition-colors flex items-center justify-center"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollTo(active + 1)}
            disabled={active === valid.length - 1}
            aria-label="Next recommendation"
            className="w-9 h-9 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] disabled:opacity-30 transition-colors flex items-center justify-center"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
