"use client";

import { useEffect, useRef, useState } from "react";
import type { ExperienceEntry } from "@/lib/about";

/**
 * Scroll-driven horizontal timeline. The section is sized to
 * `count × 100vh` so each role gets one viewport of vertical scroll;
 * inside, the `.roadmap-sticky` wrapper pins the card while the active
 * milestone advances as the user scrolls. Each pill is a real button
 * so the timeline is keyboard navigable and click-to-jump-able.
 *
 * All visuals route through CSS variables. The component is intended
 * to be wrapped in `data-pair="coral-sage"` so `--pair-a` resolves to
 * the coral accent.
 *
 * Adding a 9th entry to `about.experience` adds a 9th milestone with
 * no other code change.
 */
export function CareerRoadmap({ items }: { items: ExperienceEntry[] }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const detailStageRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const total = items.length;

  /* ── Scroll → active index ────────────────────────────────────── */
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

  /* ── Position the active detail panel under the active pill,
       clamped to the stage's horizontal padding. Run on every active
       change AND on resize. ───────────────────────────────────────── */
  useEffect(() => {
    function reposition() {
      const stage = detailStageRef.current;
      const panel = panelRefs.current[active];
      if (!stage || !panel) return;
      const stageWidth = stage.clientWidth;
      const pillCenterX = (active + 0.5) * (stageWidth / total);
      let left = pillCenterX - panel.offsetWidth / 2;
      left = Math.max(0, Math.min(left, stageWidth - panel.offsetWidth));
      panel.style.left = `${left}px`;
    }
    reposition();
    window.addEventListener("resize", reposition);
    return () => window.removeEventListener("resize", reposition);
  }, [active, total]);

  /* ── Click-to-jump ────────────────────────────────────────────── */
  function jumpTo(i: number) {
    const section = sectionRef.current;
    if (!section) return;
    const scrollable = section.offsetHeight - window.innerHeight;
    const target =
      section.offsetTop + (i / Math.max(total - 1, 1)) * scrollable;
    window.scrollTo({ top: target, behavior: "smooth" });
  }

  /* `--active-i` and `--num-cols` drive the connector-line position
     and the per-image left calculation via CSS. Setting them on the
     card here keeps the markup declarative. */
  const cardStyle = {
    ["--active-i" as string]: String(active),
    ["--num-cols" as string]: String(total),
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
          {/* Image stage ─────────────────────────────────────────── */}
          <div className="roadmap-images" aria-hidden>
            {items.map((entry, i) => (
              <div
                key={`img-${i}`}
                className={`roadmap-image${i === active ? " is-active" : ""}`}
                style={{ ["--i" as string]: i } as React.CSSProperties}
              >
                <div className="roadmap-image-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.image.src}
                    alt={entry.image.alt}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Connector — coral vertical line + glow dot */}
          <span aria-hidden className="roadmap-connector" />

          {/* Track row — line + ticks + pills ────────────────────── */}
          <div className="roadmap-track">
            <span aria-hidden className="roadmap-track-line" />
            <div aria-hidden className="roadmap-ticks">
              {items.map((_, i) => (
                <span
                  key={`tick-${i}`}
                  className={`roadmap-tick${i === active ? " is-active" : ""}`}
                />
              ))}
            </div>
            <div className="roadmap-pills" role="tablist">
              {items.map((entry, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={`pill-${i}`}
                    type="button"
                    role="tab"
                    aria-current={isActive ? "step" : undefined}
                    aria-selected={isActive}
                    aria-label={`${entry.company}, ${entry.dates}`}
                    onClick={() => jumpTo(i)}
                    className={`roadmap-pill${isActive ? " is-active" : ""}`}
                  >
                    {entry.yearPill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail stage ────────────────────────────────────────── */}
          <div
            ref={detailStageRef}
            className="roadmap-details"
            role="region"
            aria-live="polite"
          >
            {items.map((entry, i) => {
              const isActive = i === active;
              return (
                <div
                  key={`detail-${i}`}
                  ref={(el) => {
                    panelRefs.current[i] = el;
                  }}
                  className={`roadmap-detail${isActive ? " is-active" : ""}`}
                  hidden={!isActive}
                >
                  <h3>{entry.shortTitle}</h3>
                  <p className="roadmap-detail-body">{entry.description}</p>
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
