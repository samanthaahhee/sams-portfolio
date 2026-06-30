"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Media } from "./media";
import type { PortfolioMedia } from "@/lib/db-portfolio";

/* ── Copy — phrase-based with bold finale ────────────────────────── */
type Phrase = { text: string; bold?: true; pauseBefore?: number };

const COPY_A: Phrase[] = [
  { text: "Hey I'm Sam." },
  { text: "I'm a visual communication designer,", pauseBefore: 500 },
  { text: "translating complex ideas into clear storytelling.", bold: true, pauseBefore: 500 },
];
const COPY_B: Phrase[] = [
  { text: "With 13 years of experience," },
  { text: "I have found I enjoy sitting", pauseBefore: 500 },
  { text: "at the intersection of product & brand.", bold: true, pauseBefore: 500 },
];

/* ── Local images (TODO: replace slots 2, 4, 7) ─────────────────── */
const LOCAL: Record<string, string> = {
  "1": "/images/bento/slot-1.jpg",
  "2": "/images/bento/slot-2.png",
  "3": "/images/bento/slot-3.png",
  "4": "/images/bento/slot-4.jpg",
  "5": "/images/bento/slot-5.png",
  "6": "/images/bento/slot-6.png",
  "7": "/images/bento/slot-7.jpg",
};

const NAV_H = 56;

/* ── Timing ──────────────────────────────────────────────────────── */
const T = {
  initialDelay: 2000,   // before first words appear
  showCopy:     4500,   // hold copy on screen
  boxAnim:      1600,   // slow box expand / collapse
  gap:           600,
  betweenDelay: 2000,   // after box settles before next copy appears
};

/* ── Phase machine ───────────────────────────────────────────────── */
// Boxes that animate:
//   tile4 (col3): COLLAPSES rows1+2 → row1 to expose copy-B slot
//   tile5 (col1): EXPANDS row3 → rows2+3 to cover copy-A slot
// Both animate simultaneously.
type Phase =
  | "a-delay"    // tile4 tall, tile5 short — waiting before copy A
  | "a-show"     // copy A word-by-word visible
  | "switching"  // copy A fades, tile4 collapses, tile5 expands (simultaneous)
  | "b-delay"    // waiting before copy B
  | "b-show"     // copy B word-by-word visible
  | "restoring"; // copy B fades, tile4 expands, tile5 collapses (simultaneous)

const DURATION: Record<Phase, number> = {
  "a-delay":   T.initialDelay,
  "a-show":    T.showCopy,
  "switching": T.boxAnim + T.gap,   // box anim + settling gap
  "b-delay":   T.betweenDelay,
  "b-show":    T.showCopy,
  "restoring": T.boxAnim + T.gap,
};
const NEXT: Record<Phase, Phase> = {
  "a-delay":   "a-show",
  "a-show":    "switching",
  "switching": "b-delay",
  "b-delay":   "b-show",
  "b-show":    "restoring",
  "restoring": "a-delay",
};

// Phases where tile5 is expanded (rows 2+3) and tile4 is short (row 1)
const SWAP_PHASES: Phase[] = ["switching", "b-delay", "b-show", "restoring"];

