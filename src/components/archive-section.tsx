"use client";

import { motion } from "motion/react";
import { ProjectCard } from "./project-card";
import { type Project } from "@/lib/projects";

export function ArchiveSection({ projects }: { projects: Project[] }) {
  return (
    <section
      id="archive"
      className="px-[var(--spacing-page)] pt-12 md:pt-16 scroll-mt-20"
    >
      <div className="mb-10 md:mb-14 text-center">
        <p
          className="font-display"
          style={{
            fontSize: "clamp(1.25rem, 3.2vw, 2.8rem)",
            lineHeight: 1.0,
          }}
        >
          Smaller projects.
        </p>
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 md:gap-x-6 gap-y-8 md:gap-y-10"
      >
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </motion.div>

      {projects.length === 0 && (
        <p className="font-mono text-[color:var(--meta)] mt-8">
          Nothing in this category yet.
        </p>
      )}
    </section>
  );
}
