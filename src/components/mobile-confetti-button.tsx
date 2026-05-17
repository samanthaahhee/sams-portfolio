"use client";

import { useRef } from "react";
import confetti from "canvas-confetti";

/**
 * Mobile-only outlined confetti button. Fires a canvas-confetti burst
 * from the button's centre on tap. Uses the site's pastel palette.
 */

const COLORS = [
  "#f1e3a8", "#e89478", "#c8b8d8", "#7c8a6c",
  "#b8d4c0", "#e8b8b8", "#c08068", "#e8a04b", "#6b7c5a",
];

export function MobileConfettiButton({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);

  const fire = () => {
    const button = ref.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    confetti({
      colors: COLORS,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      particleCount: 60,
      spread: 110,
      startVelocity: 38,
      gravity: 1,
      scalar: 1.4,
      shapes: ["square"],
      ticks: 220,
    });
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={fire}
      className={`inline-flex items-center font-mono uppercase tracking-[0.14em] px-10 py-6 rounded-full border-2 transition-all hover:scale-[1.03] active:scale-[0.98] ${className}`}
      style={{
        background: "transparent",
        color: "var(--ink)",
        borderColor: "var(--ink)",
        fontSize: "22px",
      }}
    >
      + Throw confetti
    </button>
  );
}
