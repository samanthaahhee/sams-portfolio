"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Media } from "./media";
import type { PortfolioMedia } from "@/lib/db-portfolio";

/* ── Copy ─────────────────────────────────────────────────────────── */

const COPY_A = "Hey I'm Sam. I'm a visual communication designer, translating complex ideas into clear storytelling.";
const COPY_B = "With 13 years of experience, I have found I enjoy sitting at the intersection of product & brand.";

/* ── Local images ────────────────────────────────────────────────── */
const LOCAL: Record<string, string> = {
  "1": "/images/bento/slot-1.jpg",
  "2": "/images/bento/slot-2.png", // TODO: Walkrr laptop
  "3": "/images/bento/slot-3.png",
  "4": "/images/bento/slot-4.jpg", // TODO: BOS outdoor tuk-tuk
  "5": "/images/bento/slot-5.png",
  "6": "/images/bento/slot-6.png",
  "7": "/images/bento/slot-7.jpg", // TODO: BOS ICE TEA original
};

const NAV_H = 56;

/* ── Timing (ms) ─────────────────────────────────────────────────── */
const T = {
  initialDelay: 2000,   // before first words appear
  showCopy: 4000,       // hold copy visible after words finish
  boxExpand: 1400,      // tile animates to cover copy (slow)
  boxCollapse: 1400,    // tile animates to reveal copy (slow)
  gap: 700,             // pause between phases
  betweenDelay: 2000,   // delay after box settles before words appear
};

/* ── Phase state machine ─────────────────────────────────────────── */
// Sequence:
//   a-delay → a-show → a-hiding → ab-gap → b-entry → b-delay
//   → b-show → b-hiding → ba-gap → a-entry → a-delay → ...

type Phase =
  | "a-delay"   // tile1 short, tile4 tall — waiting 2s
  | "a-show"    // copy A words appearing + showing
  | "a-hiding"  // tile1 expanding to cover copy A
  | "ab-gap"    // brief pause
  | "b-entry"   // tile4 collapsing to expose col3-row2
  | "b-delay"   // tile4 short — waiting 2s
  | "b-show"    // copy B words appearing + showing
  | "b-hiding"  // tile4 expanding to cover copy B
  | "ba-gap"    // brief pause
  | "a-entry";  // tile1 collapsing back to row1 only

const DURATION: Record<Phase, number> = {
  "a-delay":  T.initialDelay,
  "a-show":   T.showCopy,
  "a-hiding": T.boxExpand,
  "ab-gap":   T.gap,
  "b-entry":  T.boxCollapse,
  "b-delay":  T.betweenDelay,
  "b-show":   T.showCopy,
  "b-hiding": T.boxExpand,
  "ba-gap":   T.gap,
  "a-entry":  T.boxCollapse,
};

const NEXT_PHASE: Record<Phase, Phase> = {
  "a-delay":  "a-show",
  "a-show":   "a-hiding",
  "a-hiding": "ab-gap",
  "ab-gap":   "b-entry",
  "b-entry":  "b-delay",
  "b-delay":  "b-show",
  "b-show":   "b-hiding",
  "b-hiding": "ba-gap",
  "ba-gap":   "a-entry",
  "a-entry":  "a-delay",
};

/* Derive visual state from phase */
function tile1Tall(p: Phase) {
  return ["a-hiding", "ab-gap", "b-entry", "b-delay", "b-show", "b-hiding", "ba-gap"].includes(p);
}
function tile4Short(p: Phase) {
  return ["b-entry", "b-delay", "b-show", "b-hiding"].includes(p);
}

/* ── Word-by-word reveal ─────────────────────────────────────────── */

