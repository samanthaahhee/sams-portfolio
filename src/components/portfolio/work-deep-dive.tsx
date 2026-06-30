"use client";

import { useState } from "react";
import Link from "next/link";
import { Media } from "./media";
import type { PortfolioProject, PortfolioMedia } from "@/lib/db-portfolio";

/* ── Grid-paper background ────────────────────────────────────────── */

const GRID_PAPER_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23d8d4ce' stroke-width='0.5'/%3E%3C/svg%3E")`;

/* ── Auto-arrange bento grid ──────────────────────────────────────── */

function parseDims(m: PortfolioMedia): { w: number; h: number } {
  if (m.width && m.height) return { w: m.width, h: m.height };
  if (m.aspectRatio) {
    const [a, b] = m.aspectRatio.split(":").map(Number);
    if (a && b) return { w: a, h: b };
  }
  return { w: 16, h: 10 }; // safe landscape fallback
}

function WorkGrid({ items, title }: { items: PortfolioMedia[]; title: string }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-400 font-portfolio-sans text-sm">
        No work images yet — upload via the admin dashboard.
      </div>
    );
  }

  // Group into rows: landscape (ratio ≥ 1.2) takes full width alone;
  // portrait/square items pair up side by side.
  const rows: PortfolioMedia[][] = [];
  let i = 0;
  while (i < items.length) {
    const cur = items[i];
    const { w, h } = parseDims(cur);
    const ratio = w / h;
    if (ratio >= 1.2) {
      // Landscape → solo full-width row
      rows.push([cur]);
      i++;
    } else {
      // Portrait/square → pair with next if also portrait/square
      const next = items[i + 1];
      if (next) {
        const { w: nw, h: nh } = parseDims(next);
        if (nw / nh < 1.2) {
          rows.push([cur, next]);
          i += 2;
        } else {
          rows.push([cur]);
          i++;
        }
      } else {
        rows.push([cur]);
        i++;
      }
    }
  }

  return (
    <div className="space-y-4">
      {rows.map((row, ri) => (
        <div
          key={ri}
          className="flex gap-4"
          style={{ alignItems: "stretch" }}
        >
          {row.map((m, mi) => {
            const { w, h } = parseDims(m);
            return (
              <div
                key={m.id}
                className="overflow-hidden rounded-xl bg-neutral-100"
                style={{ flex: row.length === 1 ? "1 1 100%" : `${w} 0 0`, aspectRatio: `${w} / ${h}` }}
              >
                <Media
                  src={m.url}
                  type={m.type}
                  alt={`${title} — plate ${mi + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ── The Thinking tab ─────────────────────────────────────────────── */

function ThinkingTab({ items, title }: { items: PortfolioMedia[]; title: string }) {
  return (
    <div
      className="space-y-8 rounded-xl p-6 md:p-10"
      style={{ background: `${GRID_PAPER_SVG}, #f8f6f2`, minHeight: 400 }}
    >
      {items.length === 0 ? (
        <div className="text-center py-20 text-neutral-400 font-portfolio-sans text-sm">
          No thinking frames yet — upload 1140 × 720 blocks via the admin dashboard.
        </div>
      ) : (
        items.map((m, i) => (
          <div key={m.id} className="space-y-3">
            <p
              className="font-lore font-bold text-lg md:text-xl tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              THE THINKING
            </p>
            <div
              className="overflow-hidden rounded-xl bg-white"
              style={{ aspectRatio: "1140 / 720" }}
            >
              <Media
                src={m.url}
                type={m.type}
                alt={`${title} — thinking ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────── */

export function WorkDeepDive({
  project,
  workMedia,
  thinkingMedia,
}: {
  project: PortfolioProject;
  workMedia: PortfolioMedia[];
  thinkingMedia: PortfolioMedia[];
}) {
  const [tab, setTab] = useState<"work" | "thinking">("work");

  return (
    <div className="min-h-screen font-portfolio-sans" style={{ color: "var(--ink)" }}>
      {/* ── Sticky tab bar ──────────────────────────────────────── */}
      <div
        className="sticky top-[72px] z-40 flex items-center justify-center gap-16 px-6 py-4 border-b border-neutral-200 bg-white/90 backdrop-blur-sm"
      >
        {(["work", "thinking"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative font-lore font-bold tracking-widest text-sm md:text-base uppercase transition-opacity"
            style={{ opacity: tab === t ? 1 : 0.4, color: "var(--ink)" }}
          >
            THE {t === "work" ? "WORK" : "THINKING"}
            {tab === t && (
              <span
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-current rounded-full"
              />
            )}
          </button>
        ))}
        <Link
          href="/work"
          className="absolute right-6 md:right-10 text-sm hover:opacity-60 transition-opacity"
          style={{ color: "var(--ink)" }}
        >
          ← Back
        </Link>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="flex gap-0 md:gap-10 px-6 md:px-10 pt-8 pb-20">
        {/* Left meta column */}
        <aside className="hidden md:block w-52 shrink-0 space-y-4 pt-1">
          {[
            { label: "Client", value: project.client },
            { label: "Role", value: project.role },
            { label: "Year", value: project.year },
          ].map(({ label, value }) =>
            value ? (
              <div key={label}>
                <span className="font-portfolio-sans text-xs font-semibold" style={{ color: "#999" }}>
                  {label}:
                </span>{" "}
                <span className="font-portfolio-sans text-sm">{value}</span>
              </div>
            ) : null
          )}
        </aside>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {tab === "work" ? (
            <WorkGrid items={workMedia} title={project.title} />
          ) : (
            <ThinkingTab items={thinkingMedia} title={project.title} />
          )}
        </div>
      </div>
    </div>
  );
}
