"use client";

import { motion } from "motion/react";

/* ── Homepage hero ────────────────────────────────────────────────────
   Recreates the "giant wordmark + meta row + sticky reveal" pattern from
   the Framer reference (silly-tribute-998384.framer.app): a meta row
   (role / year / handle) and huge display wordmark stay pinned via
   position:sticky while a full-bleed portrait rises up from below on
   scroll, then the whole hero releases once the portrait has filled the
   viewport. Kept on-brand — font-lore (the same face the nav wordmark
   uses) instead of the reference's red grotesk. */

const META = {
  role: "SENIOR PRODUCT & VISUAL DESIGNER",
  year: "2026",
  handle: "@SAMANTHAAHHEE",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function HomepageHero() {
  return (
    <>
      {/* Sticky-release wrapper — taller than the sticky content itself so
          there's real scroll distance for the pin-then-release motion.
          Must be a plain sibling ahead of the portrait section below: a
          sticky element only releases once genuine extra page content
          exists past its own container, otherwise "released" and "max
          scroll" land on the same pixel and the motion never reads. */}
      <div style={{ position: "relative", height: "180vh" }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            zIndex: 1,
            background: "#fff",
          }}
        >
          {/* Meta row */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="font-portfolio-sans"
            style={{
              position: "absolute",
              top: 88,
              left: 0,
              right: 0,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: "4px 20px",
              padding: "0 24px",
              fontSize: "clamp(10px, 2.6vw, 13px)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "#111",
              textAlign: "center",
            }}
          >
            <span>{META.role}</span>
            <span>{META.year}</span>
            <span>{META.handle}</span>
          </motion.div>

          {/* Giant wordmark */}
          <motion.h1
            custom={0.15}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="font-lore font-bold"
            style={{
              fontSize: "clamp(2.6rem, 15vw, 13rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              color: "#111",
              textAlign: "center",
              margin: 0,
              whiteSpace: "nowrap",
              display: "flex",
              justifyContent: "center",
              padding: "0 16px",
            }}
          >
            <span>SAM</span>
            <span style={{ marginLeft: "0.22em" }}>AHHEE</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            custom={0.4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="font-lore"
            style={{
              marginTop: 28,
              fontSize: "clamp(1rem, 1.6vw, 1.35rem)",
              lineHeight: 1.4,
              color: "#111",
              textAlign: "center",
              maxWidth: 560,
              padding: "0 24px",
            }}
          >
            Amsterdam based product &amp; visual designer,
            <br />
            image maker, and storyteller.
          </motion.p>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            style={{ position: "absolute", bottom: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
          >
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="font-portfolio-sans"
              style={{ fontSize: 18, color: "#111" }}
              aria-hidden
            >
              ↓
            </motion.span>
          </motion.div>
        </div>
      </div>

      {/* Portrait — a genuine next section (not nested in the sticky
          wrapper above), so it provides real scroll distance. Rises into
          view as the sticky hero releases. */}
      <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sam-portrait.png"
          alt="Sam Ahhee"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }}
        />
      </div>
    </>
  );
}
