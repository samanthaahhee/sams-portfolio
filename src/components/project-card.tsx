"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Project } from "@/lib/projects";
import { customColorsToStyle } from "@/lib/palette";

/**
 * Archive card. On mobile (single column) the copy plate is taller,
 * the title is bigger and vertically centred, and the "View project →"
 * label is visible — matching the Selected Work card structure.
 *
 * Supports multiple tags — all rendered as pills stacked top-right of
 * the image. First tag is the "primary" used by the archive filter.
 */
export function ProjectCard({ project }: { project: Project }) {
  const useCustom = project.palette === "custom" && project.customColors;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
      data-pair={useCustom ? undefined : project.palette}
      style={useCustom ? customColorsToStyle(project.customColors!) : undefined}
    >
      <Link href={`/projects/${project.slug}`} className="block group">
        <article
          className="relative grid grid-rows-[58%_42%] md:grid-rows-[72%_28%] overflow-hidden rounded-sm"
          style={{ aspectRatio: "4 / 5.4" }}
        >
          {/* ── Image plate ─────────────────────────────────────────── */}
          <div
            className="relative overflow-hidden"
            style={{ background: "var(--pair-a)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.cover}
              alt={`${project.title} — cover placeholder`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.04]"
            />
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-multiply"
              style={{ background: "var(--pair-a)", opacity: 0.22 }}
            />

            {/* Tag pills — frosted-glass white, blurred so contents behind
                are obscured. Stacked top-right. */}
            <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="font-mono px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(255, 255, 255, 0.4)",
                    color: "var(--ink)",
                    backdropFilter: "blur(12px) saturate(140%)",
                    WebkitBackdropFilter: "blur(12px) saturate(140%)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── Copy plate ──────────────────────────────────────────── */}
          <div
            className="relative overflow-hidden"
            style={{
              background: "var(--pair-a)",
              color: "var(--pair-a-ink)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 halftone-fine opacity-15 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-25"
              style={{ ["--dot" as string]: "#000" }}
            />

            <div className="relative h-full grid grid-rows-[auto_1fr_auto] px-4 md:px-4 py-3 md:py-3">
              {/* Top-left: Brand */}
              <div className="font-mono">
                <span>{project.brand}</span>
              </div>

              {/* Centre row: Title.
                  Mobile → centred vertically + big.
                  md+   → top-aligned, 10px below brand, slightly bigger. */}
              <div className="flex items-center md:items-start md:mt-2.5 justify-start">
                <h3
                  className="font-display text-2xl md:text-lg"
                  style={{
                    lineHeight: 0.98,
                    maxWidth: "16ch",
                  }}
                >
                  {project.title}
                </h3>
              </div>

              {/* Bottom-left: View project */}
              <div className="font-mono opacity-75 group-hover:opacity-100 transition-opacity">
                View project →
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
