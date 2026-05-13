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
        <article
          className="relative grid grid-rows-[58%_42%] overflow-hidden rounded-sm"
          style={{ aspectRatio: "5 / 6.4" }}
        >
          {/* ── Image plate (top) ─────────────────────────────────── */}
          <div
            className="relative overflow-hidden"
            style={{ background: "var(--pair-a)" }}
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

          {/* ── Copy plate (bottom) ────────────────────────────────── */}
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

            <div className="relative h-full grid grid-rows-[auto_1fr_auto] p-5 md:p-6">
              {/* Top: Client (left) · Year (right) */}
              <div className="flex items-start justify-between font-mono">
                <span>{study.client}</span>
                <span>{study.year}</span>
              </div>

              {/* Center: title, left-aligned, vertically centered */}
              <div className="flex items-center justify-start">
                <h3
                  className="font-display"
                  style={{
                    fontSize: "clamp(1.5rem, 3.2vw, 2.5rem)",
                    lineHeight: 0.98,
                    maxWidth: "14ch",
                  }}
                >
                  {study.title}
                </h3>
              </div>

              {/* Bottom: Category (left) · View work (right) */}
              <div className="flex items-end justify-between gap-4 font-mono">
                <span>{study.category}</span>
                <span className="opacity-75 group-hover:opacity-100 transition-opacity">
                  View work →
                </span>
              </div>
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
