"use client";

import { useState } from "react";
import Link from "next/link";
import { Media } from "./media";
import type { PortfolioProject, PortfolioMedia } from "@/lib/db-portfolio";
import type { ThinkingSection } from "@/lib/portfolio-placeholders";

const NAV_H = 56; // PortfolioNav's fixed height — tabs row sticks just below it

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
      {rest.map((m, i) => (
        // Full-width rows are always a wide landscape banner, regardless of
        // the source image's own orientation — object-fit crops to match.
        <Plate key={m.id} m={m} title={title} i={i + 3} style={{ aspectRatio: "21 / 6" }} />
      ))}
    </div>
  );
}

/* ── The Thinking tab ─────────────────────────────────────────────────
   Each section is a header + body copy, with an optional supporting
   image below it. Falls back to a plain image stack when no structured
   sections exist yet (older / DB-only projects). */

function ThinkingSections({ sections, title }: { sections: ThinkingSection[]; title: string }) {
  return (
    <div className="flex flex-col gap-10">
      {sections.map((s, i) => (
        <div key={i} className="space-y-4">
          <h3 className="font-portfolio-sans" style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
            {s.title}
          </h3>
          <p className="font-portfolio-sans" style={{ fontSize: 15, lineHeight: 1.5, color: "#111" }}>
            {s.body}
          </p>
          {s.image && (
            <div className="overflow-hidden bg-neutral-100" style={{ borderRadius: 20, aspectRatio: "16 / 10" }}>
              <Media src={s.image} type="image" alt={`${title} — ${s.title}`} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ThinkingMediaFallback({ items, title }: { items: PortfolioMedia[]; title: string }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-400 font-portfolio-sans text-sm">
        No thinking notes yet — add via the admin dashboard.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-8">
      {items.map((m, i) => (
        <div key={m.id} className="overflow-hidden bg-neutral-100 rounded-2xl" style={{ aspectRatio: "16 / 10" }}>
          <Media src={m.url} type={m.type} alt={`${title} — thinking ${i + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

function ThinkingTab({ sections, items, title }: { sections?: ThinkingSection[]; items: PortfolioMedia[]; title: string }) {
  if (sections && sections.length > 0) return <ThinkingSections sections={sections} title={title} />;
  return <ThinkingMediaFallback items={items} title={title} />;
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
  thinkingSections,
}: {
  project: PortfolioProject;
  workMedia: PortfolioMedia[];
  thinkingMedia: PortfolioMedia[];
  thinkingSections?: ThinkingSection[];
}) {
  const [tab, setTab] = useState<"work" | "thinking">("work");

  return (
    <div className="font-portfolio-sans" style={{ color: "#111" }}>
      <div className="flex flex-col md:flex-row items-start gap-10 md:gap-16 px-6 md:px-14" style={{ paddingTop: 40, paddingBottom: 96 }}>
        {/* Sidebar — sticky below the nav, so only the grid/copy column scrolls.
            Offset roughly aligns "Client:" with the grid below the tabs row. */}
        <aside
          className="w-full md:w-56 shrink-0 space-y-8 md:sticky"
          style={{ paddingTop: 76, top: NAV_H + 24 }}
        >
          <MetaBlock label="Client" value={project.client} />
          <MetaBlock label="Role" value={project.role} />
          {project.deliverables && project.deliverables.length > 0 && (
            <MetaBlock label="Deliverables" value={project.deliverables.join(", ")} />
          )}
          <MetaBlock label="Creative Team" value={project.creativeTeam?.join(", ")} />
        </aside>

        {/* Content column — tabs + back sit only above this column, sticky below the nav */}
        <div className="flex-1 min-w-0">
          <div
            className="sticky flex items-center bg-white"
            style={{ top: NAV_H, zIndex: 30, gap: 40, paddingTop: 24, paddingBottom: 24 }}
          >
            {(["work", "thinking"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="font-lore"
                style={{ fontSize: 20, fontWeight: 400, color: "#111", position: "relative", paddingBottom: 6 }}
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

          {tab === "work" ? (
            <WorkGrid items={workMedia} title={project.title} />
          ) : (
            <ThinkingTab sections={thinkingSections} items={thinkingMedia} title={project.title} />
          )}
        </div>
      </div>
    </div>
  );
}
