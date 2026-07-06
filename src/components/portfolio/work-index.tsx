"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Media } from "./media";
import type { PortfolioProject } from "@/lib/db-portfolio";

/* Placeholder covers — shown until real media is uploaded */
const PH_COVERS = [
  "https://picsum.photos/seed/walkrr-cover/1600/1120",
  "https://picsum.photos/seed/bos-cover/1600/1120",
  "https://picsum.photos/seed/temper-cover/1600/1120",
  "https://picsum.photos/seed/recharge-cover/1600/1120",
  "https://picsum.photos/seed/smallstitch-cover/1600/1120",
  "https://picsum.photos/seed/icetea-cover/1600/1120",
];

const PLACEHOLDER_PROJECTS: PortfolioProject[] = [
  { id: 0, slug: "walkrr", title: "Walkrr", discipline: "Brand Design", client: "Walkrr", role: "Brand Designer", year: "2023", orderIndex: 0, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[0], coverType: "image" },
  { id: 1, slug: "bos-ice-tea", title: "BOS Ice Tea", discipline: "360 Campaign", client: "BOS", role: "Art Director", year: "2022", orderIndex: 1, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[1], coverType: "image" },
  { id: 2, slug: "temper", title: "Temper", discipline: "Brand System", client: "Temper", role: "Product Designer", year: "2022", orderIndex: 2, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[2], coverType: "image" },
  { id: 3, slug: "recharge", title: "Recharge.com", discipline: "Art Direction", client: "Recharge.com", role: "Visual Designer", year: "2021", orderIndex: 3, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[3], coverType: "image" },
  { id: 4, slug: "small-stitch", title: "Small Stitch", discipline: "Brand Identity", client: "Small Stitch", role: "Brand Designer", year: "2023", orderIndex: 4, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[4], coverType: "image" },
];

const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

// Constant card WIDTH is what makes the infinite loop seamless (the strip width
// is predictable) and avoids horizontal jumps. Focus is shown by a taller image
// + full opacity — height grows upward (cards are bottom-aligned) so it never
// disturbs the horizontal scroll.
const CARD_W = 520;
const GAP = 24;
const PAD = 44;
const STEP = CARD_W + GAP;
const COPIES = 5; // repeated sets of the project list for the infinite wrap
const ACTIVE_IMG_H = "min(62vh, 560px)";
const PASSIVE_IMG_H = "min(44vh, 400px)";

