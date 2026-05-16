"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { CaseStudy } from "@/lib/case-studies";
import { customColorsToStyle } from "@/lib/palette";
import { TagPillCluster } from "./tag-pill-cluster";

/**
 * Selected Work card — split layout.
 *
 * Card:
 *   Top (58%): cover image with tag pill top-right.
 *   Bottom (42%): pair-a coloured plate with halftone dots, holding the
 *     editorial chrome (Client, Year, Title centred, Category, View →).
 *
 * External (below card):
 *   Role label (mono) on top
 *   Descriptor (summary) underneath
 */
export function WorkCard({ study, index }: { study: CaseStudy; index: number }) {
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
              alt={`${study.client} — ${study.title}, cover`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.04]"
            />

            {/* Tag pills — primary + "+N" badge that expands on hover */}
            <TagPillCluster tags={study.tags} size="lg" />
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
              {/* Top: Client only — year/category dropped (covered by the
                  tag pill on the image). */}
              <div className="flex items-start font-mono">
                <span>{study.client}</span>
              </div>

              {/* Center: title, left-aligned, vertically centered */}
              <div className="flex items-center justify-start">
                <h3
                  className="font-display"
                  style={{
                    fontSize: "clamp(1.25rem, 2.5vw, 2rem)",
                    lineHeight: 0.98,
                    maxWidth: "14ch",
                    color: "#ffffff",
                  }}
                >
                  {study.title}
                </h3>
              </div>

              {/* Bottom-left: View work → */}
              <div className="flex items-end font-mono">
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
