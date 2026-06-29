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
  /** Optional override — used as the wordmark colour when this card
   *  is at the front of the deck. Falls back to auto-sampled accent. */
  accentColor?: string | null;
  /** Optional override — used as the section background when this
   *  card is at the front. Falls back to auto-sampled background. */
  bgColor?: string | null;
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
  const [bgColor, setBgColor] = useState("#170a0d");
  const [accentColor, setAccentColor] = useState(PINK);

  useEffect(() => {
    if (N <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(
      () => setFront((f) => (f + 1) % N),
      shuffleEvery,
    );
    return () => window.clearInterval(t);
  }, [N, shuffleEvery]);

  // Sample the front card's average colour and use it (darkened) as
  // the page background. Per-card overrides (accentColor / bgColor)
  // win if present — we still kick off a sample for any side that's
  // unspecified so the override mixes with auto for the other.
  useEffect(() => {
    const card = shown[front];
    if (!card) return;
    // Apply overrides immediately so there's no flash of auto colour.
    if (card.bgColor) setBgColor(card.bgColor);
    if (card.accentColor) setAccentColor(card.accentColor);

    // If both are overridden, no need to sample at all.
    if (card.bgColor && card.accentColor) return;

    const src = card.src;
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        const W = 16;
        const H = 16;
        c.width = W;
        c.height = H;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, W, H);
        const data = ctx.getImageData(0, 0, W, H).data;

        // Average pixel — used (darkened) for the section background.
        let r = 0, g = 0, b = 0;
        const n = data.length / 4;
        // Track the most saturated, medium-bright pixel — used as the
        // wordmark accent so it always reads as the image's "pop".
        let bestScore = -1;
        let aR = 244, aG = 184, aB = 208; // PINK fallback
        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i], pg = data[i + 1], pb = data[i + 2];
          r += pr;
          g += pg;
          b += pb;
          const mx = Math.max(pr, pg, pb);
          const mn = Math.min(pr, pg, pb);
          if (mx === 0) continue;
          const sat = (mx - mn) / mx;
          const light = (mx + mn) / 510; // 0..1
          // Prefer saturated, not too dark or washed out.
          const score = sat * (1 - Math.abs(light - 0.55) * 1.1);
          if (score > bestScore) {
            bestScore = score;
            aR = pr;
            aG = pg;
            aB = pb;
          }
        }

        // Per-card overrides win — only apply auto values where the
        // override is unset.
        if (!card.bgColor) {
          const f = 0.585;
          setBgColor(
            `rgb(${Math.round((r / n) * f)}, ${Math.round((g / n) * f)}, ${Math.round((b / n) * f)})`,
          );
        }
        if (!card.accentColor) {
          const boost = 1.18;
          const ar = Math.min(255, Math.round(aR * boost));
          const ag = Math.min(255, Math.round(aG * boost));
          const ab = Math.min(255, Math.round(aB * boost));
          setAccentColor(`rgb(${ar}, ${ag}, ${ab})`);
        }
      } catch {
        /* tainted canvas — keep current bg */
      }
    };
    img.src = src;
  }, [front, shown]);

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{
        height: "calc(100vh - 56px)",
        minHeight: 640,
        background: bgColor,
        transition: "background-color 900ms ease",
      }}
    >
      {/* Soft vignette so the centre stays darker than the edges */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      {/* ── Wordmark layer — "Sam" on top, "Ahhee" on bottom, both
          centred horizontally and stacked vertically behind the
          deck. Only the colour transitions on shuffle. */}
      {(() => {
        const baseType = {
          fontSize: "clamp(5rem, 22vw, 18rem)",
          color: accentColor,
          lineHeight: 0.85,
          letterSpacing: "-0.03em",
          transition: "color 900ms ease",
        } as const;
        return (
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between items-center py-4 md:py-8 px-[var(--spacing-page)] text-white text-center">
            <h1 className="font-display" style={baseType}>
              Sam
            </h1>
            <h1 className="font-display" style={baseType}>
              Ahhee
            </h1>
          </div>
        );
      })()}

      {/* ── Fanned deck — centred over the wordmark. */}
      <div
        className="absolute z-20 flex items-center justify-center top-1/2 left-1/2"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <div
          className="relative"
          style={{
            width: "clamp(240px, 48vw, 640px)",
            aspectRatio: "4 / 3",
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


    </div>
  );
}
