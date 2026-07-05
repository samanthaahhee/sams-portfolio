"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Media } from "./media";
import type { PortfolioProject } from "@/lib/db-portfolio";

/* Placeholder covers — shown until real media is uploaded */
const PH_COVERS = [
  "https://picsum.photos/seed/walkrr-cover/1520/1120",
  "https://picsum.photos/seed/bos-cover/1520/1120",
  "https://picsum.photos/seed/temper-cover/1520/1120",
  "https://picsum.photos/seed/recharge-cover/1520/1120",
  "https://picsum.photos/seed/smallstitch-cover/1520/1120",
  "https://picsum.photos/seed/icetea-cover/1520/1120",
];

const PLACEHOLDER_PROJECTS: PortfolioProject[] = [
  { id: 0, slug: "walkrr", title: "Walkrr", discipline: "Brand Design", client: "Walkrr", role: "Brand Designer", year: "2023", orderIndex: 0, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[0], coverType: "image" },
  { id: 1, slug: "bos-ice-tea", title: "BOS Ice Tea", discipline: "360 Campaign", client: "BOS", role: "Art Director", year: "2022", orderIndex: 1, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[1], coverType: "image" },
  { id: 2, slug: "temper", title: "Temper", discipline: "Brand System", client: "Temper", role: "Product Designer", year: "2022", orderIndex: 2, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[2], coverType: "image" },
  { id: 3, slug: "recharge", title: "Recharge.com", discipline: "Art Direction", client: "Recharge.com", role: "Visual Designer", year: "2021", orderIndex: 3, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[3], coverType: "image" },
  { id: 4, slug: "small-stitch", title: "Small Stitch", discipline: "Brand Identity", client: "Small Stitch", role: "Brand Designer", year: "2023", orderIndex: 4, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[4], coverType: "image" },
];

const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

export function WorkIndex({ projects }: { projects: PortfolioProject[] }) {
  const list = projects.length > 0 ? projects : PLACEHOLDER_PROJECTS;
  const total = list.length;

  const [active, setActive] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ratios = useRef<number[]>([]);

  // IntersectionObserver: a card is a "focus candidate" once >50% visible.
  // When several are (they are on load), the LEFT-MOST one is the focus — which
  // also gives the right behaviour as you scroll right and the leftmost card
  // drops below 50% and hands focus to the next.
  useEffect(() => {
    const root = carouselRef.current;
    if (!root) return;
    ratios.current = new Array(total).fill(0);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number((entry.target as HTMLElement).dataset.index);
          ratios.current[idx] = entry.intersectionRatio;
        });
        const leftMost = ratios.current.findIndex((r) => r > 0.5);
        if (leftMost !== -1) setActive(leftMost);
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [total]);

  function goTo(i: number) {
    cardRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setActive(i);
  }

  return (
    <div style={{ height: "calc(100vh - 56px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* hide the carousel scrollbar in webkit */}
      <style>{`.wk-carousel::-webkit-scrollbar{display:none}`}</style>

      {/* Intro */}
      <div style={{ padding: "6px 44px 28px", flexShrink: 0 }}>
        <h1 className="font-lore" style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.6rem)", lineHeight: 1, color: "var(--ink)" }}>
          Thanks
        </h1>
        <p className="font-lore" style={{ fontSize: "clamp(0.85rem, 1.2vw, 1rem)", lineHeight: 1.35, color: "#666", marginTop: 8, maxWidth: 460 }}>
          for stopping by. here is a collection of work I&rsquo;m proud of.
        </p>
      </div>

      {/* Carousel */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }}>
        <div
          ref={carouselRef}
          className="wk-carousel"
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
            padding: "0 44px 44px",
            height: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            scrollSnapType: "x mandatory",
            scrollPaddingLeft: 44,
            scrollbarWidth: "none",
          }}
        >
          {list.map((proj, i) => {
            const isActive = i === active;
            const cover = proj.coverUrl ?? PH_COVERS[i % PH_COVERS.length];
            const type = (proj.coverType ?? "image") as "image" | "gif" | "mp4";
            const counter = `${String(i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
            return (
              <div
                key={proj.id + "-" + proj.slug}
                data-index={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                onClick={() => goTo(i)}
                style={{
                  flexShrink: 0,
                  scrollSnapAlign: "start",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  cursor: "pointer",
                  width: isActive ? 480 : 220,
                  opacity: isActive ? 1 : 0.45,
                  transition: `width 500ms ${EASE}, opacity 500ms ${EASE}`,
                }}
              >
                {/* Image */}
                <div
                  style={{
                    width: "100%",
                    borderRadius: 14,
                    overflow: "hidden",
                    position: "relative",
                    background: "#e9e7e2",
                    height: isActive ? 340 : 180,
                    transition: `height 500ms ${EASE}`,
                  }}
                >
                  <Media src={cover} type={type} alt={proj.title} className="w-full h-full object-cover" />
                  <span
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 16,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      color: "rgba(255,255,255,0.85)",
                      opacity: isActive ? 1 : 0,
                      transition: "opacity 400ms 200ms",
                    }}
                  >
                    {counter}
                  </span>
                </div>

                {/* Meta */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "12px 2px 0", overflow: "hidden" }}>
                  <div style={{ minWidth: 0 }}>
                    <div
                      className="font-portfolio-sans"
                      style={{
                        fontSize: isActive ? 18 : 15,
                        fontWeight: 700,
                        color: "var(--ink)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        transition: `font-size 400ms ${EASE}`,
                      }}
                    >
                      {proj.title}
                    </div>
                    <div className="font-portfolio-sans" style={{ fontSize: 11, color: "#999", marginTop: 2, whiteSpace: "nowrap" }}>
                      {proj.discipline}
                    </div>
                  </div>
                  <Link
                    href={`/work/${proj.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-portfolio-sans"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--ink)",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      paddingLeft: 12,
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "translateX(0)" : "translateX(-8px)",
                      pointerEvents: isActive ? "auto" : "none",
                      transition: "opacity 300ms 300ms, transform 300ms 300ms",
                    }}
                  >
                    View project →
                  </Link>
                </div>
              </div>
            );
          })}
          {/* End spacer so the last card can snap to the left */}
          <div style={{ flexShrink: 0, width: "70vw" }} aria-hidden />
        </div>

        {/* Progress dots */}
        <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 10 }}>
          {list.map((_, i) => (
            <span
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: i === active ? "var(--ink)" : "#ccc",
                transform: i === active ? "scale(1.3)" : "scale(1)",
                transition: "background 300ms, transform 300ms",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
