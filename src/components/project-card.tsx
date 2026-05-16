"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Project } from "@/lib/projects";
import { customColorsToStyle } from "@/lib/palette";
import { TagPillCluster } from "./tag-pill-cluster";

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
        <article className="relative overflow-hidden rounded-sm">
          {/* ── Image plate ─────────────────────────────────────────── */}
          <div
            className="relative overflow-hidden"
            style={{
              background: "var(--pair-a)",
              aspectRatio: "4 / 4",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.cover}
              alt={`${project.title} — cover`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.04]"
            />

            {/* Tag pills — primary + "+N" badge that expands on hover
                to reveal the extra tags. */}
            <TagPillCluster tags={project.tags} />
          </div>

          {/* ── Brand label — sits tight under the image, no fixed
              row height so there's no empty space beneath. */}
          <p
            className="font-mono pt-2.5 md:pt-3"
            style={{ color: "var(--ink)" }}
          >
            {project.brand}
          </p>
        </article>
      </Link>
    </motion.div>
  );
}
