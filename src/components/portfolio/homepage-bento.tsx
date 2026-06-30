"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Media } from "./media";
import type { PortfolioMedia } from "@/lib/db-portfolio";

/* ── Copy ─────────────────────────────────────────────────────────── */
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
  "2": "/images/bento/slot-2.png",
  "3": "/images/bento/slot-3.png",
  "4": "/images/bento/slot-4.jpg",
  "5": "/images/bento/slot-5.png",
  "6": "/images/bento/slot-6.png",
  "7": "/images/bento/slot-7.jpg",
};

const NAV_H = 56;

/* ── Row proportions (must match gridTemplateRows below) ─────────── */
// gridTemplateRows: "1fr 1fr 1.15fr" → total 3.15fr
// col3-rows1+2 wrapper spans rows 1+2 (2fr total):
//   tile4 collapsed = row1 only = 1/2 = 50%
//   copy B slot     = row2      = 50%
// col1-rows2+3 wrapper spans rows 2+3 (2.15fr total):
//   copy A slot     = row2 only = 1/2.15 ≈ 46.5%
//   tile5 collapsed = row3 only = 1.15/2.15 ≈ 53.5%
//   tile5 expanded  = 100%
const TILE4_COLLAPSED_PCT = "50%";
const TILE5_COLLAPSED_PCT = "53.5%";
const COPY_A_HEIGHT_PCT   = "46.5%";
const COPY_B_HEIGHT_PCT   = "50%";

/* ── Timing ──────────────────────────────────────────────────────── */
const T = {
  initialDelay: 2000,
  showCopy:     4500,
  boxAnim:      1500,
  gap:           500,
  betweenDelay: 2000,
};

/* ── Phase machine ───────────────────────────────────────────────── */
type Phase = "a-delay"|"a-show"|"switching"|"b-delay"|"b-show"|"restoring";

const DURATION: Record<Phase,number> = {
  "a-delay":   T.initialDelay,
  "a-show":    T.showCopy,
  "switching": T.boxAnim + T.gap,
  "b-delay":   T.betweenDelay,
  "b-show":    T.showCopy,
  "restoring": T.boxAnim + T.gap,
};
const NEXT: Record<Phase,Phase> = {
  "a-delay":"a-show","a-show":"switching","switching":"b-delay",
  "b-delay":"b-show","b-show":"restoring","restoring":"a-delay",
};
const SWAPPED: Phase[] = ["switching","b-delay","b-show","restoring"];

/* ── Phrase reveal ───────────────────────────────────────────────── */
function PhraseReveal({ phrases }: { phrases: Phrase[] }) {
  let cursor = 0;
  return (
    <span>
      {phrases.map((phrase, pi) => {
        const words  = phrase.text.split(" ");
        const start  = cursor + (phrase.pauseBefore ? phrase.pauseBefore / 1000 : pi === 0 ? 0 : 0.4);
        cursor = start + words.length * 0.09;
        return (
          <span key={pi} style={{ display:"block", fontWeight: phrase.bold ? 700 : 400, marginTop: pi > 0 ? "0.12em" : 0 }}>
            {words.map((word, wi) => (
              <motion.span
                key={`${pi}-${wi}`}
                className="inline-block"
                style={{ marginRight:"0.28em" }}
                initial={{ opacity:0, y:4 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay: start + wi*0.09, duration:0.45, ease:"easeOut" }}
              >{word}</motion.span>
            ))}
          </span>
        );
      })}
    </span>
  );
}