function WordReveal({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block"
          style={{ marginRight: "0.28em" }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.09, duration: 0.45, ease: "easeOut" }}
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

/* ── Shared copy slot ────────────────────────────────────────────── */

function CopySlot({
  visible,
  text,
  phaseKey,
  pref,
}: {
  visible: boolean;
  text: string;
  phaseKey: string;
  pref: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "0 4px",
      }}
    >
      <AnimatePresence mode="wait">
        {visible && (
          <motion.p
            key={phaseKey}
            className="font-lore"
            style={{
              fontSize: "clamp(0.9rem, 1.4vw, 1.25rem)",
              lineHeight: 1.4,
              color: "#1a1a1a",
            }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            {pref ? text : <WordReveal text={text} />}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */

export function HomepageBento({
  media,
  copyA = COPY_A,
  copyB = COPY_B,
}: {
  media: PortfolioMedia[];
  copyA?: string;
  copyB?: string;
}) {
  const bySlot = Object.fromEntries(media.map((m) => [m.slotId ?? "", m]));
  const src = (id: string) => bySlot[id]?.url ?? LOCAL[id] ?? "";
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
        const next = NEXT_PHASE[p];
        setPhase(next);
        schedule(next);
      }, DURATION[p]);
    }
    schedule("a-delay");
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [pref]);

  const t1Tall = tile1Tall(phase);
  const t4Short = tile4Short(phase);
  const showA = phase === "a-show";
  const showB = phase === "b-show";

  // Framer Motion layout transition — slow, matches box expand speed
  const layoutTransition = { duration: T.boxExpand / 1000, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div
      style={{
        height: `calc(100vh - ${NAV_H}px)`,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr 1.1fr",
        gap: 10,
        padding: "10px 20px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* ── Tile 1 — expands to cover copy A ──────────────────────── */}
      <motion.div
        layout
        className="overflow-hidden rounded-xl"
        style={{
          gridColumn: 1,
          gridRow: t1Tall ? "1 / 3" : "1 / 2",
          zIndex: t1Tall ? 10 : 1,
        }}
        transition={layoutTransition}
      >
        <Media src={src("1")} type={mtype("1")} className="w-full h-full object-cover" />
      </motion.div>

      {/* ── Copy A — col 1, row 2 (vertically centred) ───────────── */}
      <div style={{ gridColumn: 1, gridRow: "2 / 3", zIndex: 1 }}>
        <CopySlot
          visible={showA || (pref)}
          text={copyA}
          phaseKey="a"
          pref={pref}
        />
      </div>

      {/* ── Tile 2 — col 2, row 1 ────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl" style={{ gridColumn: 2, gridRow: "1 / 2" }}>
        <Media src={src("2")} type={mtype("2")} className="w-full h-full object-cover" />
      </div>

      {/* ── Tile 3 — col 2, row 2 (Small Stitch square) ──────────── */}
      <div className="overflow-hidden rounded-xl" style={{ gridColumn: 2, gridRow: "2 / 3" }}>
        <Media src={src("3")} type={mtype("3")} className="w-full h-full object-cover" />
      </div>

      {/* ── Tile 4 — collapses to expose copy B ──────────────────── */}
      <motion.div
        layout
        className="overflow-hidden rounded-xl"
        style={{
          gridColumn: 3,
          gridRow: t4Short ? "1 / 2" : "1 / 3",
          zIndex: t4Short ? 1 : 10,
        }}
        transition={layoutTransition}
      >
        <Media src={src("4")} type={mtype("4")} className="w-full h-full object-cover" />
      </motion.div>

      {/* ── Copy B — col 3, row 2 (vertically centred) ───────────── */}
      <div style={{ gridColumn: 3, gridRow: "2 / 3", zIndex: 1 }}>
        <CopySlot
          visible={showB}
          text={copyB}
          phaseKey="b"
          pref={pref}
        />
      </div>

      {/* ── Row 3 ─────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl" style={{ gridColumn: 1, gridRow: "3 / 4" }}>
        <Media src={src("5")} type={mtype("5")} className="w-full h-full object-cover" />
      </div>
      <div className="overflow-hidden rounded-xl" style={{ gridColumn: 2, gridRow: "3 / 4" }}>
        <Media src={src("6")} type={mtype("6")} className="w-full h-full object-cover" />
      </div>
      <div className="overflow-hidden rounded-xl" style={{ gridColumn: 3, gridRow: "3 / 4" }}>
        <Media src={src("7")} type={mtype("7")} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
