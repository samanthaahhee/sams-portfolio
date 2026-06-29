"use client";

/**
 * Split landing hero — big "Sam Ahhee" wordmark + bio on the left,
 * work cards flowing along an S-curve on the right.
 *
 * S-curve carousel
 *   • An invisible SVG path defines the trajectory (viewBox 0–100
 *     proportional so it scales with the container).
 *   • Each card has a phase (0–1) that advances over time and wraps.
 *   • Every frame we sample the SVG path at `phase * pathLength`,
 *     scale to container pixels, compute the tangent angle, and
 *     apply transform + opacity + scale (small at the edges, big in
 *     the middle).
 *   • Cards closer to the apex (phase ≈ 0.5) sit on top via z-index.
 */

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";

export type DeckCard = {
  href: string;
  src: string;
  title: string;
  client?: string | null;
};

const PINK = "#f4b8d0";

/** Proportional S-curve in a 0–100 / 0–100 viewBox. Enters left,
 *  loops up, dips down, exits right. */
const CURVE_PATH =
  "M -10 55 C 12 55, 22 12, 42 28 C 62 44, 78 88, 110 55";

export function HeroCardDeck({
  cards,
  /** Full curve traversal time in ms. Lower = faster flow. */
  cycleMs = 14000,
  /** Max cards in the flow. More than ~7 starts to feel cluttered. */
  maxCards = 7,
}: {
  cards: DeckCard[];
  cycleMs?: number;
  maxCards?: number;
}) {
  const shown = useMemo(() => cards.slice(0, maxCards), [cards, maxCards]);
  const N = shown.length;

  const stageRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (N === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stage = stageRef.current;
    const path = pathRef.current;
    if (!stage || !path) return;

    let pathLen = path.getTotalLength();
    let stageW = stage.clientWidth;
    let stageH = stage.clientHeight;
    let xScale = stageW / 100;
    let yScale = stageH / 100;

    const ro = new ResizeObserver(() => {
      stageW = stage.clientWidth;
      stageH = stage.clientHeight;
      xScale = stageW / 100;
      yScale = stageH / 100;
      pathLen = path.getTotalLength();
    });
    ro.observe(stage);

    const t0 = performance.now();

    function place(phase: number, node: HTMLAnchorElement) {
      const d = phase * pathLen;
      const p = path!.getPointAtLength(d);
      // Sample a nearby point to get the tangent direction.
      const p2 = path!.getPointAtLength(Math.min(pathLen, d + 0.5));
      const dx = (p2.x - p.x) * xScale;
      const dy = (p2.y - p.y) * yScale;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      const cx = p.x * xScale;
      const cy = p.y * yScale;

      // Visibility envelope — fade in/out near the edges so cards
      // appear and disappear smoothly without a hard wrap.
      const fade = Math.min(1, Math.sin(phase * Math.PI) * 1.3);
      // Scale envelope — small at the edges, peak ~1.05 mid-curve.
      const scale = 0.55 + 0.55 * Math.sin(phase * Math.PI);
      // Subtle additional rotation for personality (≈ ±4°).
      const wobble = Math.sin(phase * Math.PI * 2) * 4;

      node.style.transform =
        `translate3d(${cx}px, ${cy}px, 0) ` +
        `translate(-50%, -50%) ` +
        `rotate(${angle + wobble}deg) ` +
        `scale(${scale.toFixed(3)})`;
      node.style.opacity = String(Math.max(0, Math.min(1, fade)));
      node.style.zIndex = String(Math.round(100 * Math.sin(phase * Math.PI)));
    }

    function frame(now: number) {
      const elapsed = (now - t0) / cycleMs;
      for (let i = 0; i < N; i++) {
        const node = cardRefs.current[i];
        if (!node) continue;
        const offset = i / N;
        // Stagger so cards spread evenly along the curve and flow
        // continuously as elapsed advances.
        const phase = ((elapsed + offset) % 1 + 1) % 1;
        place(phase, node);
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    if (reduce) {
      // Static placement — evenly distribute along the curve, no rAF.
      for (let i = 0; i < N; i++) {
        const node = cardRefs.current[i];
        if (!node) continue;
        place((i + 0.5) / N, node);
      }
    } else {
      rafRef.current = requestAnimationFrame(frame);
    }

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [N, cycleMs]);

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{
        height: "calc(100vh - 56px)",
        minHeight: 640,
        background: "#170a0d",
      }}
    >
      {/* Soft mood lighting */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 75% 50%, rgba(140,40,40,0.22) 0%, transparent 65%)",
        }}
      />

      <div className="relative h-full grid grid-cols-12 gap-4 px-[var(--spacing-page)] pt-10 md:pt-16 pb-24 md:pb-28">
        {/* LEFT — name + tagline + bio */}
        <div className="relative z-30 col-span-12 md:col-span-6 lg:col-span-6 flex flex-col justify-center text-white">
          <h1
            className="font-display leading-[0.85] tracking-[-0.03em] mb-8 md:mb-10"
            style={{
              fontSize: "clamp(3.5rem, 12vw, 11rem)",
              color: PINK,
            }}
          >
            Sam
            <br />
            Ahhee
          </h1>

          <p className="font-display text-lg md:text-2xl mb-3 text-white/95">
            Thinker. Maker. Doer.
          </p>

          <p className="text-white/65 text-[13px] md:text-[14px] leading-relaxed max-w-[46ch]">
            Art director and visual communicator with 13+ years of
            experience helping people understand products and brands
            across campaigns, digital, print, events and everything in
            between.
          </p>
        </div>

        {/* RIGHT — S-curve carousel stage */}
        <div
          ref={stageRef}
          className="relative col-span-12 md:col-span-6 lg:col-span-6 h-full"
        >
          {/* Invisible path used purely to sample positions. */}
          <svg
            aria-hidden
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ overflow: "visible" }}
          >
            <path
              ref={pathRef}
              d={CURVE_PATH}
              fill="none"
              stroke={PINK}
              strokeWidth="0.6"
              strokeLinecap="round"
              opacity="0.35"
            />
          </svg>

          {/* Cards — absolutely positioned, transforms set by rAF. */}
          {shown.map((c, i) => (
            <Link
              key={`${c.href}-${i}`}
              href={c.href}
              aria-label={c.title}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute top-0 left-0 rounded-md overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)] will-change-transform"
              style={{
                width: "min(28vw, 280px)",
                aspectRatio: "3 / 4",
                transformOrigin: "50% 50%",
                background: "#0a0506",
                opacity: 0,
                transform: "translate3d(-9999px, -9999px, 0)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.src}
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
                    "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)",
                }}
              />
              <div className="absolute top-3 left-3 right-3 text-white">
                {c.client && (
                  <p className="font-display italic text-[11px] md:text-[12px] mb-0.5 text-white/85 leading-tight">
                    {c.client}
                  </p>
                )}
                <p className="font-display text-sm md:text-base leading-tight">
                  {c.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Bottom info strip ───────────────────────────────────── */}
      <div className="absolute left-0 right-0 bottom-0 px-[var(--spacing-page)] pb-5 md:pb-8 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.14em] text-white/80 z-30">
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
            <p>Selected work, flowing</p>
            <p className="text-white/55">click any card</p>
          </div>
        </div>
      </div>
    </div>
  );
}
