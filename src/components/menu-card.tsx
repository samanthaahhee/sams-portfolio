"use client";

import { motion } from "motion/react";

type Variant = "paper" | "paper-soft";

/**
 * Editorial menu-card frame. Lays out a script eyebrow ("starters —"),
 * a tagline, and a body slot. Used for each section of /about. Backed
 * by either `--paper` or `--paper-soft` for visual rhythm — never a
 * hard shadow.
 */
export function MenuCard({
  id,
  eyebrow,
  scriptLabel,
  tagline,
  variant = "paper",
  children,
}: {
  /** Anchor id used by the sticky nav. */
  id: string;
  /** Mono uppercase label, "01 / Overview". */
  eyebrow: string;
  /** Script label, e.g. "starters —" — rendered in Caveat. */
  scriptLabel: string;
  /** Short editorial line under the script label. */
  tagline: string;
  variant?: Variant;
  children: React.ReactNode;
}) {
  const bg = variant === "paper-soft" ? "var(--paper-soft)" : "var(--paper)";
  return (
    <motion.section
      id={id}
      className="relative px-[var(--spacing-page)] pt-20 md:pt-28 pb-20 md:pb-28 scroll-mt-20"
      style={{ background: bg }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="grid grid-cols-12 gap-4">
        <p className="col-span-12 font-mono text-[color:var(--meta)] mb-4">
          {eyebrow}
        </p>

        {/* Script label — rotated, oversized. Visually the loudest
            thing on the card, never used for navigation. */}
        <h2
          aria-label={eyebrow}
          className="col-span-12 font-script text-[color:var(--ink)]"
          style={{
            fontSize: "clamp(3rem, 9vw, 7rem)",
            transform: "rotate(-2deg)",
            transformOrigin: "left bottom",
            marginBottom: "1.25rem",
          }}
        >
          {scriptLabel}
        </h2>

        <p className="col-span-12 md:col-span-7 text-base md:text-xl leading-relaxed text-[color:var(--ink-soft)] mb-10 md:mb-14">
          {tagline}
        </p>

        <div className="col-span-12">{children}</div>
      </div>
    </motion.section>
  );
}
