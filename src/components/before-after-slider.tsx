"use client";

import { useRef, useState } from "react";
import type React from "react";
import { MediaEl } from "@/components/media-el";

/** Shared by both corners so they can never drift apart. */
const pill: React.CSSProperties = {
  position: "absolute",
  top: 12,
  fontSize: 20,
  lineHeight: 1,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "10px 18px",
  borderRadius: 999,
  background: "#fff",
  pointerEvents: "none",
};

/**
 * Drag-divider before/after image comparison.
 *   - Click + drag (mouse, pen, touch) anywhere on the image to move
 *     the divider.
 *   - Two stacked images at the same aspect ratio.
 *   - "BEFORE" / "AFTER" labels in the top corners.
 */
export function BeforeAfterSlider({
  before,
  after,
  caption,
  aspect = "16 / 10",
  color,
}: {
  before: string;
  after: string;
  caption?: string;
  aspect?: string;
  /** The project's accent, so the corner labels match its headings.
   *  Falls back to the page ink where no project supplies one. */
  color?: string;
}) {
  const label = color ?? "var(--ink)";
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [percent, setPercent] = useState(50);

  const updateFromEvent = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPercent(Math.max(0, Math.min(100, p)));
  };

  return (
    <figure className="space-y-2">
      <div
        ref={ref}
        role="slider"
        aria-label="Drag to compare before and after"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        tabIndex={0}
        className="relative overflow-hidden rounded-sm select-none cursor-ew-resize"
        style={{
          aspectRatio: aspect,
          background: "var(--pair-a)",
          touchAction: "none",
        }}
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          updateFromEvent(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) updateFromEvent(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPercent((p) => Math.max(0, p - 4));
          if (e.key === "ArrowRight") setPercent((p) => Math.min(100, p + 4));
        }}
      >
        {/* After — full bleed underneath (revealed on the right).
            Wrapped in an identical absolute container as Before so
            layout is pixel-identical and the two images can never
            drift relative to each other. */}
        <div className="absolute inset-0 pointer-events-none">
          <MediaEl
            url={after}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center" }}
          />
        </div>

        {/* Before — same wrapper, but clipped to the LEFT of the divider
            so the BEFORE label and image sit on the left side. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
        >
          <MediaEl
            url={before}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center" }}
          />
        </div>

        {/* Divider line + handle */}
        <div
          aria-hidden
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: `${percent}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white -translate-x-1/2 shadow-[0_0_0_1px_rgba(0,0,0,0.18)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-[color:var(--ink)] flex items-center justify-center shadow-[0_3px_8px_rgba(20,15,10,0.18)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--ink)]">
              <polyline points="15 18 9 12 15 6" transform="translate(-3 0)" />
              <polyline points="9 18 15 12 9 6" transform="translate(3 0)" />
            </svg>
          </div>
        </div>

        {/* Corner labels — sized to read at arm's length on a phone, so
            solid white rather than a translucent blur: at this size the
            frosted panel showed too much of the image through it. */}
        <span className="font-mono" style={{ ...pill, left: 12, color: label }}>Before</span>
        <span className="font-mono" style={{ ...pill, right: 12, color: label }}>After</span>

      </div>
      {caption && (
        <figcaption className="font-mono text-[color:var(--meta)]">{caption}</figcaption>
      )}
    </figure>
  );
}
