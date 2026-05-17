"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProjectCard } from "./project-card";
import { type Project } from "@/lib/projects";

export function ArchiveSection({ projects }: { projects: Project[] }) {
  /* Build the filter list from the tags actually set on projects. Any tag
   * present on at least one project becomes a filter chip; tags removed
   * from every project disappear automatically. Order: first-seen order
   * across the project list (predictable + author-controllable via the
   * editor). */
  const filters = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const p of projects) {
      for (const t of p.tags) {
        const trimmed = t.trim();
        if (!trimmed || seen.has(trimmed)) continue;
        seen.add(trimmed);
        ordered.push(trimmed);
      }
    }
    return ["All", ...ordered];
  }, [projects]);

  const [active, setActive] = useState<string>("All");

  // If the active filter disappears (e.g. last project with that tag
  // removed), fall back to "All" rather than rendering an empty state.
  const safeActive = filters.includes(active) ? active : "All";

  const filtered =
    safeActive === "All"
      ? projects
      : projects.filter((p) => p.tags.includes(safeActive));

  return (
    <section id="archive" className="px-[var(--spacing-page)] pt-12 md:pt-16 scroll-mt-20">
      <p
        className="font-display mb-10 md:mb-14"
        style={{ fontSize: "var(--text-d3)", lineHeight: 1.0 }}
      >
        Additional Projects.
      </p>

      {/* ── Filter chips ─────────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Filter projects by discipline"
        className="flex flex-wrap items-center gap-2 mb-8 md:mb-10 pb-6 border-b border-[color:var(--rule)]"
      >
        {filters.map((f) => {
          const isActive = safeActive === f;
          const count =
            f === "All"
              ? projects.length
              : projects.filter((p) => p.tags.includes(f)).length;
          return (
            <button
              key={f}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(f)}
              className="font-mono px-3 py-1.5 rounded-full border transition-all duration-300"
              style={{
                borderColor: isActive
                  ? "var(--ink)"
                  : "var(--rule)",
                background: isActive ? "var(--ink)" : "transparent",
                color: isActive ? "var(--paper)" : "var(--ink-soft)",
              }}
            >
              {f} <span style={{ opacity: 0.6 }}>· {count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Filtered grid ────────────────────────────────────────── */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 md:gap-x-6 gap-y-8 md:gap-y-10"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <ProjectCard project={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="font-mono text-[color:var(--meta)] mt-8">
          Nothing in this category yet.
        </p>
      )}
    </section>
  );
}
