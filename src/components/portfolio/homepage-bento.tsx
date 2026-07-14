"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import type { PortfolioMedia } from "@/lib/db-portfolio";

/* ── Copy ─────────────────────────────────────────────────────────────
   Art-directed layout: each line carries its own left indent (in em, so it
   scales with the text), and each token its own size (em multiplier) + weight.
   `indent` and `s` (size) are the two knobs to tune positioning against the
   reference mockups. A "cluster" line renders the 3-part PRODUCT / AND / BRAND
   arrangement. All values are easy to nudge in the live preview.            */
type Tok = { t: string; b?: true; s?: number };
type Line =
  | { kind?: "line"; indent?: number; toks: Tok[] }
  | { kind: "cluster"; indent?: number; left: string[]; conj: string; right: string[] };

const BIG = 1.5; // size multiplier for the emphasised bold words

const COPY_A: Line[] = [
  { indent: 0,   toks: [{ t: "I'm Sam, I am a senior" }] },
  { indent: 1.4, toks: [{ t: "visual communications", b: true, s: BIG }] },
  { indent: 2.2, toks: [{ t: "designer", b: true, s: BIG }, { t: "translating complex" }] },
  { indent: 4,   toks: [{ t: "ideas into clear storytelling" }] },
];
const COPY_B: Line[] = [
  { indent: 3,   toks: [{ t: "13 years of experience" }] },
  { indent: 0.5, toks: [{ t: "has taught me that I do my" }] },
  { indent: 2,   toks: [{ t: "best work" }, { t: "bridging", b: true, s: 1.45 }] },
  { kind: "cluster", indent: 2.8, left: ["product", "experience"], conj: "and", right: ["brand", "storytelling"] },
];

/* ── Mobile copy ──────────────────────────────────────────────────────
   Mobile is copy-only (no bento). Lines are centred; `mt` adds an em of
   space above a line for the paragraph breaks in the mockup.            */
type MobileLine = { toks: Tok[]; mt?: number };

const M_COPY_A: MobileLine[] = [
  { toks: [{ t: "I'm Sam," }] },
  { toks: [{ t: "I am a senior" }], mt: 0.7 },
  { toks: [{ t: "visual comms", b: true, s: BIG }], mt: 0.15 },
  { toks: [{ t: "designer", b: true, s: BIG }] },
  { toks: [{ t: "translating complex" }], mt: 0.25 },
  { toks: [{ t: "ideas into clear" }] },
  { toks: [{ t: "storytelling." }] },
];
const M_COPY_B: MobileLine[] = [
  { toks: [{ t: "13 years" }] },
  { toks: [{ t: "of experience" }] },
  { toks: [{ t: "has taught me that" }] },
  { toks: [{ t: "I do my best work" }] },
  { toks: [{ t: "bridging", b: true, s: BIG }], mt: 0.35 },
  { toks: [{ t: "product experience", b: true }], mt: 0.2 },
  { toks: [{ t: "and" }, { t: "brand", b: true }] },
  { toks: [{ t: "storytelling", b: true }] },
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
  copyDelay: 1800,  // pause before the copy appears (both A and B)
  showCopy: 7500,   // copy visible + reading time
  hideDelay: 1000,  // pause after copy disappears before the boxes scale
  boxAnim: 1500,    // box height animation
};

// Flow: rest → wait → show copy A → hide → scale boxes → wait → show copy B
//       → hide → scale boxes back → loop
type Phase =
  | "a-delay" | "a-show" | "a-hide" | "switching"
  | "b-delay" | "b-show" | "b-hide" | "restoring";

const DURATION: Record<Phase, number> = {
  "a-delay": T.copyDelay,
  "a-show": T.showCopy,
  "a-hide": T.hideDelay,
  "switching": T.boxAnim,
  "b-delay": T.copyDelay,
  "b-show": T.showCopy,
  "b-hide": T.hideDelay,
  "restoring": T.boxAnim,
};
const NEXT: Record<Phase, Phase> = {
  "a-delay": "a-show", "a-show": "a-hide", "a-hide": "switching", "switching": "b-delay",
  "b-delay": "b-show", "b-show": "b-hide", "b-hide": "restoring", "restoring": "a-delay",
};
// Boxes are in the swapped position (tile5 up, tile4 collapsed) from the moment
// they start scaling (switching) until they start scaling back (restoring).
const SWAPPED: Phase[] = ["switching", "b-delay", "b-show", "b-hide"];

