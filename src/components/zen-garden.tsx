"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

/**
 * A miniature top-view zen garden, framed Wes-Anderson style.
 *
 *  - Pale cream sand surface inside a thin warm-walnut frame.
 *  - Drag anywhere on the sand to rake parallel lines (3 tines, ink umber).
 *  - Four stones in muted earth tones — drag to reposition.
 *  - "Smooth the sand →" button clears all rake marks.
 *
 * The composition is deliberately symmetric on first paint and degrades
 * into something hand-tended once the user starts interacting.
 */

type Stone = {
  id: string;
  x: number;   // % of container
  y: number;
  w: number;   // px
  h: number;   // px
  color: string;
  highlight: string;
  shadow: string;
  borderRadius: string;
};

const STONES: Stone[] = [
  {
    id: "stone-1",
    x: 22, y: 28, w: 92, h: 62,
    color: "#a39684",
    highlight: "#c4b8a4",
    shadow: "#7c7062",
    borderRadius: "62% 70% 64% 66% / 70% 60% 70% 62%",
  },
  {
    id: "stone-2",
    x: 56, y: 42, w: 70, h: 48,
    color: "#8c8474",
    highlight: "#aaa392",
    shadow: "#665e50",
    borderRadius: "55% 65% 60% 55% / 60% 55% 65% 60%",
  },
  {
    id: "stone-3",
    x: 68, y: 64, w: 56, h: 56,
    color: "#b9a692",
    highlight: "#d4c4ae",
    shadow: "#8e7d6a",
    borderRadius: "50% 60% 55% 50% / 55% 50% 60% 55%",
  },
  {
    id: "stone-4",
    x: 32, y: 70, w: 44, h: 36,
    color: "#94806c",
    highlight: "#b39e88",
    shadow: "#6e5d4b",
    borderRadius: "60% 50% 65% 55% / 50% 60% 55% 65%",
  },
];

export function ZenGarden() {
  const sandRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raking = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [stones, setStones] = useState(STONES);

  /* Size the canvas to the sand element on mount + resize, with DPR scaling. */
  useEffect(() => {
    const fit = () => {
      const canvas = canvasRef.current;
      const sand = sandRef.current;
      if (!canvas || !sand) return;
      const rect = sand.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const bringToFront = (id: string) => {
    setStones((prev) => {
      const target = prev.find((s) => s.id === id);
      if (!target) return prev;
      return [...prev.filter((s) => s.id !== id), target];
    });
  };

  const startRake = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.dataset.stone === "true") return; // Don't rake when starting on a stone
    raking.current = true;
    if (!sandRef.current) return;
    const rect = sandRef.current.getBoundingClientRect();
    last.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const moveRake = (e: React.PointerEvent) => {
    if (!raking.current || !canvasRef.current || !sandRef.current || !last.current) return;
    const rect = sandRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const dx = x - last.current.x;
    const dy = y - last.current.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.5) return;

    const perpX = -dy / len;
    const perpY = dx / len;
    const TINES = 3;
    const SPACING = 5; // px between tines
    const offset = (TINES - 1) / 2;

    for (let i = 0; i < TINES; i++) {
      const o = (i - offset) * SPACING;
      ctx.beginPath();
      ctx.moveTo(last.current.x + perpX * o, last.current.y + perpY * o);
      ctx.lineTo(x + perpX * o, y + perpY * o);
      ctx.strokeStyle = "rgba(122, 92, 60, 0.30)";
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    last.current = { x, y };
  };

  const endRake = () => {
    raking.current = false;
    last.current = null;
  };

  const smoothSand = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);
  };

  return (
    <div className="relative w-full">
      {/* ── Wooden frame ────────────────────────────────────────────── */}
      <div
        className="relative p-2.5 md:p-3 rounded-[3px]"
        style={{
          background:
            "linear-gradient(135deg, #c19a72 0%, #9c7a52 45%, #7d5e3c 55%, #b89072 100%)",
          boxShadow:
            "0 1px 0 rgba(255,235,205,0.4) inset, 0 -1px 0 rgba(40,20,5,0.4) inset, 0 10px 24px rgba(60,40,20,0.22)",
        }}
      >
        {/* Inner bevel */}
        <div
          className="relative"
          style={{
            boxShadow:
              "inset 0 2px 6px rgba(40,20,5,0.35), inset 0 -1px 0 rgba(255,235,205,0.2)",
          }}
        >
          {/* ── Sand surface ───────────────────────────────────────── */}
          <div
            ref={sandRef}
            className="relative w-full aspect-square overflow-hidden"
            style={{
              background:
                "radial-gradient(115% 90% at 25% 20%, #f4e8cf 0%, #ecdbb8 55%, #dcc89e 100%)",
              cursor: "crosshair",
              touchAction: "none",
            }}
            onPointerDown={startRake}
            onPointerMove={moveRake}
            onPointerUp={endRake}
            onPointerLeave={endRake}
            onPointerCancel={endRake}
            aria-label="Zen garden — drag to rake the sand"
          >
            {/* Rake-mark canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
            />

            {/* Sand-grain noise */}
            <div
              aria-hidden
              className="absolute inset-0 halftone-mini opacity-[0.08] mix-blend-multiply pointer-events-none"
              style={{ ["--dot" as string]: "#5c4628" }}
            />

            {/* ── Stones ──────────────────────────────────────────── */}
            {stones.map((s) => (
              <motion.div
                key={s.id}
                drag
                dragMomentum={false}
                dragConstraints={sandRef}
                dragElastic={0.05}
                onPointerDown={() => bringToFront(s.id)}
                whileDrag={{ scale: 1.06, cursor: "grabbing" }}
                whileHover={{ scale: 1.03 }}
                data-stone="true"
                className="absolute cursor-grab active:cursor-grabbing"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: `clamp(28px, ${(s.w / 360) * 100}%, ${s.w}px)`,
                  height: `clamp(20px, ${(s.h / 360) * 100}%, ${s.h}px)`,
                  background: `radial-gradient(circle at 32% 28%, ${s.highlight} 0%, ${s.color} 55%, ${s.shadow} 100%)`,
                  borderRadius: s.borderRadius,
                  boxShadow:
                    "0 2px 1px rgba(80,60,40,0.18) inset, 0 4px 6px rgba(80,60,40,0.25)",
                  touchAction: "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Caption + reset ─────────────────────────────────────────── */}
      <div className="mt-3 flex items-baseline justify-between font-mono text-[color:var(--meta)]">
        <span>Zen Garden · No. 01</span>
        <button
          onClick={smoothSand}
          className="hover:text-[color:var(--ink)] transition-colors underline-offset-4 hover:underline"
        >
          Smooth the sand →
        </button>
      </div>
    </div>
  );
}
