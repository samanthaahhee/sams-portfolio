"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PortfolioMedia } from "@/lib/db-portfolio";

/* ── Copy ─────────────────────────────────────────────────────────── */
type Phrase = { text: string; bold?: true; pauseBefore?: number; inline?: true };

const COPY_A: Phrase[] = [
  { text: "Hey I'm Sam." },
  { text: "I'm a", pauseBefore: 500 },
  { text: "visual communication designer,", bold: true, inline: true, pauseBefore: 200 },
];
const COPY_B: Phrase[] = [
  { text: "From" },
  { text: "13 years", bold: true, inline: true, pauseBefore: 150 },
  { text: "of experience, I have found I enjoy closing the gap between product and brand.", pauseBefore: 500 },
];

/* ── Local images ────────────────────────────────────────────────── */
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

const T = {
  initialDelay: 2000,
  showCopy: 7500,  // ~2.5s animation + 4s reading pause
  boxAnim: 1500,
  gap: 500,
  betweenDelay: 2000,
};

type Phase = "a-delay" | "a-show" | "switching" | "b-delay" | "b-show" | "restoring";

const DURATION: Record<Phase, number> = {
  "a-delay": T.initialDelay,
  "a-show": T.showCopy,
  "switching": T.boxAnim + T.gap,
  "b-delay": T.betweenDelay,
  "b-show": T.showCopy,
  "restoring": T.boxAnim + T.gap,
};
const NEXT: Record<Phase, Phase> = {
  "a-delay": "a-show", "a-show": "switching", "switching": "b-delay",
  "b-delay": "b-show", "b-show": "restoring", "restoring": "a-delay",
};
const SWAPPED: Phase[] = ["switching", "b-delay", "b-show", "restoring"];

/* ── Phrase reveal ───────────────────────────────────────────────── */
function PhraseReveal({ phrases }: { phrases: Phrase[] }) {
  let cursor = 0;
  return (
    <span>
      {phrases.map((phrase, pi) => {
        const words = phrase.text.split(" ");
        const start = cursor + (phrase.pauseBefore ? phrase.pauseBefore / 1000 : pi === 0 ? 0 : 0.4);
        cursor = start + words.length * 0.09;
        // If this phrase OR the next phrase is inline, render inline so they flow on one line
        const isInline = phrase.inline || phrases[pi + 1]?.inline;
        return (
          <span key={pi} style={{ display: isInline ? "inline" : "block", fontWeight: phrase.bold ? 700 : 400, marginTop: pi > 0 && !isInline ? "0.12em" : 0 }}>
            {words.map((word, wi) => (
              <motion.span
                key={`${pi}-${wi}`}
                className="inline-block"
                style={{ marginRight: "0.28em" }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: start + wi * 0.09, duration: 0.45, ease: "easeOut" }}
              >{word}</motion.span>
            ))}
          </span>
        );
      })}
    </span>
  );
}

