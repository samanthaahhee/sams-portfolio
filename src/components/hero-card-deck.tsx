"use client";

/**
 * Split landing hero — big "Sam Ahhee" wordmark + bio on the left,
 * fanned card-deck of work covers on the right, decorative pink
 * squiggle drawn over both. The deck auto-shuffles every few
 * seconds.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export type DeckCard = {
  href: string;
  src: string;
  title: string;
  client?: string | null;
};

const PINK = "#f4b8d0";

export function HeroCardDeck({
  cards,
  shuffleEvery = 2800,
  maxCards = 6,
}: {
  cards: DeckCard[];
  shuffleEvery?: number;
  maxCards?: number;
}) {
  const shown = useMemo(() => cards.slice(0, maxCards), [cards, maxCards]);
  const N = shown.length;
  const [front, setFront] = useState(0);

  useEffect(() => {
    if (N <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(
      () => setFront((f) => (f + 1) % N),
      shuffleEvery,
    );
    return () => window.clearInterval(t);
  }, [N, shuffleEvery]);

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
            "radial-gradient(ellipse at 75% 50%, rgba(140,40,40,0.25) 0%, transparent 65%)",
        }}
      />

      {/* ── Two-column body ──────────────────────────────────────── */}
      <div className="relative h-full grid grid-cols-12 gap-4 px-[var(--spacing-page)] pt-10 md:pt-16 pb-24 md:pb-28">
        {/* LEFT — name + tagline + bio */}
        <div className="relative z-20 col-span-12 md:col-span-6 lg:col-span-7 flex flex-col justify-center text-white">
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

        {/* RIGHT — fanned deck */}
        <div className="relative col-span-12 md:col-span-6 lg:col-span-5 flex items-center justify-center md:justify-end">
          <div
            className="relative"
            style={{
              width: "min(34vw, 360px)",
              aspectRatio: "3 / 4",
            }}
          >
            {shown.map((c, i) => {
              const slot = (i - front + N) % N;
              const t = N === 1 ? 0 : slot / (N - 1);
              const direction = slot % 2 === 0 ? 1 : -1;
              const rot = direction * (3 + slot * 4);
              const xPct = direction * (slot * 6);
              const yPct = slot * 2.2;
              const scale = 1 - slot * 0.035;
              return (
                <Link
                  key={`${c.href}-${i}`}
                  href={c.href}
                  aria-label={c.title}
                  className="absolute inset-0 rounded-md overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]"
                  style={{
                    zIndex: 100 - slot,
                    transform: `translate(${xPct}%, ${yPct}%) rotate(${rot}deg) scale(${scale})`,
                    transition:
                      "transform 900ms cubic-bezier(.22,.61,.36,1), opacity 900ms ease",
                    opacity: 1 - t * 0.2,
                    transformOrigin: "50% 70%",
                    background: "#0a0506",
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
                  <span className="absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/70 px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                    {String(i + 1).padStart(2, "0")} /{" "}
                    {String(N).padStart(2, "0")}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Decorative pink squiggle, layered on top ─────────────── */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
      >
        <path
          d="
            M 540 -20
            C 540 180, 760 240, 920 280
            S 1080 110, 1240 280
            S 1480 560, 1620 640
            C 1700 700, 1700 820, 1620 920
          "
          fill="none"
          stroke={PINK}
          strokeWidth="9"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>

      {/* ── Bottom info strip ───────────────────────────────────── */}
      <div className="absolute left-0 right-0 bottom-0 px-[var(--spacing-page)] pb-5 md:pb-8 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.14em] text-white/80 z-20">
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
            <p>Selected work, shuffled</p>
            <p className="text-white/55">click any card</p>
          </div>
        </div>
      </div>
    </div>
  );
}
