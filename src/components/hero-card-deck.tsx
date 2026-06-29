"use client";

/**
 * Fanned-card-deck hero — every case study + project as a tilted
 * card stacked in the centre of the viewport. The deck auto-shuffles
 * every few seconds: the front card flips to the back, every other
 * card shifts one slot forward. Click any card to open that piece.
 *
 * Slots
 *   slot 0 = front (smallest rotation, highest z-index)
 *   slot N-1 = back (largest rotation, lowest z-index)
 *
 * Each card computes its visual position from its slot, so when the
 * shuffle moves `front` forward by one, every card transitions to a
 * new transform in lockstep.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export type DeckCard = {
  href: string;
  src: string;
  title: string;
  client?: string | null;
};

export function HeroCardDeck({
  cards,
  /** ms between shuffles. */
  shuffleEvery = 2800,
  /** Max number of cards in the fan. More than ~6 gets crowded. */
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
        minHeight: 560,
        background: "#1a0d10",
      }}
    >
      {/* Soft mood lighting */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(120,40,30,0.35) 0%, transparent 60%)",
        }}
      />

      {/* Short bio, top-left */}
      <div className="absolute top-6 md:top-10 left-[var(--spacing-page)] z-40 max-w-[26ch] md:max-w-[34ch]">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55 mb-2">
          About
        </p>
        <p className="text-white/90 text-[12px] md:text-[13px] leading-relaxed">
          A multidisciplinary designer with 13+ years across FMCG,
          fintech and consumer tech. From Cape Town, based in
          Amsterdam &mdash; working across brand, product, illustration
          and visual communication.
        </p>
      </div>

      {/* The fan — biased slightly upward so the deepest cards don't
          drop into the bottom info strip. */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ paddingBottom: "8vh" }}
      >
        <div
          className="relative"
          style={{ width: "min(36vw, 380px)", aspectRatio: "3 / 4" }}
        >
          {shown.map((c, i) => {
            const slot = (i - front + N) % N;
            const t = N === 1 ? 0 : slot / (N - 1); // 0 (front) → 1 (back)
            // Fan out alternating left/right, growing offset as we move back.
            const direction = slot % 2 === 0 ? 1 : -1;
            const rot = direction * (3 + slot * 4);
            const xPct = direction * (slot * 6); // % of card width
            const yPct = slot * 2.2;
            const scale = 1 - slot * 0.035;
            return (
              <Link
                key={`${c.href}-${i}`}
                href={c.href}
                aria-label={c.title}
                className="absolute inset-0 rounded-md overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,0.65)] hp-card group"
                style={{
                  zIndex: 100 - slot,
                  transform: `translate(${xPct}%, ${yPct}%) rotate(${rot}deg) scale(${scale})`,
                  transition:
                    "transform 900ms cubic-bezier(.22,.61,.36,1), opacity 900ms ease",
                  opacity: 1 - t * 0.25,
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
                {/* Subtle gradient so the label always reads */}
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)",
                  }}
                />
                {/* Card label — top-left, like the reference */}
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
                {/* Bottom-right index pill */}
                <span className="absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/70 px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                  {String(i + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom info strip */}
      <div className="absolute left-0 right-0 bottom-0 px-[var(--spacing-page)] pb-5 md:pb-8 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.14em] text-white/80">
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