function CopySlot({ visible, phrases, phaseKey, pref, pl = 8 }: {
  visible: boolean; phrases: Phrase[]; phaseKey: string; pref: boolean; pl?: number;
}) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", paddingLeft: pl, paddingRight: 16, paddingTop: 12, paddingBottom: 12, boxSizing: "border-box", overflow: "hidden" }}>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div key={phaseKey} className="font-lore"
            style={{ fontSize: "clamp(0.85rem,1.3vw,1.15rem)", lineHeight: 1.45, color: "#1a1a1a" }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
          >
            {pref
              ? phrases.map((p, i) => <span key={i} style={{ display: "block", fontWeight: p.bold ? 700 : 400 }}>{p.text}</span>)
              : <PhraseReveal phrases={phrases} />
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Simple tile: normal img, fills container ────────────────────── */
function Tile({ src, objectPosition = "center top" }: { src: string; objectPosition?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="eager"
      decoding="async"
      className="w-full h-full"
      style={{ objectFit: "cover", objectPosition, display: "block" }}
    />
  );
}

/* ── Animated tile: image fixed in place, only clip changes ─────── */
// The outer container (positioned by CSS grid) has position:relative.
// Inside: a motion.div whose HEIGHT animates — this is the clip window.
// The <img> inside the clip is position:absolute at full container size,
// anchored at top or bottom. Only the clip changes, the image never moves.
function AnimatedClip({
  src,
  height,
  anchor,
  transition,
  style,
}: {
  src: string;
  height: string;
  anchor: "top" | "bottom";
  transition: object;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      animate={{ height }}
      transition={transition}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        ...(anchor === "top" ? { top: 0 } : { bottom: 0 }),
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Image is sized to fill the full parent ZONE (not just the clip).
          It uses position:absolute anchored at top/bottom so it never
          repositions when the clip height changes. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="eager"
        decoding="async"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          ...(anchor === "top" ? { top: 0 } : { bottom: 0 }),
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: anchor === "top" ? "top center" : "bottom center",
          display: "block",
        }}
      />
    </motion.div>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */
export function HomepageBento({ media }: { media: PortfolioMedia[]; copyA?: string; copyB?: string }) {
  const bySlot = Object.fromEntries(media.map(m => [m.slotId ?? "", m]));
  const src = (id: string) => bySlot[id]?.url ?? LOCAL[id] ?? "";

  const [pref, setPref] = useState(false);
  useEffect(() => {
    setPref(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const [phase, setPhase] = useState<Phase>("a-delay");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (pref) return;
    function schedule(p: Phase) {
      timer.current = setTimeout(() => { const next = NEXT[p]; setPhase(next); schedule(next); }, DURATION[p]);
    }
    schedule("a-delay");
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [pref]);

  const swapped = SWAPPED.includes(phase);
  const showA = phase === "a-show";
  const showB = phase === "b-show";
  const boxTrans = { duration: T.boxAnim / 1000, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div style={{
      height: `calc(100vh - ${NAV_H}px)`,
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gridTemplateRows: "1fr 1fr 1.15fr",
      gap: 10,
      padding: "10px 20px 20px",
      boxSizing: "border-box",
    }}>

      {/* Tile 1 — BOS yellow, static */}
      <div className="rounded-xl overflow-hidden" style={{ gridColumn: 1, gridRow: "1/2" }}>
        <Tile src={src("1")} />
      </div>

      {/* Col1 rows 2+3 zone — copy A at top, tile5 clips upward from bottom */}
      {/* position:relative is REQUIRED so absolutely-positioned children work */}
      <div style={{ gridColumn: 1, gridRow: "2/4", position: "relative", borderRadius: 10, overflow: "hidden" }}>
        {/* Copy A — fixed at top, 46.5% of zone height */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "46.5%" }}>
          <CopySlot visible={showA || pref} phrases={COPY_A} phaseKey="a" pref={pref} pl={4} />
        </div>

        {/* Tile5 clip — grows upward from bottom to cover copy A */}
        <AnimatedClip
          src={src("5")}
          anchor="bottom"
          height={swapped ? "100%" : "53.5%"}
          transition={boxTrans}
        />
      </div>

      {/* Tile 2 — Walkrr laptop */}
      <div className="rounded-xl overflow-hidden" style={{ gridColumn: 2, gridRow: "1/2" }}>
        <Tile src={src("2")} />
      </div>

      {/* Tile 3 — Small Stitch */}
      <div className="rounded-xl overflow-hidden" style={{ gridColumn: 2, gridRow: "2/3" }}>
        <Tile src={src("3")} objectPosition="center" />
      </div>

      {/* Tile 6 — Recharge */}
      <div className="rounded-xl overflow-hidden" style={{ gridColumn: 2, gridRow: "3/4" }}>
        <Tile src={src("6")} />
      </div>

      {/* Col3 rows 1+2 zone — tile4 clips down from top, copy B at bottom */}
      <div style={{ gridColumn: 3, gridRow: "1/3", position: "relative", borderRadius: 10, overflow: "hidden" }}>
        {/* Tile4 clip — shrinks downward from top to reveal copy B */}
        <AnimatedClip
          src={src("4")}
          anchor="top"
          height={swapped ? "50%" : "100%"}
          transition={boxTrans}
        />

        {/* Copy B — fixed at bottom, 50% of zone height */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%" }}>
          <CopySlot visible={showB} phrases={COPY_B} phaseKey="b" pref={pref} pl={16} />
        </div>
      </div>

      {/* Tile 7 — BOS ICE TEA */}
      <div className="rounded-xl overflow-hidden" style={{ gridColumn: 3, gridRow: "3/4" }}>
        <Tile src={src("7")} />
      </div>
    </div>
  );
}
