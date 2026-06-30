"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Media } from "./media";
import type { PortfolioMedia } from "@/lib/db-portfolio";

/* ── Default copy (overridden via portfolio_settings) ────────────── */

const DEFAULT_COPY_A =
  "Hey I'm Sam.\nI'm a visual communication\ndesigner, translating complex\nideas into clear storytelling.";
const DEFAULT_COPY_B =
  "With 13 years of experience,\nI have found I enjoy sitting\nat the intersection of\nproduct & brand.";

/* ── Placeholder images per slot (seeded Picsum, stable colours) ── */

const PH: Record<string, string> = {
  "1": "https://picsum.photos/seed/bos-yellow/1120/720",
  "2": "https://picsum.photos/seed/walkrr-laptop/840/600",
  "3": "https://picsum.photos/seed/smallstitch-shop/840/840",
  "4": "https://picsum.photos/seed/bos-activation/840/1240",
  "5": "https://picsum.photos/seed/recharge-phones/1120/920",
  "6": "https://picsum.photos/seed/walkrr-phone/840/600",
  "7": "https://picsum.photos/seed/icetea-can/1120/600",
};

/* ── Animation state machine ─────────────────────────────────────── */

type Phase = "idle" | "reveal-a" | "show-a" | "hide-a" | "reveal-b" | "show-b" | "hide-b";

const DURATION: Record<Phase, number> = {
  idle: 1000,
  "reveal-a": 1500,
  "show-a": 3000,
  "hide-a": 500,
  "reveal-b": 1500,
  "show-b": 3000,
  "hide-b": 500,
};

const NEXT_PHASE: Record<Phase, Phase> = {
  idle: "reveal-a",
  "reveal-a": "show-a",
  "show-a": "hide-a",
  "hide-a": "reveal-b",
  "reveal-b": "show-b",
  "show-b": "hide-b",
  "hide-b": "reveal-a",
};

function phaseReducer(_: Phase, next: Phase) {
  return next;
}

/* ── Main component ──────────────────────────────────────────────── */

export function HomepageBento({
  media,
  copyA = DEFAULT_COPY_A,
  copyB = DEFAULT_COPY_B,
}: {
  media: PortfolioMedia[];
  copyA?: string;
  copyB?: string;
}) {
  const bySlot = Object.fromEntries(media.map((m) => [m.slotId ?? "", m]));

  const [pref, setPref] = useState(false);
  useEffect(() => {
    setPref(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const [phase, advance] = useReducer(phaseReducer, "idle" as Phase);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pref) return;
    function schedule(p: Phase) {
      timer.current = setTimeout(() => {
        const next = NEXT_PHASE[p];
        advance(next);
        schedule(next);
      }, DURATION[p]);
    }
    schedule("idle");
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [pref]);

  // Derived display state
  const tile1Tall = phase === "idle";
  const isB = phase === "reveal-b" || phase === "show-b" || phase === "hide-b";
  const activeText = isB ? copyB : copyA;
  const textIn = phase === "reveal-a" || phase === "show-a" || phase === "reveal-b" || phase === "show-b";
  const copyVisible = phase !== "idle";

  function slot(id: string) {
    const m = bySlot[id];
    return { src: m?.url ?? PH[id] ?? "", type: (m?.type ?? "image") as "image" | "gif" | "mp4" };
  }

  return (
    <div
      className="w-full"
      style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "auto auto auto", gap: 16, padding: "0 24px 24px" }}
    >
      {/* Col 1 — tile1 + copy slot stacked */}
      <div style={{ gridColumn: 1, gridRow: "1 / 3", display: "flex", flexDirection: "column", gap: 16 }}>
        <motion.div
          layout
          animate={{ flex: tile1Tall ? "1 1 auto" : "0 0 auto" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-lg bg-neutral-100"
          style={{ minHeight: 120, ...(!tile1Tall ? { aspectRatio: "14 / 9" } : {}) }}
        >
          <Media src={slot("1").src} type={slot("1").type} className="w-full h-full object-cover" />
        </motion.div>

        <motion.div
          animate={{ opacity: copyVisible ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 flex items-start pl-1 pt-1"
        >
          <AnimatePresence mode="wait">
            {(textIn || pref) && (
              <motion.p
                key={pref ? "static" : activeText.slice(0, 8)}
                className="font-lore whitespace-pre-line select-none"
                style={{ fontSize: "clamp(1.1rem, 2vw, 1.75rem)", lineHeight: 1.35, color: "var(--ink)" }}
                initial={pref ? {} : { clipPath: "inset(0% 100% 0% 0%)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                exit={pref ? {} : { opacity: 0, transition: { duration: 0.25 } }}
                transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {pref ? copyA : activeText}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Col 2 — tile2 (7:5) + tile3 (1:1) stacked */}
      <div style={{ gridColumn: 2, gridRow: "1 / 3", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="overflow-hidden rounded-lg bg-neutral-100 flex-none" style={{ aspectRatio: "7 / 5" }}>
          <Media {...slot("2")} className="w-full h-full object-cover" />
        </div>
        <div className="overflow-hidden rounded-lg bg-neutral-100 flex-none" style={{ aspectRatio: "1 / 1" }}>
          <Media {...slot("3")} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Col 3 — tile4, tall portrait spanning rows 1-2 */}
      <div className="overflow-hidden rounded-lg bg-neutral-100" style={{ gridColumn: 3, gridRow: "1 / 3" }}>
        <Media {...slot("4")} className="w-full h-full object-cover" />
      </div>

      {/* Row 3 — tile5, tile6, tile7 */}
      <div className="overflow-hidden rounded-lg bg-neutral-100" style={{ gridColumn: 1, gridRow: 3, aspectRatio: "6 / 5" }}>
        <Media {...slot("5")} className="w-full h-full object-cover" />
      </div>
      <div className="overflow-hidden rounded-lg bg-neutral-100" style={{ gridColumn: 2, gridRow: 3, aspectRatio: "7 / 5" }}>
        <Media {...slot("6")} className="w-full h-full object-cover" />
      </div>
      <div className="overflow-hidden rounded-lg bg-neutral-100" style={{ gridColumn: 3, gridRow: 3, aspectRatio: "28 / 15" }}>
        <Media {...slot("7")} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
