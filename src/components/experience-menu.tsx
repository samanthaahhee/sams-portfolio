"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { ExperienceEntry } from "@/lib/about";

/**
 * Expandable experience list. Each row: title — company on the left,
 * date on the right, location/context line below, hidden bullets that
 * reveal on click. Featured entry (current role) gets a left rule in
 * --pair-b and a ★ next to the company name.
 *
 * Keyboard accessible (button row, expand via Enter/Space).
 * `prefers-reduced-motion: reduce` strips the animation via the global
 * fallback in globals.css.
 */
export function ExperienceMenu({ items }: { items: ExperienceEntry[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <ul
      className="border-t border-b border-[color:var(--rule)]"
      style={{ borderColor: "var(--rule)" }}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        const isLast = i === items.length - 1;
        return (
          <motion.li
            key={`${item.title}-${item.company}`}
            className="relative"
            style={{
              borderBottom: isLast ? undefined : "1px solid var(--rule)",
              background: item.featured ? "var(--paper)" : undefined,
              borderLeft: item.featured ? "3px solid var(--pair-b)" : undefined,
              paddingLeft: item.featured ? "1rem" : undefined,
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.55,
              /* Cascade — when multiple rows are in view at once
                 (top of the section) they reveal one after another.
                 Cap so later rows don't wait too long. */
              delay: Math.min(i, 5) * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`exp-panel-${i}`}
              className="w-full text-left py-5 md:py-6 flex items-baseline justify-between gap-4 md:gap-8"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display font-semibold text-lg md:text-xl text-[color:var(--ink)]">
                    {item.title}
                  </h3>
                  <span className="text-base md:text-lg text-[color:var(--ink-soft)]">
                    {item.featured && (
                      <span
                        aria-hidden
                        className="mr-1.5"
                        style={{ color: "var(--pair-b)" }}
                      >
                        ★
                      </span>
                    )}
                    {item.company}
                  </span>
                </div>
                <p className="font-mono text-[color:var(--meta)] mt-1.5">
                  {item.location}
                  {item.context ? ` · ${item.context}` : ""}
                </p>
              </div>

              <div className="flex items-baseline gap-4 shrink-0">
                <span className="font-mono text-[color:var(--meta)] whitespace-nowrap hidden sm:inline">
                  {item.dates}
                </span>
                <motion.span
                  aria-hidden
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full border shrink-0"
                  style={{
                    borderColor: isOpen ? "var(--pair-b)" : "var(--rule)",
                    color: isOpen ? "var(--pair-b)" : "var(--ink-soft)",
                    fontSize: "14px",
                    lineHeight: 1,
                  }}
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  +
                </motion.span>
              </div>
            </button>

            {/* Mobile-only date row */}
            <p className="font-mono text-[color:var(--meta)] -mt-3 mb-2 sm:hidden">
              {item.dates}
            </p>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`exp-panel-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="overflow-hidden"
                >
                  <ul className="pb-6 md:pb-8 space-y-2 text-[color:var(--ink-soft)] leading-relaxed">
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
          </motion.li>
        );
      })}
    </ul>
  );
}
