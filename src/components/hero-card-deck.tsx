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

      {/* ── Left column — name + tagline + bio ─────────────────── */}
      <div className="relative h-full grid grid-cols-12 gap-4 px-[var(--spacing-page)] pt-10 md:pt-16 pb-24 md:pb-28">
        <div className="relative z-20 col-span-12 md:col-span-7 flex flex-col justify-center text-white">
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
      </div>

      {/* ── Fanned deck — anchored to a fixed point in the right
          half of the viewport (centred at 72% across, 50% down) so
          it sits naturally between the wordmark and the edge with
          even breathing room. */}
      <div
        className="hidden md:flex absolute z-20 items-center justify-center"
        style={{
          left: "72%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className="relative"
          style={{
            width: "min(36vw, 420px)",
            aspectRatio: "3 / 4",
          }}
        >
            {shown.map((c, i) => {
              const slot = (i - front + N) % N;
              const t = N === 1 ? 0 : slot / (N - 1);
              const direction = slot % 2 === 0 ? 1 : -1;
              // Tighter fan — small rotation + small offset per slot
              // so the deck reads as one stack with peek-out edges.
              const rot = direction * (2 + slot * 2.5);
              const xPct = direction * (slot * 3.5);
              const yPct = slot * 1.5;
              const scale = 1 - slot * 0.025;
              return (
                <Link
                  key={`${c.href}-${i}`}
                  href={c.href}
                  aria-label={c.title}
                  className="group absolute inset-0 rounded-md overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]"
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
                  {/* Darken on hover so the title reads */}
                  <span
                    aria-hidden
                    className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0) 70%)",
                    }}
                  />
                  {/* Title — hidden by default, fades in on hover */}
                  <div className="absolute top-3 left-3 right-3 text-white transition-opacity duration-300 opacity-0 group-hover:opacity-100">
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
              );
            })}
        </div>
      </div>


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
