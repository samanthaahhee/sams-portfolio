"use client";

import { motion } from "motion/react";

/**
 * A "cover" plate for case studies — type-as-image hero, with a halftone
 * field behind big display type. Reveals on mount with a printed registration
 * feel (slight x-offset slide + opacity).
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
      className="relative w-full overflow-hidden rounded-sm"
      style={{
        background: "var(--pair-a)",
        color: "var(--pair-a-ink)",
        aspectRatio: "16 / 11",
      }}
    >
      {/* Halftone field */}
      <div
        className="absolute inset-0 halftone opacity-30"
        style={{ ["--dot" as string]: "var(--pair-b)" }}
        aria-hidden
      />

      {/* Editorial chrome */}
      <div className="absolute inset-0 grid grid-rows-[auto_1fr_auto] p-8 md:p-12">
        <div className="flex items-start justify-between font-mono">
          <span>No. {no}</span>
          <span>{year}</span>
        </div>

        <div className="flex items-end">
          <motion.h1
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            className="font-display"
            style={{
              fontSize: "var(--text-d2)",
              maxWidth: "14ch",
            }}
          >
            {title}
          </motion.h1>
        </div>

        <div className="flex items-end justify-between font-mono">
          <span>{client}</span>
          <span className="hidden sm:inline">Sam Ahhee · Visual Communications</span>
        </div>
      </div>

    </div>
  );
}