/* ── Copy slot ───────────────────────────────────────────────────── */
function CopySlot({ visible, phrases, phaseKey, pref, pl=8 }: {
  visible:boolean; phrases:Phrase[]; phaseKey:string; pref:boolean; pl?:number;
}) {
  return (
    <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",paddingLeft:pl,paddingRight:8 }}>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div key={phaseKey} className="font-lore"
            style={{ fontSize:"clamp(0.85rem,1.3vw,1.15rem)", lineHeight:1.45, color:"#1a1a1a" }}
            exit={{ opacity:0, transition:{ duration:0.35 } }}
          >
            {pref
              ? phrases.map((p,i)=><span key={i} style={{display:"block",fontWeight:p.bold?700:400}}>{p.text}</span>)
              : <PhraseReveal phrases={phrases}/>
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Static image (never rescales — container clips it) ──────────── */
// The image is absolutely positioned at its natural proportional size.
// Only the overflow-hidden container above it changes height.
function StaticImg({ src, type, anchor="top" }: {
  src:string; type:"image"|"gif"|"mp4"; anchor?:"top"|"bottom";
}) {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden" }}>
      <Media
        src={src} type={type}
        className="w-full h-full object-cover"
        style={{ objectPosition: anchor==="top" ? "top center" : "bottom center" }}
      />
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */
export function HomepageBento({ media }: { media:PortfolioMedia[]; copyA?:string; copyB?:string }) {
  const bySlot = Object.fromEntries(media.map(m=>[m.slotId??"",m]));
  const src   = (id:string) => bySlot[id]?.url ?? LOCAL[id] ?? "";
  const mtype = (id:string) => (bySlot[id]?.type ?? "image") as "image"|"gif"|"mp4";

  const [pref, setPref] = useState(false);
  useEffect(()=>{
    setPref(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  },[]);

  const [phase, setPhase] = useState<Phase>("a-delay");
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{
    if(pref) return;
    function schedule(p:Phase){
      timer.current = setTimeout(()=>{ const next=NEXT[p]; setPhase(next); schedule(next); }, DURATION[p]);
    }
    schedule("a-delay");
    return ()=>{ if(timer.current) clearTimeout(timer.current); };
  },[pref]);

  const swapped = SWAPPED.includes(phase);
  const showA   = phase === "a-show";
  const showB   = phase === "b-show";

  const boxTrans = { duration: T.boxAnim/1000, ease:[0.22,1,0.36,1] as const };

  return (
    <div style={{
      height:`calc(100vh - ${NAV_H}px)`,
      display:"grid",
      gridTemplateColumns:"1fr 1fr 1fr",
      gridTemplateRows:"1fr 1fr 1.15fr",
      gap:10, padding:"10px 20px 20px", boxSizing:"border-box",
    }}>

      {/* ── Tile 1 — BOS yellow, static, col1 row1 ─────────────── */}
      <div className="overflow-hidden rounded-xl" style={{gridColumn:1,gridRow:"1/2"}}>
        <StaticImg src={src("1")} type={mtype("1")} anchor="top"/>
      </div>

      {/* ── Col1 rows2+3 zone: copy A (top) + tile5 (bottom clip) ─ */}
      {/* The zone always spans rows2+3. Inside, the tile5 image     */}
      {/* clips upward; image never rescales, only its clip changes. */}
      <div style={{gridColumn:1,gridRow:"2/4",position:"relative"}}>

        {/* Copy A — occupies the top portion of the zone */}
        <div style={{
          position:"absolute", top:0, left:0, right:0,
          height: COPY_A_HEIGHT_PCT,
        }}>
          <CopySlot visible={showA||pref} phrases={COPY_A} phaseKey="a" pref={pref} pl={4}/>
        </div>

        {/* Tile 5 clip — grows upward to cover copy A */}
        {/* Only this div's height animates; image inside stays still */}
        <motion.div
          animate={{ height: swapped ? "100%" : TILE5_COLLAPSED_PCT }}
          transition={boxTrans}
          style={{
            position:"absolute", bottom:0, left:0, right:0,
            overflow:"hidden", borderRadius:"0 0 10px 10px",
          }}
        >
          <StaticImg src={src("5")} type={mtype("5")} anchor="bottom"/>
        </motion.div>
      </div>

      {/* ── Tile 2 — col2 row1 ──────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl" style={{gridColumn:2,gridRow:"1/2"}}>
        <StaticImg src={src("2")} type={mtype("2")} anchor="top"/>
      </div>

      {/* ── Tile 3 — col2 row2 ──────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl" style={{gridColumn:2,gridRow:"2/3"}}>
        <StaticImg src={src("3")} type={mtype("3")} anchor="top"/>
      </div>

      {/* ── Tile 6 — col2 row3 ──────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl" style={{gridColumn:2,gridRow:"3/4"}}>
        <StaticImg src={src("6")} type={mtype("6")} anchor="top"/>
      </div>

      {/* ── Col3 rows1+2 zone: tile4 (top clip) + copy B (bottom) ─ */}
      {/* Zone always spans rows1+2. Tile4 image clips downward.     */}
      <div style={{gridColumn:3,gridRow:"1/3",position:"relative",borderRadius:10,overflow:"hidden"}}>

        {/* Tile 4 clip — shrinks downward to reveal copy B */}
        <motion.div
          animate={{ height: swapped ? TILE4_COLLAPSED_PCT : "100%" }}
          transition={boxTrans}
          style={{
            position:"absolute", top:0, left:0, right:0,
            overflow:"hidden", borderRadius:"10px 10px 0 0",
          }}
        >
          <StaticImg src={src("4")} type={mtype("4")} anchor="top"/>
        </motion.div>

        {/* Copy B — sits at bottom, revealed when tile4 shrinks */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          height: COPY_B_HEIGHT_PCT,
        }}>
          <CopySlot visible={showB} phrases={COPY_B} phaseKey="b" pref={pref} pl={16}/>
        </div>
      </div>

      {/* ── Tile 7 — col3 row3 ──────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl" style={{gridColumn:3,gridRow:"3/4"}}>
        <StaticImg src={src("7")} type={mtype("7")} anchor="top"/>
      </div>
    </div>
  );
}
