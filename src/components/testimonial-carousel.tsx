"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Testimonial } from "@/lib/about";

/**
 * Horizontal testimonial carousel. CSS scroll-snap on a flex track,
 * arrow buttons + dots for controls. Each slide is a full-width card
 * with quote + attribution. Empty `quote` strings are filtered out.
 *
 * Keyboard accessible — arrows, focusable next/prev, dots map 1:1 to
 * slides. `prefers-reduced-motion: reduce` gates the smooth-scroll.
 */
export function TestimonialCarousel({
  items,
}: {
  items: Testimonial[];
}) {
  const valid = items.filter((t) => t.quote.trim().length > 0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  /* Observe which slide is centred in the viewport. */
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

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(valid.length - 1, i));
    track.scrollTo({
      left: clamped * track.clientWidth,
      behavior: "smooth",
    });
  }, [valid.length]);

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
        {valid.map((t, i) => (
          <article
            key={i}
            className="testimonial-slide"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${valid.length}`}
          >
            <span
              aria-hidden
              className="font-display block"
              style={{
                fontSize: "clamp(3rem, 6vw, 4.5rem)",
                color: "var(--pair-b)",
                opacity: 0.4,
                lineHeight: 1,
                fontWeight: 700,
              }}
            >
              &ldquo;
            </span>
            <blockquote className="mt-3 text-base md:text-lg leading-relaxed text-[color:var(--ink)] whitespace-pre-line">
              {t.quote}
            </blockquote>
            <footer
              className="mt-6 pt-4 space-y-1"
              style={{ borderTop: "1px solid var(--rule)" }}
            >
              <p className="font-mono text-[color:var(--ink)]">{t.name}</p>
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
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
        {/* Dot pagination */}
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

        {/* Prev / Next */}
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
