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
  // Three-stop gradient sampled from the most-saturated, well-spaced
  // pixels in the front card. Drives the section background.
  const [bgGradient, setBgGradient] = useState<string[]>([
    "#3a1632",
    "#2a1626",
    "#170a0d",
  ]);

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
        // Pass 1 — sum every pixel for the bg average + collect a
        // candidate list of saturated, medium-bright pixels.
        type Candidate = { r: number; g: number; b: number; score: number };
        const candidates: Candidate[] = [];
        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i], pg = data[i + 1], pb = data[i + 2];
          r += pr;
          g += pg;
          b += pb;
          const mx = Math.max(pr, pg, pb);
          const mn = Math.min(pr, pg, pb);
          if (mx === 0) continue;
          const sat = (mx - mn) / mx;
          const light = (mx + mn) / 510;
          const score = sat * (1 - Math.abs(light - 0.55) * 1.1);
          if (score > 0.05) candidates.push({ r: pr, g: pg, b: pb, score });
        }
        // Pick the top 3 well-separated candidates so the gradient
        // shows real variation rather than three near-identical hues.
        candidates.sort((a, b) => b.score - a.score);
        const picked: Candidate[] = [];
        const FALLBACK: Candidate[] = [
          { r: 244, g: 184, b: 208, score: 0 }, // pink
          { r: 201, g: 124, b: 194, score: 0 }, // magenta
          { r: 155, g: 111, b: 182, score: 0 }, // violet
        ];
        for (const c of candidates) {
          if (picked.length >= 3) break;
          const tooClose = picked.some(
            (p) => Math.hypot(p.r - c.r, p.g - c.g, p.b - c.b) < 55,
          );
          if (!tooClose) picked.push(c);
        }
        while (picked.length < 3) picked.push(FALLBACK[picked.length]);
        const [c0, c1, c2] = picked;
        const aR = c0.r, aG = c0.g, aB = c0.b;

        // Per-card overrides win — only apply auto values where the
        // override is unset.
        if (!card.bgColor) {
          const f = 0.585;
          setBgColor(
            `rgb(${Math.round((r / n) * f)}, ${Math.round((g / n) * f)}, ${Math.round((b / n) * f)})`,
          );
        }
        const boost = (n: number) => Math.min(255, Math.round(n * 1.15));
        if (!card.accentColor) {
          setAccentColor(`rgb(${boost(aR)}, ${boost(aG)}, ${boost(aB)})`);
        }
        // Build the background gradient — desaturate AND dim each
        // picked colour so the bg reads as a soft, muted wash rather
        // than punchy candy colours.
        //   sat 0.35 → blend 65 % toward neutral grey (kills the pop)
        //   bri 0.40 → multiply brightness ×0.40 (deep but not black)
        const mute = (cR: number, cG: number, cB: number) => {
          const avg = (cR + cG + cB) / 3;
          const sat = 0.35;
          const bri = 0.4;
          const ch = (c: number) => Math.round((avg + (c - avg) * sat) * bri);
          return `rgb(${ch(cR)}, ${ch(cG)}, ${ch(cB)})`;
        };
        if (!card.bgColor) {
          setBgGradient([
            mute(c0.r, c0.g, c0.b),
            mute(c1.r, c1.g, c1.b),
            mute(c2.r, c2.g, c2.b),
          ]);
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
        height: "100vh",
        minHeight: 640,
        // Solid base + image-sampled 3-stop gradient layered on top so
        // the colour fades transition smoothly between cards.
        background: `linear-gradient(160deg, ${bgGradient[0]} 0%, ${bgGradient[1]} 55%, ${bgGradient[2]} 100%), ${bgColor}`,
        transition: "background 900ms ease",
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

      {/* ── Faint background wordmark — Figma PNG, sits behind
          everything for texture. ────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/sam-ahhee.png"
          alt=""
          aria-hidden
          className="w-full h-full object-contain"
          style={{ opacity: 0.18, transform: "translateY(-10px) scale(1.15)" }}
        />
      </div>

      {/* ── Top — title (left) + nav (right) ────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-start justify-between gap-6 px-[var(--spacing-page)] pt-8 md:pt-10 text-white">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <h1
            className="font-display font-bold tracking-[-0.02em] leading-none"
            style={{ fontSize: "clamp(1.5rem, 2.2vw, 2rem)" }}
          >
            Sam Ahhee
          </h1>
          <p className="mt-1.5 text-white/75 text-xs md:text-sm">
            Visual Comms Designer
          </p>
        </Link>
        <nav className="flex items-center gap-6 md:gap-10 font-display text-sm md:text-base">
          <Link href="/#selected-work" className="hover:opacity-70 transition-opacity">
            Work
          </Link>
          <a
            href="/files/Sam-ahhee-Schneider-CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity"
          >
            Experience
          </a>
          <Link href="/about-me" className="hover:opacity-70 transition-opacity">
            About
          </Link>
          <Link href="/contact" className="hover:opacity-70 transition-opacity">
            Contact
          </Link>
        </nav>
      </div>

      {/* ── Fanned deck — dead centre on the viewport. */}
      <div
        className="absolute z-20 flex items-center justify-center top-1/2 left-1/2"
        style={{ transform: "translate(-50%, calc(-50% - 12px))" }}
      >
        <div
          className="relative"
          style={{
            // Optimised for MacBook Pro 16" (1728×1117 logical px) —
            // 45vw on that viewport = 778px, capped at 780. Smaller
            // viewports clamp down via the vw value; min 240px keeps
            // it readable on phones.
            width: "clamp(200px, 38vw, 660px)",
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

      {/* ── Bottom — centred bio paragraph ───────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pb-8 md:pb-12 px-[var(--spacing-page)] text-center text-white/85">
        <p className="text-[12px] md:text-[13px] leading-relaxed max-w-[68ch] mx-auto">
          Art director and visual communicator with 13+ years of
          experience helping people understand and connect with brands
          through visual storytelling across campaigns, digital, print,
          events, and everything in between.
        </p>
      </div>
    </div>
  );
}
