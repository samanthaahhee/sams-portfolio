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

// Card sizing — active (focus) is large on the left, passive cards trail off
// to the right. Bottom-aligned so the meta baseline stays put. Image heights
// track viewport height so the focus card fills the space like the reference.
const ACTIVE_W = 660;
const ACTIVE_IMG_H = "min(60vh, 540px)";
const PASSIVE_W = 480;
const PASSIVE_IMG_H = "min(44vh, 400px)";

export function WorkIndex({ projects }: { projects: PortfolioProject[] }) {
  const list = projects.length > 0 ? projects : PLACEHOLDER_PROJECTS;
  const total = list.length;

  const [active, setActive] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ratios = useRef<number[]>([]);

  // IntersectionObserver: the left-most card that is >50% visible is the focus.
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
    <div style={{ height: "calc(100vh - 56px)", position: "relative", overflow: "hidden" }}>
      {/* hide the carousel scrollbar in webkit */}
      <style>{`.wk-carousel::-webkit-scrollbar{display:none}`}</style>

      {/* Intro — floats in the top-right, above the passive cards */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: `${44 + ACTIVE_W + 56}px`,
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

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="wk-carousel"
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 24,
          padding: "0 44px 40px",
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
                width: isActive ? ACTIVE_W : PASSIVE_W,
                opacity: isActive ? 1 : 0.9,
                transition: `width 500ms ${EASE}, opacity 500ms ${EASE}`,
              }}
            >
              {/* Image */}
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
                      fontSize: isActive ? 26 : 20,
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
        {/* End spacer so the last card can snap to the left */}
        <div style={{ flexShrink: 0, width: "55vw" }} aria-hidden />
      </div>
    </div>
  );
}
