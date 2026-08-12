"use client";

import type { PortfolioBlock } from "@/lib/db-portfolio";
import { ROW_LAYOUTS } from "@/lib/block-layouts";

/* A true-to-the-page preview of the composed rows.
 *
 * It replaces an iframe of the real route, which could not be trusted:
 * scaled down to fit the panel it distorted everything, and it only
 * updated when you remembered to hit Refresh. This reads the same
 * ROW_LAYOUTS table the page renders from and applies each image's own
 * focal point, so every frame and every crop is exact — and because it
 * renders from the editor's own state it updates as you work.
 *
 * What it deliberately does not reproduce: the scroll warp, the
 * before/after drag, and the stack's cycling. Those are motion, not
 * composition, and faking them here would be the same mistake the
 * iframe made. */

const MONO = "var(--font-dm-mono)";

function Slot({
  media,
  aspect,
}: {
  media?: { url: string; focalX: number; focalY: number };
  aspect: string | null;
}) {
  if (!media) {
    return (
      <div
        className="grid place-items-center rounded-sm"
        style={{ aspectRatio: aspect ?? "4 / 3", background: "#e9e9e9" }}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--meta)]">
          empty
        </span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.url}
      alt=""
      className="w-full rounded-sm"
      style={{
        display: "block",
        /* null aspect = a native row, sized by the file itself */
        aspectRatio: aspect ?? undefined,
        height: aspect ? "100%" : "auto",
        objectFit: aspect ? "cover" : undefined,
        objectPosition: aspect ? `${media.focalX * 100}% ${media.focalY * 100}%` : undefined,
      }}
    />
  );
}

export function LayoutPreview({
  blocks,
  accent,
}: {
  blocks: PortfolioBlock[];
  accent: string;
}) {
  return (
    <section className="space-y-3 pt-8 border-t border-[color:var(--rule)]">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="font-mono uppercase tracking-[0.14em] text-[11px]">Page preview</h2>
        <p className="font-mono text-[10px] text-[color:var(--meta)]">
          Exact crops and proportions · updates as you edit
        </p>
      </div>

      {blocks.length === 0 && (
        <p className="font-mono text-[color:var(--meta)] text-[11px]">Nothing to preview yet.</p>
      )}

      <div
        className="border border-[color:var(--rule)] rounded-sm p-4 space-y-4"
        style={{ background: "#fff" }}
      >
        {blocks.map((block) => {
          if (block.kind === "text") {
            return (
              <div key={block.id} className="rounded-sm p-4" style={{ background: "#FCF9F9" }}>
                {block.heading && (
                  <p
                    className="uppercase"
                    style={{ color: accent, fontWeight: 700, fontSize: 11, letterSpacing: "0.02em", marginBottom: 6 }}
                  >
                    {block.heading}
                  </p>
                )}
                <p style={{ color: "#232323", fontSize: 11, lineHeight: 1.6 }}>
                  {(block.body ?? "").slice(0, 240) || "—"}
                  {(block.body ?? "").length > 240 ? "…" : ""}
                </p>
              </div>
            );
          }

          const layout = ROW_LAYOUTS[block.layout] ?? ROW_LAYOUTS.single;
          const frames = (slot: number) => block.slots[slot]?.[0];

          return (
            <div key={block.id} className="space-y-1">
              <div className={layout.className} style={{ gap: 12 }}>
                {layout.aspects.map((a, i) => (
                  <Slot key={i} media={frames(i)} aspect={a === "auto" ? null : a} />
                ))}
              </div>
              {/* Say plainly where the still preview differs from the page */}
              {(block.layout === "compare" ||
                block.layout === "stack" ||
                (block.slots[0]?.length ?? 0) > 1) && (
                <p style={{ fontFamily: MONO, fontSize: 9 }} className="text-[color:var(--meta)] uppercase tracking-[0.14em]">
                  {block.layout === "compare"
                    ? "before / after — drags on the live page"
                    : block.layout === "stack"
                      ? `${block.slots[0]?.length ?? 0} layers — cycles on the live page`
                      : `${block.slots[0]?.length ?? 0} frames — loops on the live page`}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
