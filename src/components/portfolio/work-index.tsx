"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Media } from "./media";
import type { PortfolioProject } from "@/lib/db-portfolio";

/* Placeholder covers — shown until real media is uploaded */
const PH_COVERS = [
  "https://picsum.photos/seed/walkrr-cover/1520/1120",
  "https://picsum.photos/seed/bos-cover/1520/1120",
  "https://picsum.photos/seed/recharge-cover/1520/1120",
  "https://picsum.photos/seed/smallstitch-cover/1520/1120",
  "https://picsum.photos/seed/icetea-cover/1520/1120",
];

const PLACEHOLDER_PROJECTS: PortfolioProject[] = [
  { id: 0, slug: "walkrr", title: "Walkrr", discipline: "Brand Design", client: "Walkrr", role: "Brand Designer", year: "2023", orderIndex: 0, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[0], coverType: "image" },
  { id: 1, slug: "bos-ice-tea", title: "BOS Ice Tea", discipline: "Campaign", client: "BOS", role: "Art Director", year: "2022", orderIndex: 1, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[1], coverType: "image" },
  { id: 2, slug: "recharge", title: "Recharge", discipline: "Brand & Product", client: "Recharge.com", role: "Visual Designer", year: "2021", orderIndex: 2, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[2], coverType: "image" },
  { id: 3, slug: "small-stitch", title: "Small Stitch", discipline: "Brand Identity", client: "Small Stitch", role: "Brand Designer", year: "2023", orderIndex: 3, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[3], coverType: "image" },
];

export function WorkIndex({ projects }: { projects: PortfolioProject[] }) {
  const list = projects.length > 0 ? projects : PLACEHOLDER_PROJECTS;

  const [focusedIdx, setFocusedIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const displayIdx = hoveredIdx ?? focusedIdx;
  const displayed = list[displayIdx] ?? list[0];

  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  function onCarouselScroll() {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    let closest = 0;
    let closestDist = Infinity;
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const dist = Math.abs(rect.top - containerRect.top);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    setFocusedIdx(closest);
  }

  const coverSrc = displayed.coverUrl ?? PH_COVERS[displayIdx % PH_COVERS.length];
  const coverType = (displayed.coverType ?? "image") as "image" | "gif" | "mp4";

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">

      {/* ── Left — focused project ─────────────────────────────── */}
      <div className="relative flex flex-col justify-between flex-1 min-w-0 p-6 md:p-10">
        {/* Focused image */}
        <div className="relative flex-1 overflow-hidden rounded-xl bg-neutral-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayed.id + "-" + displayed.slug}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <Media
                src={coverSrc}
                type={coverType}
                className="w-full h-full object-cover"
                alt={displayed.title}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Title + discipline + View project */}
        <div className="flex items-end justify-between mt-4 shrink-0">
          <div>
            <p className="font-portfolio-sans font-semibold text-lg leading-tight" style={{ color: "var(--ink)" }}>
              {displayed.title}
            </p>
            <p className="font-portfolio-sans text-sm mt-0.5" style={{ color: "#888" }}>
              {displayed.discipline}
            </p>
          </div>
          <Link
            href={`/work/${displayed.slug}`}
            className="font-portfolio-sans text-sm hover:opacity-60 transition-opacity shrink-0 ml-6"
            style={{ color: "var(--ink)" }}
          >
            View project →
          </Link>
        </div>
      </div>

      {/* ── Right — LORE intro + vertical scroll carousel ──────── */}
      <div className="flex flex-col w-full md:w-[420px] shrink-0 p-6 md:pl-0 md:pr-10 md:py-10 overflow-hidden">
        {/* Handwritten intro */}
        <p
          className="font-lore font-bold mb-6 shrink-0"
          style={{ fontSize: "clamp(1rem, 1.8vw, 1.5rem)", lineHeight: 1.25, color: "var(--ink)" }}
        >
          HEY I&rsquo;M SAM AHHEE &mdash; I&rsquo;m a visual
          communication designer, translating complex ideas into clear
          storytelling.
        </p>

        {/* Scrollable carousel */}
        <div
          ref={carouselRef}
          onScroll={onCarouselScroll}
          className="flex-1 overflow-y-auto space-y-4 pr-1"
          style={{ scrollSnapType: "y mandatory", scrollbarWidth: "none" }}
        >
          {list.map((proj, i) => {
            const src = proj.coverUrl ?? PH_COVERS[i % PH_COVERS.length];
            const type = (proj.coverType ?? "image") as "image" | "gif" | "mp4";
            const isActive = i === (hoveredIdx ?? focusedIdx);
            return (
              <div
                key={proj.id + "-" + proj.slug}
                ref={(el) => { cardRefs.current[i] = el; }}
                style={{ scrollSnapAlign: "start" }}
              >
                <Link
                  href={`/work/${proj.slug}`}
                  className="block"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div
                    className="relative overflow-hidden rounded-lg transition-transform duration-300"
                    style={{
                      aspectRatio: "3 / 2",
                      transform: isActive ? "scale(1.02)" : "scale(1)",
                      outline: isActive ? "2px solid rgba(0,0,0,0.15)" : "none",
                    }}
                  >
                    <Media
                      src={src}
                      type={type}
                      className="w-full h-full object-cover"
                      alt={proj.title}
                    />
                  </div>
                </Link>
              </div>
            );
          })}
          {/* Bottom padding so last card can scroll to top */}
          <div style={{ height: "60%" }} aria-hidden />
        </div>
      </div>
    </div>
  );
}
