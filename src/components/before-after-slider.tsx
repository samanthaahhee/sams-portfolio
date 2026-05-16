"use client";

import { useRef, useState } from "react";

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
}: {
  before: string;
  after: string;
  caption?: string;
  aspect?: string;
}) {
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={after}
            alt="After"
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={before}
            alt="Before"
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

        {/* Corner labels */}
        <span
          className="absolute top-2 left-2 font-mono uppercase tracking-[0.14em] px-2 py-1 rounded-full pointer-events-none"
          style={{
            fontSize: "10px",
            background: "rgba(255, 255, 255, 0.7)",
            color: "var(--ink)",
            backdropFilter: "blur(8px)",
          }}
        >
          Before
        </span>
        <span
          className="absolute top-2 right-2 font-mono uppercase tracking-[0.14em] px-2 py-1 rounded-full pointer-events-none"
          style={{
            fontSize: "10px",
            background: "rgba(255, 255, 255, 0.7)",
            color: "var(--ink)",
            backdropFilter: "blur(8px)",
          }}
        >
          After
        </span>
      </div>
      {caption && (
        <figcaption className="font-mono text-[color:var(--meta)]">{caption}</figcaption>
      )}
    </figure>
  );
}
