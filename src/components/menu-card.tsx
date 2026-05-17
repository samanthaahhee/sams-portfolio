"use client";

import { motion } from "motion/react";

type Variant = "paper" | "paper-soft";

/**
 * Section frame for /about. Renders just an anchored section with the
 * editorial scroll-reveal — no eyebrow, no title, no tagline. The
 * sections speak for themselves through their body content; headers
 * were removed in the editorial pass.
 */
export function MenuCard({
  id,
  variant = "paper",
  children,
}: {
  /** Anchor id used by the sticky nav. */
  id: string;
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
        <div className="col-span-12">{children}</div>
      </div>
    </motion.section>
  );
}
