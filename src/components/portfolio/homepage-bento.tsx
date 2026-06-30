"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Media } from "./media";
import type { PortfolioMedia } from "@/lib/db-portfolio";

/* ── Default copy ─────────────────────────────────────────────────── */

const DEFAULT_COPY_A =
  "Hey I'm Sam.\nI'm a visual communication\ndesigner, translating complex\nideas into clear storytelling.";
const DEFAULT_COPY_B =
  "With 13 years of experience,\nI have found I enjoy sitting\nat the intersection of\nproduct & brand.";

/* ── Local bento images — replaced per slot once real assets uploaded */
/* Slots 2, 4, 7 are placeholders — see TODO comments. */
const LOCAL: Record<string, string> = {
  "1": "/images/bento/slot-1.jpg", // BOS yellow lemon — correct
  "2": "/images/bento/slot-2.png", // TODO: replace with Walkrr laptop image
  "3": "/images/bento/slot-3.png", // Small Stitch 3D shop — correct
  "4": "/images/bento/slot-4.jpg", // TODO: replace with BOS outdoor tuk-tuk activation
  "5": "/images/bento/slot-5.png", // Temper phones dark green — correct
  "6": "/images/bento/slot-6.png", // Recharge website — correct
  "7": "/images/bento/slot-7.jpg", // TODO: replace with BOS ICE TEA Original colorful can
};

/* ── Animation phases ─────────────────────────────────────────────── */

type Phase = "show-a" | "hiding-a" | "gap" | "show-b" | "hiding-b" | "gap2";

const DURATION: Record<Phase, number> = {
  "show-a": 3500,
  "hiding-a": 700,
  "gap": 800,
  "show-b": 3500,
  "hiding-b": 700,
  "gap2": 800,
};

const NEXT: Record<Phase, Phase> = {
  "show-a": "hiding-a",
  "hiding-a": "gap",
  "gap": "show-b",
  "show-b": "hiding-b",
  "hiding-b": "gap2",
  "gap2": "show-a",
};

/* ── Main component ───────────────────────────────────────────────── */

export function HomepageBento({
  media,
  copyA = DEFAULT_COPY_A,
  copyB = DEFAULT_COPY_B,
}: {
  media: PortfolioMedia[];
  copyA?: string;
  copyB?: string;
}) {
  // DB-uploaded media wins over local files
  const bySlot = Object.fromEntries(media.map((m) => [m.slotId ?? "", m]));

  const [pref, setPref] = useState(false);
  useEffect(() => {
    setPref(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Start with copy A showing
  const [phase, setPhase] = useState<Phase>("show-a");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pref) return;
    function schedule(p: Phase) {
      timer.current = setTimeout(() => {
        const next = NEXT[p];
        setPhase(next);
        schedule(next);
      }, DURATION[p]);
    }
    // Small delay before the first hide so the copy is readable first
    schedule("show-a");
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [pref]);

  const isB = phase === "show-b" || phase === "hiding-b";
  const tile1Expanded = phase === "hiding-a" || phase === "gap" || phase === "hiding-b" || phase === "gap2";
  const copyVisible = phase === "show-a" || phase === "show-b";
  const activeText = isB ? copyB : copyA;

  function src(id: string) {
    const m = bySlot[id];
    return m?.url ?? LOCAL[id] ?? "";
  }
  function type(id: string): "image" | "gif" | "mp4" {
    return (bySlot[id]?.type ?? "image") as "image" | "gif" | "mp4";
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "auto auto auto",
        gap: 12,
        padding: "0 24px 24px",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      {/* ── Column 1 (rows 1+2): tile1 shrinks/grows + copy ──── */}
      <div
        style={{
          gridColumn: 1,
          gridRow: "1 / 3",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Tile 1 — grows to fill when copy is hidden */}
        <motion.div
          className="overflow-hidden rounded-xl bg-neutral-100"
          animate={{ flex: tile1Expanded ? "1 1 100%" : "0 0 auto" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ aspectRatio: tile1Expanded ? undefined : "14 / 9", minHeight: 80 }}
        >
          <Media src={src("1")} type={type("1")} className="w-full h-full object-cover" />
        </motion.div>

        {/* Copy slot — shown by default, hidden when tile1 is expanded */}
        <div className="flex-1 flex items-start">
          <AnimatePresence mode="wait">
            {(copyVisible || pref) && (
              <motion.p
                key={pref ? "static" : activeText.slice(0, 10)}
                className="font-lore whitespace-pre-line select-none leading-snug"
                style={{
                  fontSize: "clamp(1rem, 1.6vw, 1.5rem)",
                  color: "#1a1a1a",
                  lineHeight: 1.3,
                }}
                initial={pref ? {} : { clipPath: "inset(0% 100% 0% 0%)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                exit={pref ? {} : { opacity: 0, transition: { duration: 0.25 } }}
                transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {pref ? copyA : activeText}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Column 2 (rows 1+2): tile2 + tile3 stacked ──────── */}
      <div
        style={{
          gridColumn: 2,
          gridRow: "1 / 3",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          className="overflow-hidden rounded-xl bg-neutral-100 flex-none"
          style={{ aspectRatio: "7 / 5" }}
        >
          <Media src={src("2")} type={type("2")} className="w-full h-full object-cover" />
        </div>
        <div
          className="overflow-hidden rounded-xl bg-neutral-100 flex-none"
          style={{ aspectRatio: "1 / 1" }}
        >
          <Media src={src("3")} type={type("3")} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* ── Column 3 (rows 1+2): tile4 tall portrait ─────────── */}
      <div
        className="overflow-hidden rounded-xl bg-neutral-100"
        style={{ gridColumn: 3, gridRow: "1 / 3" }}
      >
        <Media src={src("4")} type={type("4")} className="w-full h-full object-cover" />
      </div>

      {/* ── Row 3: tile5 + tile6 + tile7 ─────────────────────── */}
      <div
        className="overflow-hidden rounded-xl bg-neutral-100"
        style={{ gridColumn: 1, gridRow: 3, aspectRatio: "6 / 5" }}
      >
        <Media src={src("5")} type={type("5")} className="w-full h-full object-cover" />
      </div>
      <div
        className="overflow-hidden rounded-xl bg-neutral-100"
        style={{ gridColumn: 2, gridRow: 3, aspectRatio: "7 / 5" }}
      >
        <Media src={src("6")} type={type("6")} className="w-full h-full object-cover" />
      </div>
      <div
        className="overflow-hidden rounded-xl bg-neutral-100"
        style={{ gridColumn: 3, gridRow: 3, aspectRatio: "16 / 9" }}
      >
        <Media src={src("7")} type={type("7")} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
