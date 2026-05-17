"use client";

import { useEffect, useState } from "react";

type Section = { id: string; label: string; eyebrow: string };

const SECTIONS: Section[] = [
  { id: "experience", eyebrow: "01", label: "Experience" },
  { id: "personal", eyebrow: "02", label: "Personal" },
  { id: "overview", eyebrow: "03", label: "Overview" },
];

/**
 * Sticky in-page nav for /about. Uses IntersectionObserver to track
 * which `MenuCard` is currently in view and highlights the
 * corresponding link in `--pair-b`.
 */
export function AboutNav() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (elements.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: 0,
      },
    );
    elements.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-0 z-30 px-[var(--spacing-page)] py-3 backdrop-blur"
      style={{
        background: "color-mix(in srgb, var(--paper) 88%, transparent)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <ul className="flex items-center gap-6 md:gap-10 font-mono text-[color:var(--ink-soft)] overflow-x-auto">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id} className="relative whitespace-nowrap">
              <a
                href={`#${s.id}`}
                className="block py-1 transition-colors"
                style={{
                  color: isActive ? "var(--ink)" : "var(--ink-soft)",
                }}
              >
                <span className="opacity-70 mr-1.5">{s.eyebrow}</span> /{" "}
                {s.label}
              </a>
              <span
                aria-hidden
                className="absolute left-0 -bottom-px h-[2px] transition-[width,background] duration-300 ease-out"
                style={{
                  width: isActive ? "100%" : 0,
                  background: "var(--pair-b)",
                }}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
