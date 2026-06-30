"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Media } from "./media";
import type { PortfolioMedia } from "@/lib/db-portfolio";

/* ── Copy text ────────────────────────────────────────────────────── */

const COPY_A = "Hey I'm Sam. I'm a visual communication designer, translating complex ideas into clear storytelling.";
const COPY_B = "With 13 years of experience, I have found I enjoy sitting at the intersection of product & brand.";

/* ── Local images — TODO slots 2, 4, 7 need real files ───────────── */
const LOCAL: Record<string, string> = {
  "1": "/images/bento/slot-1.jpg",
  "2": "/images/bento/slot-2.png", // TODO: Walkrr laptop
  "3": "/images/bento/slot-3.png",
  "4": "/images/bento/slot-4.jpg", // TODO: BOS outdoor tuk-tuk
  "5": "/images/bento/slot-5.png",
  "6": "/images/bento/slot-6.png",
  "7": "/images/bento/slot-7.jpg", // TODO: BOS ICE TEA original
};

const NAV_H = 56; // must match PortfolioNav height

/* ── Word-by-word copy reveal ────────────────────────────────────── */

function WordReveal({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const words = text.split(" ");
  return (
    <span aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block mr-[0.28em]"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: i * 0.07,
            duration: 0.3,
            ease: "easeOut",
          }}
          onAnimationComplete={i === words.length - 1 ? onComplete : undefined}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ── Main component ───────────────────────────────────────────────── */

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
  function src(id: string) { return bySlot[id]?.url ?? LOCAL[id] ?? ""; }
  function mtype(id: string): "image" | "gif" | "mp4" {
    return (bySlot[id]?.type ?? "image") as "image" | "gif" | "mp4";
  }

  const [pref, setPref] = useState(false);
  useEffect(() => {
    setPref(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // tile1 state: "expanded" = covers copy area | "collapsed" = copy visible
  const [tile1, setTile1] = useState<"expanded" | "collapsed">("collapsed");
  // copy state: which text is showing, or null = hidden
  const [copySlot, setCopySlot] = useState<"a" | "b" | null>("a");
  // controls: run copy reveal after tile1 collapses
  const [revealReady, setRevealReady] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextCopy = useRef<"a" | "b">("a");

  function clear() { if (timer.current) clearTimeout(timer.current); }

  useEffect(() => {
    if (pref) return;

    function cycle() {
      // 1. Show copy for 3.5 s, then hide it and expand tile1
      clear();
      timer.current = setTimeout(() => {
        setCopySlot(null);     // fade copy out
        setRevealReady(false);
        // 2. After copy fades (300ms), expand tile1
        clear();
        timer.current = setTimeout(() => {
          setTile1("expanded");
          // 3. tile1 expansion = 700ms. Then hold 600ms, then collapse.
          clear();
          timer.current = setTimeout(() => {
            setTile1("collapsed");
            // 4. Tile1 collapse = 700ms. After it settles, wait 350ms then reveal words.
            clear();
            timer.current = setTimeout(() => {
              nextCopy.current = nextCopy.current === "a" ? "b" : "a";
              setCopySlot(nextCopy.current);
              setRevealReady(true);
              cycle(); // schedule next cycle from here
            }, 1050); // 700ms collapse + 350ms delay
          }, 1300); // hold expanded
        }, 300); // wait for copy to fade
      }, 3500); // hold copy visible
    }

    // Start: copy A is already showing (revealReady triggers words)
    setRevealReady(true);
    cycle();

    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pref]);

  const currentText = copySlot === "a" ? copyA : copySlot === "b" ? copyB : null;
  const tile1Expanded = tile1 === "expanded";

  return (
    <div
      style={{
        height: `calc(100vh - ${NAV_H}px)`,
        display: "grid",
        // 3 equal columns
        gridTemplateColumns: "1fr 1fr 1fr",
        // rows: col1 rows 1+2 carry tile1 + copy, col2 rows 1+2 carry tile2 + tile3
        gridTemplateRows: "1fr 1fr 1.1fr",
        gap: 10,
        padding: "10px 20px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* ── Col 1, Row 1: tile1 (animates to cover row 2) ──────── */}
      <motion.div
        className="overflow-hidden rounded-xl"
        style={{
          gridColumn: 1,
          gridRow: tile1Expanded ? "1 / 3" : "1 / 2",
          zIndex: tile1Expanded ? 2 : 1,
          position: "relative",
        }}
        layout
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <Media
          src={src("1")}
          type={mtype("1")}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* ── Col 1, Row 2: copy text ──────────────────────────────── */}
      <div
        style={{
          gridColumn: 1,
          gridRow: "2 / 3",
          zIndex: 1,
          display: "flex",
          alignItems: "flex-start",
          paddingTop: 4,
        }}
      >
        <AnimatePresence mode="wait">
          {revealReady && currentText && (
            <motion.p
              key={copySlot}
              className="font-lore"
              style={{
                fontSize: "clamp(0.95rem, 1.55vw, 1.35rem)",
                lineHeight: 1.35,
                color: "#1a1a1a",
              }}
              initial={{}}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
            >
              {pref ? currentText : (
                <WordReveal text={currentText} />
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Col 2, Row 1: tile2 ──────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-xl"
        style={{ gridColumn: 2, gridRow: "1 / 2" }}
      >
        <Media src={src("2")} type={mtype("2")} className="w-full h-full object-cover" />
      </div>

      {/* ── Col 2, Row 2: tile3 ──────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-xl"
        style={{ gridColumn: 2, gridRow: "2 / 3" }}
      >
        <Media src={src("3")} type={mtype("3")} className="w-full h-full object-cover" />
      </div>

      {/* ── Col 3, Rows 1+2: tile4 tall portrait ─────────────────── */}
      <div
        className="overflow-hidden rounded-xl"
        style={{ gridColumn: 3, gridRow: "1 / 3" }}
      >
        <Media src={src("4")} type={mtype("4")} className="w-full h-full object-cover" />
      </div>

      {/* ── Row 3: tile5 + tile6 + tile7 ─────────────────────────── */}
      <div
        className="overflow-hidden rounded-xl"
        style={{ gridColumn: 1, gridRow: "3 / 4" }}
      >
        <Media src={src("5")} type={mtype("5")} className="w-full h-full object-cover" />
      </div>
      <div
        className="overflow-hidden rounded-xl"
        style={{ gridColumn: 2, gridRow: "3 / 4" }}
      >
        <Media src={src("6")} type={mtype("6")} className="w-full h-full object-cover" />
      </div>
      <div
        className="overflow-hidden rounded-xl"
        style={{ gridColumn: 3, gridRow: "3 / 4" }}
      >
        <Media src={src("7")} type={mtype("7")} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
