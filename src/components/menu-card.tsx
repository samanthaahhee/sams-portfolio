"use client";

import { motion } from "motion/react";

type Variant = "paper" | "paper-soft";

/**
 * Editorial section frame for /about. Mono eyebrow + display title +
 * tagline + body slot. Backed by either `--paper` or `--paper-soft`
 * for visual rhythm — no card shadows, no script labels.
 */
export function MenuCard({
  id,
  eyebrow,
  title,
  tagline,
  variant = "paper",
  children,
}: {
  /** Anchor id used by the sticky nav. */
  id: string;
  /** Mono uppercase label, e.g. "01 / Overview". */
  eyebrow: string;
  /** Display-weight section title, e.g. "About". */
  title: string;
  /** Short editorial line under the title. */
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

        <h2
          className="col-span-12 md:col-span-10 font-display text-[color:var(--ink)]"
          style={{
            fontSize: "var(--text-d3)",
            lineHeight: 0.98,
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </h2>

        <p className="col-span-12 md:col-span-7 mt-6 md:mt-8 text-base md:text-xl leading-relaxed text-[color:var(--ink-soft)] mb-10 md:mb-14">
          {tagline}
        </p>

        <div className="col-span-12">{children}</div>
      </div>
    </motion.section>
  );
}
