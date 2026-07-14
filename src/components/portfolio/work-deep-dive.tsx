"use client";

import { useState } from "react";
import Link from "next/link";
import { Media } from "./media";
import type { PortfolioProject, PortfolioMedia } from "@/lib/db-portfolio";

/* ── Bento work grid ─────────────────────────────────────────────────
   First three items form a trio: two stacked on the left, one tall
   image on the right spanning both rows (cropped via object-fit to
   match the stacked pair's combined height). Anything after that
   stacks as full-width rows below. Fewer than three items degrades to
   simple full-width rows. */

function parseDims(m: PortfolioMedia): { w: number; h: number } {
  if (m.width && m.height) return { w: m.width, h: m.height };
  if (m.aspectRatio) {
    const [a, b] = m.aspectRatio.split(":").map(Number);
    if (a && b) return { w: a, h: b };
  }
  return { w: 4, h: 3 };
}

function Plate({ m, title, i, style }: { m: PortfolioMedia; title: string; i: number; style?: React.CSSProperties }) {
  return (
    <div
      className="overflow-hidden bg-neutral-100"
      style={{ borderRadius: 20, position: "relative", ...style }}
    >
      <Media src={m.url} type={m.type} alt={`${title} — plate ${i + 1}`} className="w-full h-full object-cover" />
    </div>
  );
}

function WorkGrid({ items, title }: { items: PortfolioMedia[]; title: string }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-400 font-portfolio-sans text-sm">
        No work images yet — upload via the admin dashboard.
      </div>
    );
  }

  if (items.length < 3) {
    return (
      <div className="flex flex-col gap-6">
        {items.map((m, i) => {
          const { w, h } = parseDims(m);
          return <Plate key={m.id} m={m} title={title} i={i} style={{ aspectRatio: `${w} / ${h}` }} />;
        })}
      </div>
    );
  }

  const [a, b, c, ...rest] = items;
  const { w: aw, h: ah } = parseDims(a);
  const { w: bw, h: bh } = parseDims(b);

  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.85fr)", gap: 24 }}>
        <Plate m={a} title={title} i={0} style={{ gridColumn: 1, gridRow: 1, aspectRatio: `${aw} / ${ah}` }} />
        <Plate m={b} title={title} i={1} style={{ gridColumn: 1, gridRow: 2, aspectRatio: `${bw} / ${bh}` }} />
        <Plate m={c} title={title} i={2} style={{ gridColumn: 2, gridRow: "1 / 3", height: "100%" }} />
      </div>
      {rest.map((m, i) => {
        const { w, h } = parseDims(m);
        return <Plate key={m.id} m={m} title={title} i={i + 3} style={{ aspectRatio: `${w} / ${h}` }} />;
      })}
    </div>
  );
}

/* ── The Thinking tab ─────────────────────────────────────────────── */

const GRID_PAPER_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23d8d4ce' stroke-width='0.5'/%3E%3C/svg%3E")`;

function ThinkingTab({ items, title }: { items: PortfolioMedia[]; title: string }) {
  return (
    <div
      className="space-y-8 rounded-2xl p-6 md:p-10"
      style={{ background: `${GRID_PAPER_SVG}, #f8f6f2`, minHeight: 400 }}
    >
      {items.length === 0 ? (
        <div className="text-center py-20 text-neutral-400 font-portfolio-sans text-sm">
          No thinking frames yet — upload via the admin dashboard.
        </div>
      ) : (
        items.map((m, i) => (
          <div
            key={m.id}
            className="overflow-hidden rounded-2xl bg-white"
            style={{ aspectRatio: "1140 / 720" }}
          >
            <Media src={m.url} type={m.type} alt={`${title} — thinking ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))
      )}
    </div>
  );
}

/* ── Meta sidebar ─────────────────────────────────────────────────── */

function MetaBlock({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="font-portfolio-sans" style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
        {label}:
      </div>
      {value && (
        <div className="font-portfolio-sans" style={{ fontSize: 15, color: "#111", marginTop: 6, lineHeight: 1.5 }}>
          {value}
        </div>
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
    <div className="font-portfolio-sans" style={{ color: "#111" }}>
      {/* ── Tabs + back ─────────────────────────────────────────── */}
      <div className="flex items-center px-6 md:px-14" style={{ paddingTop: 64, gap: 48 }}>
        {(["work", "thinking"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="font-lore font-bold"
            style={{ fontSize: 20, color: "#111", position: "relative", paddingBottom: 6 }}
          >
            THE {t === "work" ? "WORK" : "THINKING"}
            {tab === t && (
              <svg
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
                style={{ position: "absolute", left: 0, right: 0, bottom: -2, width: "100%", height: 8 }}
              >
                <path d="M1 4 Q 25 1, 50 4 T 99 4" stroke="#111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            )}
          </button>
        ))}
        <Link
          href="/work"
          className="font-portfolio-sans hover:opacity-60 transition-opacity"
          style={{ fontSize: 15, color: "#111", marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <span aria-hidden>←</span> Back
        </Link>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-10 md:gap-16 px-6 md:px-14" style={{ paddingTop: 56, paddingBottom: 96 }}>
        <aside className="w-full md:w-56 shrink-0 space-y-8">
          <MetaBlock label="Client" value={project.client} />
          <MetaBlock label="Role" value={project.role} />
          {project.deliverables && project.deliverables.length > 0 && (
            <MetaBlock label="Deliverables" value={project.deliverables.join(", ")} />
          )}
          <MetaBlock label="Creative Team" value={project.creativeTeam?.join(", ")} />
        </aside>

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
