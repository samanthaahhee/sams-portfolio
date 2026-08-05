"use client";

import { motion } from "motion/react";

/* ── Homepage ─────────────────────────────────────────────────────────
   Recreates Sam's reference design (red lettering logo, meta row, work
   grid, bio + services, contact banner) as a normal stacked page — no
   sticky/pin trickery, just scroll-triggered reveals (motion's
   whileInView) on each section. Grid images are grey placeholders until
   real assets are picked/uploaded. */

const RED = "#dc4941";

const META = {
  role: "VISUAL COMMS DESIGNER",
  year: "2026",
  handle: "@SAMANTHAAHHEE",
};

const SERVICES = [
  "Art Direction",
  "Packaging",
  "Creative Strategy",
  "Graphic Design",
  "Brand Design",
  "Activation Design",
  "Brand Experience",
  "Illustration",
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/** A grey placeholder tile — swap `src` in once real images are picked. */
function PlaceholderTile({ aspect = "4 / 3", delay = 0 }: { aspect?: string; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      custom={delay}
      variants={fadeUp}
      style={{ aspectRatio: aspect, background: "#e5e5e5", borderRadius: 4 }}
    />
  );
}

export function HomepageHero() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div
        style={{
          minHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          padding: "120px 24px 60px",
        }}
      >
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
            color: RED,
            textAlign: "center",
          }}
        >
          <span>{META.role}</span>
          <span>{META.year}</span>
          <span>{META.handle}</span>
        </motion.div>

        <motion.div
          custom={0.15}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{ width: "100%", maxWidth: 1100, padding: "0 16px" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/samahhee.svg" alt="Sam Ahhee" style={{ width: "100%", height: "auto", display: "block" }} />
        </motion.div>

        <motion.p
          custom={0.4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="font-portfolio-sans"
          style={{
            marginTop: 28,
            fontSize: "clamp(0.85rem, 1.3vw, 1rem)",
            fontWeight: 600,
            letterSpacing: "0.03em",
            lineHeight: 1.5,
            color: RED,
            textAlign: "center",
            maxWidth: 480,
            textTransform: "uppercase",
          }}
        >
          Amsterdam based visual comms designer
          <br />
          and art director.
        </motion.p>
      </div>

      {/* ── Work grid ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 24 }}>
          <PlaceholderTile aspect="4 / 3" />
          <PlaceholderTile aspect="4 / 3" delay={0.1} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 24 }}>
          <PlaceholderTile aspect="4 / 3" />
          <PlaceholderTile aspect="4 / 3" delay={0.1} />
        </div>

        {/* Bio + services */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 24 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="font-portfolio-sans"
            style={{
              background: "#f2f2f2",
              borderRadius: 4,
              padding: "32px 36px",
              display: "flex",
              alignItems: "center",
              fontSize: "clamp(1rem, 1.8vw, 1.35rem)",
              lineHeight: 1.5,
              color: RED,
              fontWeight: 500,
            }}
          >
            Hey I&rsquo;m Sam, a South African Visual Comms Designer living in Amsterdam. I enjoy
            helping start-ups and scale-ups create memorable brand experiences.
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={0.1}
            variants={fadeUp}
            className="font-portfolio-sans"
            style={{
              background: "#f2f2f2",
              borderRadius: 4,
              padding: "28px 32px",
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: RED, marginBottom: 12 }}>
              Services
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {SERVICES.map((s) => (
                <li key={s} style={{ fontSize: 14, color: RED, lineHeight: 1.7 }}>
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 24 }}>
          <PlaceholderTile aspect="4 / 3" />
          <PlaceholderTile aspect="4 / 3" delay={0.1} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          <PlaceholderTile aspect="4 / 3" />
          <PlaceholderTile aspect="4 / 3" delay={0.1} />
        </div>
      </div>

      {/* ── Contact banner ────────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="font-portfolio-sans"
        style={{
          background: RED,
          color: "#fff",
          margin: "0 24px 40px",
          borderRadius: 4,
          padding: "48px 40px",
        }}
      >
        <p style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.7rem)", fontWeight: 600, marginBottom: 20 }}>
          Always open to a new project or opportunity.
        </p>
        <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.25rem)", marginBottom: 6 }}>samantha.ahhee@gmail.com</p>
        <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.25rem)" }}>+31 68 545 5874</p>
      </motion.div>
    </>
  );
}
