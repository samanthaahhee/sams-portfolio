"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PortfolioContactStrip } from "@/lib/db-portfolio";

/* ── Default content (matches sam-ahhee-portfolio-content.md) ────── */

const DEFAULT_STRIPS: PortfolioContactStrip[] = [
  { id: 1, label: "visual designer",  type: "email",       content: "samantha.ahhee@gmail.com", orderIndex: 0 },
  { id: 2, label: "art director",     type: "email",       content: "samantha.ahhee@gmail.com", orderIndex: 1 },
  { id: 3, label: "my CV details",    type: "cv-download", content: "/files/Sam-ahhee-Schneider-CV.pdf", orderIndex: 2 },
  { id: 4, label: "inspire me",       type: "quote",       content: JSON.stringify([
    "You have to put up with the rain if you want to see the rainbow.",
    "Good things take time.",
    "You can't connect the dots looking forward; you can only connect them looking backwards.",
  ]), orderIndex: 3 },
  { id: 5, label: "contact number",   type: "phone",       content: "+31 68 545 5874", orderIndex: 4 },
  { id: 6, label: "my email address", type: "email",       content: "samantha.ahhee@gmail.com", orderIndex: 5 },
];

/* Slight rotation per strip for an organic torn-paper look */
const STRIP_ROTATIONS = [-2, 1.5, -1, 2.5, -0.5, 1];

/* ── Strip focused content ───────────────────────────────────────── */

function StripContent({ strip, onClose }: { strip: PortfolioContactStrip; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [quoteIdx] = useState(() => {
    try { const q = JSON.parse(strip.content); return Math.floor(Math.random() * q.length); }
    catch { return 0; }
  });

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  let body: React.ReactNode = null;

  if (strip.type === "email") {
    body = (
      <div className="text-center">
        <p className="font-lore text-base md:text-lg tracking-widest mb-4 uppercase">{strip.content}</p>
        <button
          onClick={() => handleCopy(strip.content)}
          className="font-portfolio-sans text-xs px-3 py-1.5 rounded border border-neutral-300 hover:bg-neutral-100 transition-colors"
        >
          {copied ? "Copied!" : "Copy to clipboard"}
        </button>
      </div>
    );
  } else if (strip.type === "phone") {
    body = <p className="font-lore text-base md:text-lg tracking-widest text-center uppercase">{strip.content}</p>;
  } else if (strip.type === "cv-download") {
    body = (
      <a
        href={strip.content}
        download
        className="font-portfolio-sans text-sm px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-700 transition-colors"
      >
        Download CV ↓
      </a>
    );
  } else if (strip.type === "quote") {
    try {
      const quotes = JSON.parse(strip.content) as string[];
      body = <p className="font-lore text-sm md:text-base text-center leading-relaxed italic max-w-xs">&ldquo;{quotes[quoteIdx]}&rdquo;</p>;
    } catch {
      body = <p className="font-lore text-sm">{strip.content}</p>;
    }
  } else {
    body = <p className="font-lore text-sm md:text-base text-center">{strip.content}</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[120px]">
      {body}
    </div>
  );
}

/* ── Main contact page component ─────────────────────────────────── */

export function ContactPage({
  strips,
  ambientLeft = "THANK YOU FOR STOPPING BY!",
  ambientRight = "HOPE YOU ENJOY THE REST OF YOUR DAY!",
}: {
  strips: PortfolioContactStrip[];
  ambientLeft?: string;
  ambientRight?: string;
}) {
  const list = strips.length > 0 ? strips : DEFAULT_STRIPS;
  const [focusedId, setFocusedId] = useState<number | null>(null);
  const focused = list.find((s) => s.id === focusedId) ?? null;

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center"
      style={{ backgroundImage: "url('/images/contact-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-sky-900/10" aria-hidden />

      {/* ── Ambient side copy ────────────────────────────────────── */}
      <p
        className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 font-lore font-bold text-white/80 text-xs md:text-sm leading-tight tracking-widest hidden md:block"
        style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)", textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
      >
        {ambientLeft}
      </p>
      <p
        className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 font-lore font-bold text-white/80 text-xs md:text-sm leading-tight tracking-widest hidden md:block"
        style={{ writingMode: "vertical-rl", textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
      >
        {ambientRight}
      </p>

      {/* ── Central notepad + strips ─────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Notepad */}
        <div
          className="bg-white/95 backdrop-blur-sm rounded-lg px-10 py-8 shadow-2xl mb-0"
          style={{ minWidth: 280, maxWidth: 420 }}
        >
          <h1 className="font-lore font-bold text-2xl md:text-3xl text-center leading-tight" style={{ color: "#1a1a1a" }}>
            WHAT ARE YOU
            <br />LOOKING FOR TODAY?
          </h1>
        </div>

        {/* Strips hanging below */}
        <div className="flex items-start justify-center gap-3 mt-0 px-4">
          {list.map((strip, i) => (
            <button
              key={strip.id}
              onClick={() => setFocusedId(strip.id)}
              className="group relative bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg cursor-pointer"
              style={{
                width: 64,
                minHeight: 160,
                borderRadius: "0 0 6px 6px",
                transform: `rotate(${STRIP_ROTATIONS[i % STRIP_ROTATIONS.length]}deg)`,
                transformOrigin: "top center",
                paddingTop: 12,
                paddingBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label={strip.label}
            >
              {/* Torn top edge (SVG clip) */}
              <div
                className="absolute top-0 left-0 right-0 h-3 bg-white/90"
                style={{
                  clipPath: "polygon(0% 100%, 5% 20%, 12% 80%, 20% 10%, 28% 90%, 36% 15%, 44% 85%, 52% 5%, 60% 95%, 68% 20%, 76% 75%, 84% 0%, 92% 60%, 100% 20%, 100% 100%)",
                }}
                aria-hidden
              />
              <p
                className="font-portfolio-sans text-[10px] font-semibold text-neutral-700 tracking-wider uppercase"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: "0.08em" }}
              >
                {strip.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Focused strip overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {focused && (
          <>
            {/* Dim backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFocusedId(null)}
            />

            {/* Focused strip card */}
            <motion.div
              className="absolute inset-0 z-30 flex items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative bg-white/95 backdrop-blur-md rounded-sm shadow-2xl px-10 py-8 w-full max-w-md"
                initial={{ scale: 0.85, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  clipPath: "polygon(0% 2%, 3% 0%, 7% 3%, 12% 0%, 17% 2%, 23% 0%, 30% 3%, 37% 0%, 44% 2%, 51% 0%, 58% 3%, 65% 0%, 72% 2%, 79% 0%, 86% 3%, 93% 0%, 100% 2%, 100% 100%, 0% 100%)",
                  paddingTop: 28,
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setFocusedId(null)}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 transition-colors text-lg leading-none"
                  aria-label="Close"
                >
                  ×
                </button>

                <StripContent strip={focused} onClose={() => setFocusedId(null)} />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
