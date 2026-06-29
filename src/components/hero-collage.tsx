"use client";

/**
 * Kinetic work-collage hero, inspired by the monopo.london reel.
 *
 * Two layers, fading between each other:
 *   • Collage view — a Pinterest-style tiled grid of every work
 *     cover, slowly drifting, with the wordmark anchored centre.
 *   • Spotlight view — one cover blown up to fill the frame, the
 *     wordmark still centred over it. Cycles through the list.
 *
 * Layouts are deterministic (seeded by index) so SSR and the client
 * agree, and so the same piece always lands in the same tile during
 * a session.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export type CollagePiece = {
  href: string;
  src: string;
  title: string;
  client?: string | null;
};

type Tile = {
  src: string;
  href: string;
  title: string;
  // Position + size as percentages of the viewport. Stable per index.
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: number;
};

/** Deterministic pseudo-random in [0,1) seeded by an integer.
 *  Mulberry-32 — fast, good distribution, stable across runs. */
function rand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Lay tiles out in a loose grid with jittered position, size, rotation. */
function buildTiles(pieces: CollagePiece[]): Tile[] {
  const r = rand(7);
  // 4 columns × 3 rows works on most desktops; mobile clamps via CSS.
  const COLS = 4;
  const ROWS = 3;
  const cellW = 100 / COLS;
  const cellH = 100 / ROWS;

  return pieces.map((p, i) => {
    const col = i % COLS;
    const row = Math.floor((i / COLS) % ROWS);
    const jitterX = (r() - 0.5) * cellW * 0.55;
    const jitterY = (r() - 0.5) * cellH * 0.55;
    const sizeScale = 0.85 + r() * 0.55;
    const width = cellW * sizeScale;
    const height = cellH * (0.85 + r() * 0.55);
    return {
      src: p.src,
      href: p.href,
      title: p.title,
      left: col * cellW + cellW / 2 + jitterX,
      top: row * cellH + cellH / 2 + jitterY,
      width,
      height,
      rotate: (r() - 0.5) * 4,
    };
  });
}

export function HeroCollage({
  pieces,
  wordmark = "Sam Ahhee",
  /** ms each spotlight piece stays full-bleed before the next. */
  spotlightDuration = 2600,
  /** ms the collage shows between spotlights. */
  collageDuration = 3200,
}: {
  pieces: CollagePiece[];
  wordmark?: string;
  spotlightDuration?: number;
  collageDuration?: number;
}) {
  const tiles = useMemo(() => buildTiles(pieces), [pieces]);
  const [mode, setMode] = useState<"collage" | "spotlight">("collage");
  const [spotIdx, setSpotIdx] = useState(0);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotionRef.current) return;

    let cancelled = false;

    function loop() {
      // Show collage…
      setMode("collage");
      const t1 = setTimeout(() => {
        if (cancelled) return;
        // …then jump to a spotlight piece.
        setSpotIdx((i) => (i + 1) % pieces.length);
        setMode("spotlight");
        const t2 = setTimeout(loop, spotlightDuration);
        (loop as { _t?: ReturnType<typeof setTimeout> })._t = t2;
      }, collageDuration);
      (loop as { _t?: ReturnType<typeof setTimeout> })._t = t1;
    }

    loop();
    return () => {
      cancelled = true;
      const t = (loop as { _t?: ReturnType<typeof setTimeout> })._t;
      if (t) clearTimeout(t);
    };
  }, [pieces.length, collageDuration, spotlightDuration]);

  const spot = pieces[spotIdx];

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{
        height: "calc(100vh - 56px)",
        minHeight: 560,
        background: "#0e0a08",
      }}
    >
      {/* ── Collage layer ───────────────────────────────────────── */}
      <div
        aria-hidden={mode !== "collage"}
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={{ opacity: mode === "collage" ? 1 : 0 }}
      >
        <div className="hp-drift absolute inset-0">
          {tiles.map((t, i) => (
            <Link
              key={i}
              href={t.href}
              aria-label={t.title}
              className="hp-tile absolute block rounded-sm overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
              style={{
                left: `${t.left}%`,
                top: `${t.top}%`,
                width: `${t.width}%`,
                height: `${t.height}%`,
                transform: `translate(-50%, -50%) rotate(${t.rotate}deg)`,
                animationDelay: `${-(i * 0.9)}s`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.src}
                alt=""
                loading="eager"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)",
                }}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Spotlight layer ─────────────────────────────────────── */}
      <div
        aria-hidden={mode !== "spotlight"}
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={{ opacity: mode === "spotlight" ? 1 : 0 }}
      >
        {spot && (
          <Link href={spot.href} aria-label={spot.title} className="block w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={`spot-${spotIdx}`}
              src={spot.src}
              alt={spot.title}
              loading="eager"
              decoding="async"
              className="hp-zoom absolute inset-0 w-full h-full object-cover"
            />
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.55) 100%)",
              }}
            />
            {/* Tiny caption bottom-left */}
            <span className="absolute left-[var(--spacing-page)] bottom-6 md:bottom-10 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.14em] text-white/85">
              <span className="opacity-60 mr-2">Now showing</span>
              {spot.title}
              {spot.client && <span className="opacity-60"> · {spot.client}</span>}
            </span>
          </Link>
        )}
      </div>

      {/* ── Centred wordmark ───────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <h1
          className="font-display text-white text-center leading-[0.9]"
          style={{
            fontSize: "clamp(3rem, 11vw, 11rem)",
            letterSpacing: "-0.03em",
            textShadow: "0 2px 18px rgba(0,0,0,0.45)",
          }}
        >
          {wordmark}.
        </h1>
      </div>

      {/* ── Bottom info strip ───────────────────────────────────── */}
      <div className="absolute left-0 right-0 bottom-0 px-[var(--spacing-page)] pb-4 md:pb-6 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.14em] text-white/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          <div>
            <p>Based in Amsterdam</p>
            <p className="text-white/55">Born in Cape Town</p>
          </div>
          <div className="md:text-center">
            <p>Multidisciplinary designer</p>
            <p className="text-white/55">brand · product · visual</p>
          </div>
          <div className="md:text-right">
            <p>Brand, product, illustration</p>
            <p className="text-white/55">and visual communication</p>
          </div>
        </div>
      </div>

      {/* Drift + zoom keyframes — pure CSS so this island is small. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hp-drift { animation: hp-drift 28s ease-in-out infinite alternate; }
        .hp-tile  { animation: hp-tile-float 14s ease-in-out infinite alternate; will-change: transform; }
        .hp-zoom  { animation: hp-zoom 2.6s cubic-bezier(.16,.62,.24,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .hp-drift, .hp-tile, .hp-zoom { animation: none !important; }
        }
        @keyframes hp-drift {
          0%   { transform: scale(1.04) translate(-1.5%, -1%); }
          100% { transform: scale(1.10) translate(1.5%,  1%); }
        }
        @keyframes hp-tile-float {
          0%   { transform: translate(-50%, -50%) rotate(var(--r, 0deg)) translate(0, 0); }
          100% { transform: translate(-50%, -50%) rotate(var(--r, 0deg)) translate(0.6%, -0.6%); }
        }
        @keyframes hp-zoom {
          0%   { transform: scale(1.18); }
          100% { transform: scale(1.02); }
        }
        `,
        }}
      />
    </div>
  );
}
