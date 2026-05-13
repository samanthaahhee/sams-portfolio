"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";

/**
 * A draggable top-view "desk" of small objects scattered to the right of
 * the masthead. Items can be dragged anywhere within the bounded canvas;
 * pointer-down brings the item to the top of the pile.
 *
 * ────────────────────────────────────────────────────────────────────
 *  ✏️ HOW TO PICK YOUR ITEMS
 *  Edit the ACTIVE_ITEMS array below. Use any ItemId from the catalog.
 *  Order = stacking order from bottom to top of the pile.
 *
 *  Available item ids:
 *    "polaroid-1" "polaroid-2" "polaroid-3"   — photographs
 *    "postit"                                  — yellow Post-it
 *    "pencil"                                  — yellow pencil
 *    "key"                                     — brass key on ring
 *    "clip"                                    — paper clip
 *    "stamp"                                   — circular ink stamp
 *    "matchbook"                               — folded matchbook
 *    "coffee-ring"                             — coffee cup stain
 *    "film-strip"                              — strip of negatives
 *    "ticket"                                  — Admit One ticket
 *    "sticker"                                 — smiley sticker
 *    "tape"                                    — diagonal tape strip
 * ──────────────────────────────────────────────────────────────────── */

type ItemId =
  | "polaroid-1"
  | "polaroid-2"
  | "polaroid-3"
  | "postit"
  | "pencil"
  | "key"
  | "clip"
  | "stamp"
  | "matchbook"
  | "coffee-ring"
  | "film-strip"
  | "ticket"
  | "sticker"
  | "tape";

type ItemConfig = {
  id: ItemId;
  x: number;       // % of container
  y: number;
  rotate: number;
};

const ACTIVE_ITEMS: ItemConfig[] = [
  { id: "polaroid-1",  x: 8,  y: 10, rotate: -7 },
  { id: "polaroid-2",  x: 40, y: 18, rotate: 5 },
  { id: "polaroid-3",  x: 18, y: 50, rotate: -3 },
  { id: "postit",      x: 56, y: 4,  rotate: 6 },
  { id: "pencil",      x: 36, y: 74, rotate: 28 },
  { id: "key",         x: 60, y: 56, rotate: -18 },
  { id: "clip",        x: 78, y: 32, rotate: 18 },
  { id: "stamp",       x: 70, y: 78, rotate: -8 },
];

export function DesktopStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<ItemId[]>(ACTIVE_ITEMS.map((i) => i.id));

  const bringToFront = (id: ItemId) => {
    setOrder((prev) => [...prev.filter((x) => x !== id), id]);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square select-none"
      aria-label="Sam's desk — drag the objects around"
    >
      {/* Faint paper grain on the desk surface */}
      <div
        aria-hidden
        className="absolute inset-0 halftone-fine opacity-[0.05] mix-blend-multiply rounded-sm"
        style={{ ["--dot" as string]: "#000" }}
      />

      {ACTIVE_ITEMS.map((item) => (
        <motion.div
          key={item.id}
          drag
          dragMomentum={false}
          dragConstraints={containerRef}
          dragElastic={0.05}
          onPointerDown={() => bringToFront(item.id)}
          whileDrag={{ scale: 1.04, cursor: "grabbing" }}
          whileHover={{ scale: 1.02 }}
          initial={{ rotate: item.rotate }}
          className="absolute cursor-grab active:cursor-grabbing"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            zIndex: order.indexOf(item.id) + 1,
            filter: "drop-shadow(0 6px 10px rgba(20,15,10,0.18))",
            touchAction: "none",
          }}
        >
          <Item id={item.id} />
        </motion.div>
      ))}
    </div>
  );
}

/* ── Item registry ────────────────────────────────────────────────── */