export function WorkIndex({ projects }: { projects: PortfolioProject[] }) {
  const list = projects.length > 0 ? projects : PLACEHOLDER_PROJECTS;
  const n = list.length;
  const period = n * STEP; // pixel width of one full list — constant

  const scrollerRef = useRef<HTMLDivElement>(null);
  const target = useRef(0); // where we're easing scrollLeft toward
  const rafRef = useRef(0);
  const [activeGlobal, setActiveGlobal] = useState(Math.round((Math.floor(COPIES / 2) * period) / STEP));

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const mid = Math.floor(COPIES / 2) * period; // start in the middle copy
    el.scrollLeft = mid;
    target.current = mid;
    let lastActive = -1;

    const tick = () => {
      const cur = el.scrollLeft;
      let next = cur + (target.current - cur) * 0.14; // smooth easing
      if (Math.abs(target.current - next) < 0.3) next = target.current;
      el.scrollLeft = next;

      // Infinite wrap: content repeats every `period`, so shifting scrollLeft by
      // one period lands on identical pixels — seamless, no snap or realignment.
      if (el.scrollLeft < period * 2) { el.scrollLeft += period; target.current += period; }
      else if (el.scrollLeft > period * 3) { el.scrollLeft -= period; target.current -= period; }

      const ag = Math.round(el.scrollLeft / STEP);
      if (ag !== lastActive) { lastActive = ag; setActiveGlobal(ag); }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Any wheel — vertical or horizontal — drives the horizontal scroll.
    // When the gesture stops, softly settle to the nearest card so the focus
    // card lands flush-left (a gentle ease, not a mid-scroll snap-back).
    let settleTimer: ReturnType<typeof setTimeout>;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      target.current += d;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        target.current = Math.round(target.current / STEP) * STEP;
      }, 150);
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(settleTimer);
      el.removeEventListener("wheel", onWheel);
    };
  }, [period, n]);

  // Click a card → ease it to the focus position.
  function goTo(globalIndex: number) {
    target.current = globalIndex * STEP;
  }

  // Build COPIES repeated sets so the strip is always full as it wraps.
  const cards: { g: number; i: number; proj: PortfolioProject }[] = [];
  for (let c = 0; c < COPIES; c++) {
    for (let i = 0; i < n; i++) cards.push({ g: c * n + i, i, proj: list[i] });
  }

  return (
    <div style={{ height: "calc(100vh - 56px)", position: "relative", overflow: "hidden" }}>
      <style>{`.wk-carousel::-webkit-scrollbar{display:none}`}</style>

      {/* Mask the gutter so cards wrapping past the left edge don't peek */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: PAD, background: "#fff", zIndex: 2, pointerEvents: "none" }} />

      {/* Intro — floats in the top-right, beside the focus card */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: `${PAD + CARD_W + 48}px`,
          zIndex: 5,
          maxWidth: 540,
          pointerEvents: "none",
        }}
      >
        <h1 className="font-lore" style={{ fontSize: "clamp(2.4rem, 3.6vw, 3.4rem)", lineHeight: 1, color: "var(--ink)" }}>
          Thanks
        </h1>
        <p className="font-lore" style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.4rem)", lineHeight: 1.35, color: "#333", marginTop: 14 }}>
          for stopping by. here is a collection of work I&rsquo;m proud of.
        </p>
      </div>

      {/* Scroller (JS-driven) */}
      <div
        ref={scrollerRef}
        className="wk-carousel"
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: GAP,
          padding: `0 0 40px ${PAD}px`,
          height: "100%",
          overflowX: "scroll",
          overflowY: "hidden",
          scrollbarWidth: "none",
        }}
      >
        {cards.map(({ g, i, proj }) => {
          const isActive = g === activeGlobal;
          const cover = proj.coverUrl ?? PH_COVERS[i % PH_COVERS.length];
          const type = (proj.coverType ?? "image") as "image" | "gif" | "mp4";
          return (
            <div
              key={g}
              onClick={() => goTo(g)}
              style={{
                flexShrink: 0,
                width: CARD_W,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                cursor: "pointer",
                opacity: isActive ? 1 : 0.42,
                transition: `opacity 500ms ${EASE}`,
              }}
            >
              {/* Image — only the height changes with focus (grows upward) */}
              <div
                style={{
                  width: "100%",
                  borderRadius: 20,
                  overflow: "hidden",
                  position: "relative",
                  background: "#e9e7e2",
                  height: isActive ? ACTIVE_IMG_H : PASSIVE_IMG_H,
                  transition: `height 500ms ${EASE}`,
                }}
              >
                <Media src={cover} type={type} alt={proj.title} className="w-full h-full object-cover" />
              </div>

              {/* Meta */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "16px 4px 0", gap: 16 }}>
                <div style={{ minWidth: 0 }}>
                  <div
                    className="font-portfolio-sans"
                    style={{
                      fontSize: isActive ? 24 : 20,
                      fontWeight: 700,
                      color: "var(--ink)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.1,
                      transition: `font-size 400ms ${EASE}`,
                    }}
                  >
                    {proj.title}
                  </div>
                  <div className="font-portfolio-sans" style={{ fontSize: 14, color: "#888", marginTop: 3, whiteSpace: "nowrap" }}>
                    {proj.discipline}
                  </div>
                </div>
                <Link
                  href={`/work/${proj.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-portfolio-sans"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--ink)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  View project <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
