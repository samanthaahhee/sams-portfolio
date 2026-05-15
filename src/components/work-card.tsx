"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { CaseStudy } from "@/lib/case-studies";
import { customColorsToStyle } from "@/lib/palette";

/**
 * Selected Work card — split layout.
 *
 * Card:
 *   Top: cover image (~58%) with tag pill top-right.
 *   Bottom: pair-a coloured plate with halftone dots:
 *     Top-left:    Client name
 *     Top-right:   Year
 *     Center:      Title (left-aligned, vertically centered)
 *     Bottom-left: Category
 *     Bottom-right:View work →
 *
 * External (below card):
 *   Role label (mono) on top
 *   Descriptor (summary) underneath
 */
export function WorkCard({ study, index }: { study: CaseStudy; index: number }) {
  const primaryTag = study.tags[0];
  const useCustom = study.palette === "custom" && study.customColors;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
      data-pair={useCustom ? undefined : study.palette}
      style={useCustom ? customColorsToStyle(study.customColors!) : undefined}
    >
      <Link href={`/work/${study.slug}`} className="group block">
        <article className="relative">
          {/* ── Image plate (top) ─────────────────────────────────── */}
          <div
            className="relative overflow-hidden rounded-sm"
            style={{ background: "var(--pair-a)", aspectRatio: "5 / 4" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={study.cover}
              alt={`${study.client} — ${study.title}, cover placeholder`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.04]"
            />
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-multiply"
              style={{ background: "var(--pair-a)", opacity: 0.22 }}
            />

            {/* Tag pill — frosted-glass white. */}
            <span
              className="absolute top-3 right-3 font-mono px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(255, 255, 255, 0.4)",
                color: "var(--ink)",
                backdropFilter: "blur(12px) saturate(140%)",
                WebkitBackdropFilter: "blur(12px) saturate(140%)",
              }}
            >
              {primaryTag}
            </span>
          </div>

          {/* ── Copy block — transparent, sits on page bg ───────────── */}
          <div className="relative mt-4 md:mt-5" style={{ color: "var(--ink)" }}>
            <div className="flex items-baseline justify-between font-mono text-[color:var(--meta)]">
              <span>{study.client}</span>
              <span>{study.year}</span>
            </div>
            <h3
              className="font-display mt-2"
              style={{
                fontSize: "clamp(1.25rem, 2.4vw, 1.875rem)",
                lineHeight: 1.02,
                maxWidth: "14ch",
              }}
            >
              {study.title}
            </h3>
            <div className="mt-3 flex items-baseline justify-between gap-4 font-mono text-[color:var(--meta)]">
              <span>{study.category}</span>
              <span className="opacity-75 group-hover:opacity-100 transition-opacity">
                View work →
              </span>
            </div>
          </div>
        </article>

        {/* ── External: Role + Descriptor stack ────────────────────── */}
        <div className="mt-4 space-y-2">
          <p className="font-mono text-[color:var(--meta)]">
            Role · {study.primaryRole}
          </p>
          <p className="text-[color:var(--ink-soft)] leading-relaxed">
            {study.summary}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