function Item({ id }: { id: ItemId }) {
  switch (id) {
    case "polaroid-1":  return <Polaroid seed="desk-still-1" caption="Sydney, 25" />;
    case "polaroid-2":  return <Polaroid seed="desk-still-2" caption="Studio" />;
    case "polaroid-3":  return <Polaroid seed="desk-still-3" caption="" />;
    case "postit":      return <PostIt />;
    case "pencil":      return <Pencil />;
    case "key":         return <Key />;
    case "clip":        return <PaperClip />;
    case "stamp":       return <Stamp />;
    case "matchbook":   return <Matchbook />;
    case "coffee-ring": return <CoffeeRing />;
    case "film-strip":  return <FilmStrip />;
    case "ticket":      return <Ticket />;
    case "sticker":     return <Sticker />;
    case "tape":        return <Tape />;
  }
}

/* ── Polaroid ─────────────────────────────────────────────────────── */
function Polaroid({ seed, caption }: { seed: string; caption: string }) {
  return (
    <div
      className="bg-white"
      style={{ width: "min(34%, 130px)", minWidth: "98px", padding: "8px 8px 24px" }}
    >
      <div className="relative" style={{ aspectRatio: "1 / 1" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${seed}/300/300`}
          alt=""
          loading="lazy"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      {caption && (
        <p
          className="mt-1.5 text-center"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#5c5048",
          }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

/* ── Post-it ──────────────────────────────────────────────────────── */
function PostIt() {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        width: "min(20%, 80px)",
        minWidth: "62px",
        aspectRatio: "1 / 1",
        background: "#f4e088",
        boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.04)",
      }}
    >
      <span
        className="font-display"
        style={{
          fontSize: "min(5vw, 1.75rem)",
          lineHeight: 1,
          color: "#1a1612",
          fontWeight: 800,
          letterSpacing: "-0.05em",
        }}
      >
        S.A.
      </span>
      <span
        className="mt-1"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "8px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#5c4a18",
        }}
      >
        — to do
      </span>
    </div>
  );
}

/* ── Pencil ───────────────────────────────────────────────────────── */
function Pencil() {
  return (
    <svg
      viewBox="0 0 200 24"
      style={{ width: "min(34%, 160px)", minWidth: "120px", display: "block" }}
    >
      <rect x="0" y="2" width="22" height="20" rx="2" fill="#e08070" />
      <rect x="22" y="2" width="20" height="20" fill="#c4a060" />
      <rect x="24" y="6" width="2" height="12" fill="#9c7c44" />
      <rect x="32" y="6" width="2" height="12" fill="#9c7c44" />
      <rect x="40" y="6" width="2" height="12" fill="#9c7c44" />
      <rect x="42" y="2" width="128" height="20" fill="#f0c84a" />
      <rect x="80" y="2" width="32" height="20" fill="#1c1612" />
      <text x="96" y="16" textAnchor="middle" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#f0c84a" letterSpacing="0.05em">S.A.</text>
      <polygon points="170,2 184,2 196,12 184,22 170,22" fill="#deb478" />
      <polygon points="184,8 196,12 184,16" fill="#1a1612" />
    </svg>
  );
}

/* ── Key + ring ───────────────────────────────────────────────────── */
function Key() {
  return (
    <svg viewBox="0 0 160 60" style={{ width: "min(30%, 140px)", minWidth: "110px", display: "block" }}>
      <circle cx="22" cy="30" r="18" fill="none" stroke="#9a7a4e" strokeWidth="4" />
      <rect x="40" y="26" width="92" height="8" rx="2" fill="#cca672" />
      <circle cx="22" cy="30" r="6" fill="none" stroke="#7a5e36" strokeWidth="1.5" />
      <rect x="118" y="34" width="6" height="10" fill="#cca672" />
      <rect x="128" y="34" width="6" height="10" fill="#cca672" />
      <rect x="138" y="34" width="6" height="6" fill="#cca672" />
    </svg>
  );
}

/* ── Paper clip ───────────────────────────────────────────────────── */
function PaperClip() {
  return (
    <svg
      viewBox="0 0 40 80"
      style={{ width: "min(12%, 36px)", minWidth: "26px", display: "block" }}
      fill="none" stroke="#9aa0a8" strokeWidth="2.5" strokeLinecap="round"
    >
      <path d="M12 10 v52 a8 8 0 0 0 16 0 v-40 a4 4 0 0 0 -8 0 v36" />
    </svg>
  );
}

/* ── Ink stamp ────────────────────────────────────────────────────── */
function Stamp() {
  return (
    <svg
      viewBox="0 0 100 100"
      style={{ width: "min(22%, 88px)", minWidth: "68px", display: "block" }}
    >
      <circle cx="50" cy="50" r="44" fill="none" stroke="#b54a2a" strokeWidth="2.5" opacity="0.85" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="#b54a2a" strokeWidth="1.5" opacity="0.7" />
      <text x="50" y="42" textAnchor="middle" fontFamily="monospace" fontSize="9" letterSpacing="0.2em" fill="#b54a2a" opacity="0.85">SAM AHHEE</text>
      <text x="50" y="62" textAnchor="middle" fontFamily="serif" fontSize="20" fontWeight="800" fill="#b54a2a" opacity="0.85">S·A</text>
      <text x="50" y="76" textAnchor="middle" fontFamily="monospace" fontSize="7" letterSpacing="0.18em" fill="#b54a2a" opacity="0.85">VOL 01</text>
    </svg>
  );
}

/* ── Matchbook ────────────────────────────────────────────────────── */
function Matchbook() {
  return (
    <svg
      viewBox="0 0 90 110"
      style={{ width: "min(22%, 90px)", minWidth: "70px", display: "block" }}
    >
      {/* Body */}
      <rect x="2" y="2" width="86" height="106" rx="3" fill="#2d4a3a" />
      {/* Top fold band */}
      <rect x="2" y="2" width="86" height="22" rx="3" fill="#1f3a2c" />
      {/* Strike strip */}
      <rect x="8" y="88" width="74" height="10" fill="#c4855a" opacity="0.85" />
      <rect x="8" y="88" width="74" height="10" fill="url(#hatch)" opacity="0.4" />
      <defs>
        <pattern id="hatch" width="3" height="3" patternUnits="userSpaceOnUse">
          <path d="M0 3 L3 0" stroke="#1f3a2c" strokeWidth="0.5" />
        </pattern>
      </defs>
      {/* Brand text */}
      <text x="45" y="50" textAnchor="middle" fontFamily="serif" fontSize="14" fontWeight="800" fill="#e6c890" letterSpacing="0.02em">S·A</text>
      <text x="45" y="66" textAnchor="middle" fontFamily="monospace" fontSize="6" letterSpacing="0.22em" fill="#e6c890">SAM AHHEE</text>
      <text x="45" y="78" textAnchor="middle" fontFamily="monospace" fontSize="5" letterSpacing="0.18em" fill="#9cb09e">EST. MMXXVI</text>
    </svg>
  );
}

/* ── Coffee ring ──────────────────────────────────────────────────── */
function CoffeeRing() {
  return (
    <svg
      viewBox="0 0 110 110"
      style={{ width: "min(28%, 110px)", minWidth: "80px", display: "block" }}
    >
      <circle cx="55" cy="55" r="44" fill="none" stroke="#6b3a1a" strokeWidth="6" opacity="0.35" />
      <circle cx="55" cy="55" r="44" fill="none" stroke="#7a3f1f" strokeWidth="2" opacity="0.55" strokeDasharray="3 18 9 12 4 22" />
      <circle cx="40" cy="44" r="3" fill="#6b3a1a" opacity="0.3" />
      <circle cx="78" cy="68" r="2" fill="#6b3a1a" opacity="0.2" />
    </svg>
  );
}

/* ── Film strip ───────────────────────────────────────────────────── */
function FilmStrip() {
  return (
    <svg
      viewBox="0 0 60 160"
      style={{ width: "min(15%, 60px)", minWidth: "44px", display: "block" }}
    >
      <rect x="0" y="0" width="60" height="160" fill="#1a1612" />
      {/* Sprocket holes — left + right */}
      {[10, 32, 54, 76, 98, 120, 142].map((y) => (
        <g key={y}>
          <rect x="3" y={y} width="6" height="6" rx="1" fill="#f5efe6" />
          <rect x="51" y={y} width="6" height="6" rx="1" fill="#f5efe6" />
        </g>
      ))}
      {/* Frames */}
      <rect x="12" y="14" width="36" height="38" fill="#3a4a3a" />
      <rect x="12" y="60" width="36" height="38" fill="#4a3a3a" />
      <rect x="12" y="106" width="36" height="38" fill="#3a3a4a" />
    </svg>
  );
}

/* ── Ticket ───────────────────────────────────────────────────────── */
function Ticket() {
  return (
    <svg
      viewBox="0 0 180 70"
      style={{ width: "min(32%, 160px)", minWidth: "120px", display: "block" }}
    >
      <rect x="0" y="0" width="180" height="70" rx="3" fill="#f1d9a8" />
      {/* Perforation */}
      <line x1="130" y1="6" x2="130" y2="64" stroke="#a08454" strokeWidth="1" strokeDasharray="3 3" />
      {/* Main side */}
      <text x="14" y="22" fontFamily="serif" fontSize="11" fontWeight="800" fill="#3a2a14" letterSpacing="0.05em">ADMIT ONE</text>
      <text x="14" y="38" fontFamily="serif" fontSize="16" fontWeight="800" fill="#3a2a14" letterSpacing="-0.02em">Sam Ahhee</text>
      <text x="14" y="54" fontFamily="monospace" fontSize="7" letterSpacing="0.18em" fill="#7a5a2a">SECT. A · ROW 12 · SEAT 7</text>
      {/* Stub side */}
      <text x="155" y="38" textAnchor="middle" fontFamily="serif" fontSize="16" fontWeight="800" fill="#3a2a14">№ 07</text>
      <text x="155" y="50" textAnchor="middle" fontFamily="monospace" fontSize="6" letterSpacing="0.16em" fill="#7a5a2a">STUB</text>
    </svg>
  );
}

/* ── Sticker (smiley) ─────────────────────────────────────────────── */
function Sticker() {
  return (
    <svg
      viewBox="0 0 80 80"
      style={{ width: "min(18%, 80px)", minWidth: "58px", display: "block" }}
    >
      <circle cx="40" cy="40" r="36" fill="#f0c84a" />
      <circle cx="40" cy="40" r="36" fill="none" stroke="#1c1612" strokeWidth="2" />
      <circle cx="29" cy="34" r="3" fill="#1c1612" />
      <circle cx="51" cy="34" r="3" fill="#1c1612" />
      <path d="M26 46 Q40 60 54 46" fill="none" stroke="#1c1612" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Tape strip ───────────────────────────────────────────────────── */
function Tape() {
  return (
    <svg
      viewBox="0 0 120 32"
      style={{ width: "min(28%, 120px)", minWidth: "80px", display: "block" }}
    >
      <defs>
        <linearGradient id="tape-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8dfc8" stopOpacity="0.85" />
          <stop offset="1" stopColor="#d4c8a8" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <path
        d="M2 6 L4 4 L10 7 L18 5 L26 7 L34 4 L42 7 L52 5 L62 7 L72 4 L82 7 L92 5 L102 7 L112 4 L118 6 L116 28 L110 26 L102 28 L92 26 L82 28 L72 25 L62 28 L52 26 L42 28 L32 25 L22 28 L12 26 L4 28 Z"
        fill="url(#tape-grad)"
      />
      {/* Subtle horizontal lines for tape texture */}
      <line x1="6" y1="16" x2="114" y2="16" stroke="#a09678" strokeWidth="0.3" opacity="0.5" />
    </svg>
  );
}