/* ── Phrase reveal ───────────────────────────────────────────────── */
function PhraseReveal({ phrases }: { phrases: Phrase[] }) {
  const WORD_STEP = 0.09;
  let cursor = 0;

  return (
    <span>
      {phrases.map((phrase, pi) => {
        const words = phrase.text.split(" ");
        const start = cursor + (phrase.pauseBefore ? phrase.pauseBefore / 1000 : pi === 0 ? 0 : 0.4);
        cursor = start + words.length * WORD_STEP;
        return (
          <span
            key={pi}
            style={{ display: "block", fontWeight: phrase.bold ? 700 : 400, marginTop: pi > 0 ? "0.12em" : 0 }}
          >
            {words.map((word, wi) => (
              <motion.span
                key={`${pi}-${wi}`}
                className="inline-block"
                style={{ marginRight: "0.28em" }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: start + wi * WORD_STEP, duration: 0.45, ease: "easeOut" }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        );
      })}
    </span>
  );
}

/* ── Copy slot ───────────────────────────────────────────────────── */
function CopySlot({
  visible, phrases, phaseKey, pref, paddingLeft = 8,
}: {
  visible: boolean; phrases: Phrase[]; phaseKey: string; pref: boolean; paddingLeft?: number;
}) {
  return (
    <div
      style={{
        width: "100%", height: "100%",
        display: "flex", alignItems: "center",
        paddingLeft, paddingRight: 8,
      }}
    >
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={phaseKey}
            className="font-lore"
            style={{ fontSize: "clamp(0.85rem, 1.3vw, 1.15rem)", lineHeight: 1.45, color: "#1a1a1a" }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
          >
            {pref
              ? phrases.map((p, i) => (
                  <span key={i} style={{ display: "block", fontWeight: p.bold ? 700 : 400 }}>{p.text}</span>
                ))
              : <PhraseReveal phrases={phrases} />
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */
export function HomepageBento({
  media,
}: {
  media: PortfolioMedia[];
  copyA?: string;
  copyB?: string;
}) {
  const bySlot = Object.fromEntries(media.map((m) => [m.slotId ?? "", m]));
  const src   = (id: string) => bySlot[id]?.url ?? LOCAL[id] ?? "";
  const mtype = (id: string) => (bySlot[id]?.type ?? "image") as "image" | "gif" | "mp4";

  const [pref, setPref] = useState(false);
  useEffect(() => {
    setPref(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const [phase, setPhase] = useState<Phase>("a-delay");
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
    schedule("a-delay");
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [pref]);

  const swapped = SWAP_PHASES.includes(phase);
  const showA   = phase === "a-show";
  const showB   = phase === "b-show";

  // Framer layout transition — slow to match the brief
  const layoutTrans = { duration: T.boxAnim / 1000, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div
      style={{
        height: `calc(100vh - ${NAV_H}px)`,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr 1.15fr",
        gap: 10,
        padding: "10px 20px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* ── Tile 1 — BOS yellow, NEVER animates, always col1 row1 ── */}
      <div className="overflow-hidden rounded-xl" style={{ gridColumn: 1, gridRow: "1 / 2" }}>
        <Media src={src("1")} type={mtype("1")} className="w-full h-full object-cover object-top" />
      </div>

      {/* ── Copy A — col1 row2, vertically centred ───────────────── */}
      <div style={{ gridColumn: 1, gridRow: "2 / 3", zIndex: 1 }}>
        <CopySlot visible={showA || pref} phrases={COPY_A} phaseKey="a" pref={pref} paddingLeft={4} />
      </div>

      {/* ── Tile 5 — Temper phones, EXPANDS upward over copy A ───── */}
      {/* objectPosition: bottom keeps the image's bottom anchored   */}
      {/* as the container grows upward — image doesn't appear to move */}
      <motion.div
        layout
        className="overflow-hidden rounded-xl"
        style={{
          gridColumn: 1,
          gridRow: swapped ? "2 / 4" : "3 / 4",
          zIndex: swapped ? 10 : 1,
        }}
        transition={layoutTrans}
      >
        <Media
          src={src("5")}
          type={mtype("5")}
          className="w-full h-full object-cover"
          style={{ objectPosition: "bottom center" }}
        />
      </motion.div>

      {/* ── Tile 2 — Walkrr laptop, col2 row1 ───────────────────── */}
      <div className="overflow-hidden rounded-xl" style={{ gridColumn: 2, gridRow: "1 / 2" }}>
        <Media src={src("2")} type={mtype("2")} className="w-full h-full object-cover object-top" />
      </div>

      {/* ── Tile 3 — Small Stitch, col2 row2 ────────────────────── */}
      <div className="overflow-hidden rounded-xl" style={{ gridColumn: 2, gridRow: "2 / 3" }}>
        <Media src={src("3")} type={mtype("3")} className="w-full h-full object-cover" />
      </div>

      {/* ── Tile 6 — Recharge, col2 row3 ────────────────────────── */}
      <div className="overflow-hidden rounded-xl" style={{ gridColumn: 2, gridRow: "3 / 4" }}>
        <Media src={src("6")} type={mtype("6")} className="w-full h-full object-cover object-top" />
      </div>

      {/* ── Tile 4 — BOS outdoor, COLLAPSES to expose copy B ──────  */}
      {/* objectPosition: top keeps the image top anchored as        */}
      {/* the container shrinks from the bottom — no visual movement */}
      <motion.div
        layout
        className="overflow-hidden rounded-xl"
        style={{
          gridColumn: 3,
          gridRow: swapped ? "1 / 2" : "1 / 3",
          zIndex: swapped ? 1 : 10,
        }}
        transition={layoutTrans}
      >
        <Media
          src={src("4")}
          type={mtype("4")}
          className="w-full h-full object-cover"
          style={{ objectPosition: "top center" }}
        />
      </motion.div>

      {/* ── Copy B — col3 row2, with left padding ────────────────── */}
      <div style={{ gridColumn: 3, gridRow: "2 / 3", zIndex: 1 }}>
        <CopySlot visible={showB} phrases={COPY_B} phaseKey="b" pref={pref} paddingLeft={16} />
      </div>

      {/* ── Tile 7 — BOS ICE TEA, col3 row3 ─────────────────────── */}
      <div className="overflow-hidden rounded-xl" style={{ gridColumn: 3, gridRow: "3 / 4" }}>
        <Media src={src("7")} type={mtype("7")} className="w-full h-full object-cover object-top" />
      </div>
    </div>
  );
}
