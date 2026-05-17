"use client";

import { useState } from "react";
import { motion } from "motion/react";

/**
 * Paper confetti rectangles — fewer pieces, 70% opacity, realistic
 * spring-based fall. Lands and STAYS truly still (DOM elements don't
 * jitter the way a canvas redraw loop can).
 *
 *   - 10 initial pieces on/around the image
 *   - Each piece springs into its final resting position with natural
 *     deceleration (high stiffness, moderate damping → no bounce, but
 *     real "weight" to the fall).
 *   - Continuous tumble (1–3 rotations) during the fall.
 *   - 70% opacity at rest.
 *   - "+ More confetti" drops 6 more pieces from above each click.
 */

const PALETTE = [
  "#f1e3a8", "#e89478", "#c8b8d8", "#7c8a6c",
  "#b8d4c0", "#e8b8b8", "#c08068", "#e8a04b", "#6b7c5a",
];

type Dot = {
  id: number;
  x: number;        // % of (wider) container
  y: number;
  w: number;        // px
  h: number;
  color: string;
  finalRotate: number;
  spins: number;
  fallDelay: number;
  fallDuration: number;
  startX: number;   // px offset from final at start (horizontal drift)
};

let nextId = 100;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function makeFallProfile() {
  return {
    // Half a spin (180°) over the whole fall, with a touch of jitter
    spins: 0.5 + rand(-0.05, 0.05),
    fallDelay: rand(0, 0.25),
    fallDuration: rand(0.7, 1.0),
    startX: rand(-40, 40),
  };
}

function makeRandomDot(): Dot {
  return {
    id: nextId++,
    x: rand(8, 92),
    y: rand(8, 90),
    w: rand(28, 52),
    h: rand(90, 170),
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    finalRotate: rand(-70, 70),
    ...makeFallProfile(),
  };
}

/* Initial rectangles — now spread across a much wider area so more
 * pieces land to the LEFT and RIGHT of the photo, not just on it.
 * Container is widened below to give the side-pieces somewhere to go. */
const INITIAL_DOTS: Dot[] = [
  // Far left
  { id: 1,  x: 4,  y: 22, w: 38, h: 124, color: "#e89478", finalRotate: -42, ...makeFallProfile() },
  { id: 2,  x: 12, y: 58, w: 32, h: 100, color: "#7c8a6c", finalRotate: 56,  ...makeFallProfile() },
  { id: 3,  x: 8,  y: 86, w: 40, h: 132, color: "#b8d4c0", finalRotate: -28, ...makeFallProfile() },
  // Mid-left
  { id: 4,  x: 26, y: 10, w: 36, h: 112, color: "#f1e3a8", finalRotate: 22,  ...makeFallProfile() },
  { id: 5,  x: 32, y: 70, w: 42, h: 136, color: "#c8b8d8", finalRotate: -16, ...makeFallProfile() },
  // On / near the photo
  { id: 6,  x: 48, y: 38, w: 44, h: 140, color: "#e8a04b", finalRotate: 30,  ...makeFallProfile() },
  { id: 7,  x: 56, y: 14, w: 30, h: 96,  color: "#c08068", finalRotate: -50, ...makeFallProfile() },
  // Mid-right
  { id: 8,  x: 70, y: 60, w: 38, h: 124, color: "#e8b8b8", finalRotate: 44,  ...makeFallProfile() },
  { id: 9,  x: 78, y: 22, w: 34, h: 108, color: "#6b7c5a", finalRotate: -32, ...makeFallProfile() },
  // Far right
  { id: 10, x: 92, y: 12, w: 30, h: 100, color: "#f1e3a8", finalRotate: 60,  ...makeFallProfile() },
  { id: 11, x: 94, y: 48, w: 40, h: 132, color: "#c8b8d8", finalRotate: -24, ...makeFallProfile() },
  { id: 12, x: 88, y: 84, w: 36, h: 116, color: "#e89478", finalRotate: 38,  ...makeFallProfile() },
];

export function FloatingConfetti() {
  const [dots, setDots] = useState<Dot[]>(INITIAL_DOTS);

  const more = () => {
    const extras = Array.from({ length: 6 }, () => makeRandomDot());
    setDots((prev) => [...prev, ...extras]);
  };

  return (
    <>
      <div
        className="absolute -top-[15%] -bottom-[15%] -left-[80%] -right-[60%] pointer-events-none overflow-visible"
        aria-hidden
      >
        {dots.map((d) => (
          <motion.div
            key={d.id}
            initial={{
              y: -380 - d.h,
              x: d.startX,
              rotate: 0,
              opacity: 0,
            }}
            animate={{
              y: 0,
              x: 0,
              rotate: d.finalRotate + 360 * d.spins,
              opacity: 0.7,
            }}
            transition={{
              // Smooth gravity feel — accelerates fast, decelerates softly
              // into the landing (no rigid stop, no slow tail)
              y: {
                duration: d.fallDuration,
                delay: d.fallDelay,
                ease: [0.42, 0.0, 0.18, 1.0],
              },
              x: {
                duration: d.fallDuration,
                delay: d.fallDelay,
                ease: [0.42, 0.0, 0.18, 1.0],
              },
              rotate: {
                duration: d.fallDuration,
                delay: d.fallDelay,
                ease: [0.42, 0.0, 0.18, 1.0],
              },
              opacity: { duration: 0.3, delay: d.fallDelay },
            }}
            className="absolute"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.w,
              height: d.h,
              background: d.color,
              boxShadow:
                "0 3px 5px rgba(40,28,18,0.14), 0 6px 14px rgba(40,28,18,0.07)",
            }}
          />
        ))}
      </div>

      {/* + More confetti */}
      <button
        type="button"
        onClick={more}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 font-mono uppercase tracking-[0.14em] px-5 py-2.5 rounded-full transition-all hover:scale-[1.04] active:scale-[0.98] z-20"
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          fontSize: "10px",
        }}
      >
        + More confetti
      </button>
    </>
  );
}
