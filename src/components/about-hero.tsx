"use client";

import { motion } from "motion/react";
import { profile } from "@/lib/about";

/**
 * Hero block for /about — bold headline split into words for staggered
 * fade-in, a `.halftone-fine` backdrop, and floating accent stickers.
 * All animation gates through `prefers-reduced-motion` via the global
 * fallback in globals.css.
 */
export function AboutHero() {
  const words = profile.headline.split(" ");
  return (
    <section className="relative px-[var(--spacing-page)] pt-16 md:pt-24 pb-16 md:pb-24 overflow-hidden">
      {/* Halftone backdrop. Sits behind everything at low opacity so it
          reads as paper texture rather than a hard pattern. */}
      <div
        aria-hidden
        className="halftone-fine absolute inset-0 pointer-events-none"
        style={{ opacity: 0.08 }}
      />

      <div className="relative grid grid-cols-12 gap-4">
        <p className="col-span-12 font-mono text-[color:var(--meta)] mb-6">
          Volume 01 · A CV in menu form · Est. MMXXVI
        </p>

        <motion.h1
          className="col-span-12 md:col-span-11 font-display"
          style={{
            fontSize: "var(--text-d1)",
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
            maxWidth: "16ch",
          }}
        >
          {words.map((w, i) => {
            const isLast = i === words.length - 1;
            const trimmed = isLast ? w.replace(/\.$/, "") : w;
            return (
              <motion.span
                key={`${w}-${i}`}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: i * 0.15,
                  duration: 0.7,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                className="inline-block mr-[0.25em]"
              >
                {trimmed}
                {isLast && (
                  <span
                    aria-hidden
                    style={{ color: "var(--pair-b)" }}
                  >
                    .
                  </span>
                )}
              </motion.span>
            );
          })}
        </motion.h1>

        <p
          className="col-span-12 md:col-span-8 md:col-start-2 mt-10 md:mt-14 text-base md:text-xl leading-relaxed text-[color:var(--ink-soft)]"
        >
          {profile.subhead}
        </p>

        {/* Meta strip — location · email · LinkedIn · portfolio. */}
        <ul className="col-span-12 md:col-span-10 md:col-start-2 mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[color:var(--meta)]">
          <li>{profile.location}</li>
          <li aria-hidden className="opacity-50">·</li>
          <li>
            <a
              href={`mailto:${profile.email}`}
              className="underline underline-offset-4 hover:text-[color:var(--ink)] transition-colors"
            >
              {profile.email}
            </a>
          </li>
          <li aria-hidden className="opacity-50">·</li>
          <li>
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-[color:var(--ink)] transition-colors"
            >
              LinkedIn ↗
            </a>
          </li>
          <li aria-hidden className="opacity-50">·</li>
          <li>
            <a
              href={profile.links.portfolio}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-[color:var(--ink)] transition-colors"
            >
              Portfolio ↗
            </a>
          </li>
        </ul>
      </div>

      {/* Floating stickers — positioned absolutely, gentle wobble. */}
      <Stickers />

      {/* Scroll prompt — fades in after the headline, pulses. */}
      <motion.p
        className="absolute left-1/2 -translate-x-1/2 bottom-3 font-mono text-[color:var(--meta)] flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          Scroll
        </motion.span>
        <span aria-hidden>↓</span>
      </motion.p>
    </section>
  );
}

/* ── Stickers ───────────────────────────────────────────────────────── */

type StickerProps = {
  top: string;
  left?: string;
  right?: string;
  rotate: number;
  delay: number;
  children: React.ReactNode;
};

function Sticker({ top, left, right, rotate, delay, children }: StickerProps) {
  return (
    <motion.div
      aria-hidden
      className="absolute pointer-events-none"
      style={{ top, left, right }}
      initial={{ scale: 0, rotate: rotate - 20, opacity: 0 }}
      animate={{ scale: 1, rotate, opacity: 1 }}
      transition={{
        delay,
        duration: 0.7,
        ease: [0.2, 0.8, 0.2, 1],
      }}
    >
      <motion.div
        animate={{ rotate: [rotate - 2, rotate + 2, rotate - 2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Stickers() {
  return (
    <>
      {/* Sparkle (top right) */}
      <Sticker top="14%" right="6%" rotate={8} delay={0.3}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 4 L27 21 L44 24 L27 27 L24 44 L21 27 L4 24 L21 21 Z"
            fill="var(--pair-b)"
          />
        </svg>
      </Sticker>

      {/* Heart (mid right) */}
      <Sticker top="38%" right="10%" rotate={-12} delay={0.55}>
        <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
          <path
            d="M20 33 C 4 22 0 12 8 6 C 13 2 18 5 20 9 C 22 5 27 2 32 6 C 40 12 36 22 20 33 Z"
            fill="var(--pair-a)"
            stroke="var(--ink)"
            strokeWidth="1.5"
          />
        </svg>
      </Sticker>

      {/* Pill chip — Product (top left) */}
      <Sticker top="44%" left="3%" rotate={-6} delay={0.4}>
        <span
          className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full"
          style={{
            background: "var(--pair-a)",
            color: "var(--pair-a-ink)",
            border: "1px solid var(--ink)",
          }}
        >
          Product
        </span>
      </Sticker>

      {/* Pill chip — Brand (lower right) */}
      <Sticker top="68%" right="14%" rotate={5} delay={0.7}>
        <span
          className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full"
          style={{
            background: "var(--paper)",
            color: "var(--ink)",
            border: "1px solid var(--ink)",
          }}
        >
          Brand
        </span>
      </Sticker>

      {/* Star (lower left) */}
      <Sticker top="72%" left="8%" rotate={14} delay={0.85}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 2 L17 11 L26 11 L19 17 L21 26 L14 21 L7 26 L9 17 L2 11 L11 11 Z"
            fill="var(--pair-b)"
          />
        </svg>
      </Sticker>

      {/* Dot accent (top left) */}
      <Sticker top="22%" left="9%" rotate={0} delay={1}>
        <span
          className="block rounded-full"
          style={{
            width: 14,
            height: 14,
            background: "var(--pair-b)",
          }}
        />
      </Sticker>
    </>
  );
}
