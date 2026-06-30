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
  initialDelay: 2000,
  showCopy: 4500,
  boxAnim: 1600,   // slow expand / collapse
  gap: 700,
  betweenDelay: 2000,
};

/* ── Phase machine ───────────────────────────────────────────────── */
type Phase =
  | "a-delay" | "a-show" | "a-hiding" | "ab-gap"
  | "b-entry" | "b-delay" | "b-show" | "b-hiding"
  | "ba-gap"  | "a-entry";

const DURATION: Record<Phase, number> = {
  "a-delay":  T.initialDelay,
  "a-show":   T.showCopy,
  "a-hiding": T.boxAnim,
  "ab-gap":   T.gap,
  "b-entry":  T.boxAnim,
  "b-delay":  T.betweenDelay,
  "b-show":   T.showCopy,
  "b-hiding": T.boxAnim,
  "ba-gap":   T.gap,
  "a-entry":  T.boxAnim,
};

const NEXT: Record<Phase, Phase> = {
  "a-delay":  "a-show",  "a-show":   "a-hiding",
  "a-hiding": "ab-gap",  "ab-gap":   "b-entry",
  "b-entry":  "b-delay", "b-delay":  "b-show",
  "b-show":   "b-hiding","b-hiding": "ba-gap",
  "ba-gap":   "a-entry", "a-entry":  "a-delay",
};

const T1_TALL_PHASES: Phase[] = ["a-hiding","ab-gap","b-entry","b-delay","b-show","b-hiding","ba-gap"];
const T4_SHORT_PHASES: Phase[] = ["b-entry","b-delay","b-show","b-hiding"];

/* ── Phrase reveal ───────────────────────────────────────────────── */

function PhraseReveal({ phrases }: { phrases: Phrase[] }) {
  // Calculate cumulative delay per phrase
  const WORD_STEP = 0.09;    // seconds between words
  const PHRASE_PAUSE = 0.5;  // seconds between phrases (overridden by pauseBefore)

  let cursor = 0; // running delay in seconds

  return (
    <span>
      {phrases.map((phrase, pi) => {
        const words = phrase.text.split(" ");
        const phraseStart = cursor + (phrase.pauseBefore ? phrase.pauseBefore / 1000 : pi === 0 ? 0 : PHRASE_PAUSE);
        cursor = phraseStart + words.length * WORD_STEP;

        return (
          <span
            key={pi}
            style={{
              display: "block",
              fontWeight: phrase.bold ? 700 : 400,
              marginTop: pi > 0 ? "0.15em" : 0,
            }}
          >
            {words.map((word, wi) => (
              <motion.span
                key={`${pi}-${wi}`}
                className="inline-block"
                style={{ marginRight: "0.28em" }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: phraseStart + wi * WORD_STEP,
                  duration: 0.45,
                  ease: "easeOut",
                }}
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

function CopySlot({ visible, phrases, phaseKey, pref }: {
  visible: boolean; phrases: Phrase[]; phaseKey: string; pref: boolean;
}) {
  return (
    <div
      style={{
        width: "100%", height: "100%",
        display: "flex", alignItems: "center",
        padding: "0 8px",
      }}
    >
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={phaseKey}
            className="font-lore"
            style={{ fontSize: "clamp(0.85rem, 1.3vw, 1.15rem)", lineHeight: 1.45, color: "#1a1a1a" }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            {pref
              ? phrases.map((p, i) => (
                  <span key={i} style={{ display: "block", fontWeight: p.bold ? 700 : 400 }}>
                    {p.text}
                  </span>
                ))
              : <PhraseReveal phrases={phrases} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Tile wrapper — image stays put, just reveals more on expand ─── */

function Tile({
  id, src, type, scaleWhenSmall,
}: {
  id: string; src: string; type: "image" | "gif" | "mp4"; scaleWhenSmall: boolean;
}) {
  return (
    /* overflow hidden is on the parent grid cell */
    <motion.div
      className="w-full h-full"
      /* Subtle zoom: image is slightly enlarged when container is small,
         zooms back to 1× as container grows — image centre stays fixed. */
      animate={{ scale: scaleWhenSmall ? 1.04 : 1.0 }}
      transition={{ duration: T.boxAnim / 1000, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: "center center" }}
    >
      <Media src={src} type={type} className="w-full h-full object-cover object-center" />
    </motion.div>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */

export function HomepageBento({
  media,
  copyA,
  copyB,
}: {
  media: PortfolioMedia[];
  copyA?: string; // unused — copy is hardcoded per design; kept for settings API compat
  copyB?: string;
}) {
  void copyA; void copyB;

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
        const next = NEXT[p];
        setPhase(next);
        schedule(next);
      }, DURATION[p]);
    }
    schedule("a-delay");
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [pref]);

  const t1Tall  = T1_TALL_PHASES.includes(phase);
  const t4Short = T4_SHORT_PHASES.includes(phase);
  const showA   = phase === "a-show";
  const showB   = phase === "b-show";

  const layoutTrans = { duration: T.boxAnim / 1000, ease: [0.22, 1, 0.36, 1] as const };

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
      {/* Tile 1 — expands to cover copy A */}
      <motion.div
        layout
        className="overflow-hidden rounded-xl"
        style={{ gridColumn: 1, gridRow: t1Tall ? "1 / 3" : "1 / 2", zIndex: t1Tall ? 10 : 1 }}
        transition={layoutTrans}
      >
        <Tile id="1" src={src("1")} type={mtype("1")} scaleWhenSmall={!t1Tall} />
      </motion.div>

      {/* Copy A — col 1 row 2, vertically centred */}
      <div style={{ gridColumn: 1, gridRow: "2 / 3", zIndex: 1 }}>
        <CopySlot visible={showA || pref} phrases={COPY_A} phaseKey="a" pref={pref} />
      </div>

      {/* Tile 2 */}
      <div className="overflow-hidden rounded-xl" style={{ gridColumn: 2, gridRow: "1 / 2" }}>
        <Media src={src("2")} type={mtype("2")} className="w-full h-full object-cover" />
      </div>

      {/* Tile 3 */}
      <div className="overflow-hidden rounded-xl" style={{ gridColumn: 2, gridRow: "2 / 3" }}>
        <Media src={src("3")} type={mtype("3")} className="w-full h-full object-cover" />
      </div>

      {/* Tile 4 — collapses to expose copy B */}
      <motion.div
        layout
        className="overflow-hidden rounded-xl"
        style={{ gridColumn: 3, gridRow: t4Short ? "1 / 2" : "1 / 3", zIndex: t4Short ? 1 : 10 }}
        transition={layoutTrans}
      >
        <Tile id="4" src={src("4")} type={mtype("4")} scaleWhenSmall={t4Short} />
      </motion.div>

      {/* Copy B — col 3 row 2, vertically centred */}
      <div style={{ gridColumn: 3, gridRow: "2 / 3", zIndex: 1 }}>
        <CopySlot visible={showB} phrases={COPY_B} phaseKey="b" pref={pref} />
      </div>

      {/* Row 3 */}
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