/* ── Word reveal ─────────────────────────────────────────────────────
   Each word fades/rises in on mount with a staggered delay. A running index
   (`RevealCtx.i`) is threaded through the whole block so words reveal in
   reading order across lines and clusters.                                  */
const STEP = 0.09; // seconds between words

function Word({ text, bold, size, delay, block, instant }: {
  text: string; bold?: boolean; size?: number; delay: number; block?: boolean; instant?: boolean;
}) {
  return (
    <motion.span
      style={{
        display: block ? "block" : "inline-block",
        fontWeight: bold ? 700 : 400,
        fontSize: size ? `${size}em` : undefined,
        lineHeight: 1.1,
      }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: instant ? 0 : delay, duration: instant ? 0 : 0.45, ease: "easeOut" }}
    >
      {text}
    </motion.span>
  );
}

function CopyBlock({ lines, instant }: { lines: Line[]; instant?: boolean }) {
  const ctx = { i: 0 };
  const nextDelay = () => ctx.i++ * STEP;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.18em" }}>
      {lines.map((ln, li) => {
        if (ln.kind === "cluster") {
          // Stacks are bold and sit slightly lower; "and" centres vertically
          // between the two 2-line bold stacks (alignItems center).
          return (
            <div key={li} style={{ paddingLeft: `${ln.indent ?? 0}em`, display: "flex", alignItems: "center", gap: "0.7em", marginTop: "0.1em" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.05 }}>
                {ln.left.map((w, wi) => <Word key={wi} text={w} bold delay={nextDelay()} block instant={instant} />)}
              </div>
              <Word text={ln.conj} delay={nextDelay()} instant={instant} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.05 }}>
                {ln.right.map((w, wi) => <Word key={wi} text={w} bold delay={nextDelay()} block instant={instant} />)}
              </div>
            </div>
          );
        }
        return (
          <div key={li} style={{ paddingLeft: `${ln.indent ?? 0}em`, display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: "0.28em", rowGap: 0 }}>
            {ln.toks.flatMap((tk, ti) =>
              tk.t.split(" ").map((w, wi) => (
                <Word key={`${ti}-${wi}`} text={w} bold={tk.b} size={tk.s} delay={nextDelay()} instant={instant} />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

function CopySlot({ visible, lines, phaseKey, pref, pl = 8, pr = 14, instant, center }: {
  visible: boolean; lines: Line[]; phaseKey: string; pref: boolean; pl?: number; pr?: number; instant?: boolean; center?: boolean;
}) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: center ? "center" : "flex-start", paddingLeft: center ? 12 : pl, paddingRight: center ? 12 : pr, boxSizing: "border-box" }}>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div key={phaseKey} className="font-lore"
            style={{ fontSize: "clamp(0.8rem,1.25vw,1.1rem)", lineHeight: 1.3, color: "#1a1a1a" }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
          >
            <CopyBlock lines={lines} instant={pref || instant} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Mobile copy block — centred lines, same word reveal ──────────── */
function MobileCopyBlock({ lines, instant }: { lines: MobileLine[]; instant?: boolean }) {
  const ctx = { i: 0 };
  const nextDelay = () => ctx.i++ * STEP;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.45em" }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", columnGap: "0.28em", rowGap: 0, marginTop: ln.mt ? `${ln.mt}em` : 0 }}>
          {ln.toks.flatMap((tk, ti) =>
            tk.t.split(" ").map((w, wi) => (
              <Word key={`${ti}-${wi}`} text={w} bold={tk.b} size={tk.s} delay={nextDelay()} instant={instant} />
            ))
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Mobile hero — copy only, A ↔ B on a reading rhythm ───────────── */
const MOBILE_SHOW = 6500; // reveal (~2s) + ~4s reading hold before it swaps

function MobileHero({ pref }: { pref: boolean }) {
  const [idx, setIdx] = useState(0); // 0 = message A, 1 = message B
  useEffect(() => {
    if (pref) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % 2), MOBILE_SHOW);
    return () => clearInterval(t);
  }, [pref]);

  return (
    <div
      style={{
        minHeight: `calc(100vh - ${NAV_H}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "13vh", // nudged down, like the reference
        paddingLeft: 28,
        paddingRight: 28,
        paddingBottom: "6vh",
        boxSizing: "border-box",
      }}
    >
      {/* Fixed-height copy area (font +20%) so the button lands in the SAME
          place for both messages regardless of their line count. */}
      <div
        style={{
          fontSize: "clamp(1.26rem, 6vw, 1.8rem)",
          height: "14em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            className="font-lore"
            style={{ lineHeight: 1.4, color: "#1a1a1a" }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
          >
            <MobileCopyBlock lines={idx === 0 ? M_COPY_A : M_COPY_B} instant={pref} />
          </motion.div>
        </AnimatePresence>
      </div>

      <Link
        href="/work"
        className="font-portfolio-sans hover:opacity-70 transition-opacity"
        style={{
          marginTop: "2.5rem",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          border: "1.5px solid #1a1a1a",
          borderRadius: 9999,
          padding: "15px 28px",
          fontSize: 17,
          color: "#1a1a1a",
          whiteSpace: "nowrap",
        }}
      >
        Explore my archive <span aria-hidden>→</span>
      </Link>
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
  borderRadius = "10px",
  style,
}: {
  src: string;
  height: string;
  anchor: "top" | "bottom";
  transition: object;
  borderRadius?: string;
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
        borderRadius,
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
  // mounted guards against SSR/hydration mismatch; isMobile picks the layout.
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setPref(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    setMounted(true);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const [phase, setPhase] = useState<Phase>("a-delay");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (pref || isMobile) return; // desktop-only box/copy loop
    function schedule(p: Phase) {
      timer.current = setTimeout(() => { const next = NEXT[p]; setPhase(next); schedule(next); }, DURATION[p]);
    }
    schedule("a-delay");
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [pref, isMobile]);

  // Debug helper: set to "a" or "b" to freeze that copy fully visible for
  // tuning the typography indents in preview. Leave null in normal operation.
  const DEBUG_COPY: "a" | "b" | null = null;
  const swapped = DEBUG_COPY === "b" ? true : DEBUG_COPY === "a" ? false : SWAPPED.includes(phase);
  const showA = DEBUG_COPY === "a" ? true : phase === "a-show";
  const showB = DEBUG_COPY === "b" ? true : phase === "b-show";
  const debugInstant = DEBUG_COPY !== null;
  const boxTrans = { duration: T.boxAnim / 1000, ease: [0.22, 1, 0.36, 1] as const };

  // Hold layout until we know the viewport, to avoid a flash of the wrong one.
  if (!mounted) return <div style={{ height: `calc(100vh - ${NAV_H}px)` }} />;
  // Mobile: copy-only hero, no bento grid.
  if (isMobile) return <MobileHero pref={pref} />;

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
        {/* Copy A — white space above tile5 (row2 + the row gap) */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "calc(46.5% + 5px)" }}>
          <CopySlot visible={showA || pref} lines={COPY_A} phaseKey="a" pref={pref} instant={debugInstant} center />
        </div>

        {/* Tile5 clip — collapsed = row3 height. The zone spans rows 2+3 AND
            the 10px gap between them, so 53.5% overshoots the row2/row3 line by
            half the gap; subtract 5px so its top edge lands exactly on it. */}
        <AnimatedClip
          src={src("5")}
          anchor="bottom"
          height={swapped ? "calc(100% - 0px)" : "calc(53.5% - 5px)"}
          transition={boxTrans}
        />
      </div>

      {/* Tile 2 — Temper marketing site (slot-2.png is Temper, not Walkrr —
          corrected stale label; there's no real Walkrr imagery in the repo) */}
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
        {/* Tile4 clip — collapsed = row1 height. Zone spans rows 1+2 AND the
            10px gap, so 50% overshoots the row1/row2 line by half the gap;
            subtract 5px so its bottom edge lands exactly on it. */}
        <AnimatedClip
          src={src("4")}
          anchor="top"
          height={swapped ? "calc(50% - 5px)" : "calc(100% - 0px)"}
          transition={boxTrans}
        />

        {/* Copy B — white space below tile4 (row2 + the row gap) */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "calc(50% + 5px)" }}>
          <CopySlot visible={showB} lines={COPY_B} phaseKey="b" pref={pref} instant={debugInstant} center />
        </div>
      </div>

      {/* Tile 7 — BOS ICE TEA */}
      <div className="rounded-xl overflow-hidden" style={{ gridColumn: 3, gridRow: "3/4" }}>
        <Tile src={src("7")} />
      </div>
    </div>
  );
}
