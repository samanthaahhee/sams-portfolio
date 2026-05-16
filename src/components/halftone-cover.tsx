"use client";

import { motion } from "motion/react";

/**
 * Slim editorial cover plate at the top of each case study page —
 * matches the Selected Work card's pair-a background. ~60% shorter
 * than the previous version so the page leads into the body faster,
 * with clear padding between the title and the client / metadata row.
 */
export function HalftoneCover({
  no,
  title,
  client,
  year,
}: {
  no: string;
  title: string;
  client: string;
  year: string;
}) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-sm aspect-[5/3.5] md:aspect-[16/4.4]"
      style={{
        background: "var(--pair-a)",
        color: "var(--pair-a-ink)",
      }}
    >
      {/* Halftone field — kept subtle so the pair-a colour reads as the
          same background as the card on the home page. */}
      <div
        className="absolute inset-0 halftone-fine opacity-15 mix-blend-multiply"
        style={{ ["--dot" as string]: "#000" }}
        aria-hidden
      />

      <div className="absolute inset-0 grid grid-rows-[auto_1fr_auto] p-6 md:p-10">
        {/* Top row — small metadata */}
        <div className="flex items-start justify-between font-mono">
          <span>No. {no}</span>
          <span>{year}</span>
        </div>

        {/* Title — vertically centred, left-aligned. The `pb-4 md:pb-6`
            creates explicit padding between the project name and the
            company-name row beneath it. */}
        <div className="flex items-center justify-start pb-4 md:pb-6">
          <motion.h1
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.75rem)",
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              maxWidth: "16ch",
            }}
          >
            {title}
          </motion.h1>
        </div>

        {/* Bottom row — client + author */}
        <div className="flex items-end justify-between font-mono">
          <span>{client}</span>
          <span className="hidden sm:inline">
            Sam Ahhee · Visual Communications
          </span>
        </div>
      </div>
    </div>
  );
}
