"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { ExperienceEntry } from "@/lib/about";

/**
 * Dotted-leader expandable list. Each item collapses by default; the
 * plus cue rotates 45° to become an × when open. Featured entries
 * (current role) get a left rule in --pair-b and a ★ glyph.
 *
 * Keyboard accessible — items are <button>, expanded via Enter / Space.
 * `prefers-reduced-motion: reduce` strips the animation via the global
 * fallback in globals.css.
 */
export function ExperienceMenu({ items }: { items: ExperienceEntry[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <ul className="divide-y divide-[color:var(--rule)] border-y border-[color:var(--rule)]">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li
            key={`${item.title}-${item.company}`}
            className="relative"
            style={
              item.featured
                ? {
                    background: "var(--paper)",
                    borderLeft: "3px solid var(--pair-b)",
                    paddingLeft: "1rem",
                  }
                : undefined
            }
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`exp-panel-${i}`}
              className="w-full text-left py-5 md:py-6 flex flex-col md:flex-row md:items-baseline md:gap-4 group"
            >
              {/* Title row — title · dotted leader · date */}
              <div className="flex flex-1 min-w-0 items-baseline gap-3 md:gap-4">
                <span className="font-display font-semibold text-lg md:text-xl text-[color:var(--ink)]">
                  {item.featured && (
                    <span
                      aria-hidden
                      className="mr-2"
                      style={{ color: "var(--pair-b)" }}
                    >
                      ★
                    </span>
                  )}
                  {item.title}
                </span>
                <span className="italic text-[color:var(--ink-soft)] text-base md:text-lg whitespace-nowrap">
                  — {item.company}
                </span>
                {/* Dotted leader — desktop only */}
                <span
                  aria-hidden
                  className="hidden md:block flex-1 min-w-[2rem] mx-2 mb-1"
                  style={{
                    borderBottom: "2px dotted var(--ink-muted)",
                  }}
                />
                <span className="font-mono text-[color:var(--meta)] whitespace-nowrap mt-1 md:mt-0">
                  {item.dates}
                </span>
              </div>

              {/* Plus cue — desktop only, sits in its own slot */}
              <motion.span
                aria-hidden
                className="hidden md:inline-flex items-center justify-center w-7 h-7 rounded-full border ml-2 shrink-0"
                style={{
                  borderColor: isOpen
                    ? "var(--pair-b)"
                    : "var(--rule)",
                  color: isOpen ? "var(--pair-b)" : "var(--ink-soft)",
                  fontSize: "14px",
                  lineHeight: 1,
                }}
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                +
              </motion.span>
            </button>

            {/* Meta line — context · location. Always visible. */}
            <p className="font-mono text-[color:var(--meta)] -mt-2 mb-3 md:mb-4">
              {item.location}
              {item.context ? ` · ${item.context}` : ""}
            </p>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`exp-panel-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="overflow-hidden"
                >
                  <ul className="pb-6 md:pb-8 pl-1 md:pl-4 space-y-2 text-[color:var(--ink-soft)] leading-relaxed">
                    {item.bullets.map((b, j) => (
                      <li
                        key={j}
                        className="relative pl-5 before:content-['·'] before:absolute before:left-0 before:text-[color:var(--meta)]"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
