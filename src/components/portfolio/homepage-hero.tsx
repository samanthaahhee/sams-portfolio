"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";

/* ── Homepage ─────────────────────────────────────────────────────────
   Recreates Sam's reference design (red lettering logo, meta row, work
   grid, bio + services, contact banner) as a normal stacked page — no
   sticky/pin trickery, just scroll-triggered reveals (motion's
   whileInView) on each section. Grid images are grey placeholders until
   real assets are picked/uploaded. */

const RED = "#FF2E31";

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

const LOGO_TRACK_WIDTH = 260;

/** Wordmark entrance: the real SVG logo tracks the cursor (spring-lagged),
 *  and the moment the cursor first moves, a loading-bar-style clip-path
 *  wipe starts filling it in over 3s — so the reveal is tied to actual
 *  cursor activity instead of a mount timer nobody's watching. Once that
 *  wipe finishes, the logo disconnects and snaps into its static header
 *  position, landing exactly where a hidden layout placeholder measures
 *  it should sit, so the handoff from fixed-cursor-follow to normal
 *  in-flow image is seamless. */
function CursorLogo() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isTracking, setIsTracking] = useState(true);
  const [settled, setSettled] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20, mass: 0.5 });
  const scale = useMotionValue(1);
  const reveal = useMotionValue(0);
  const clipPath = useTransform(reveal, (v) => `inset(0 ${100 - v}% 0 0)`);

  useEffect(() => {
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (!isTracking) return;

    let started = false;
    const snap = () => {
      setIsTracking(false);
      const rect = targetRef.current?.getBoundingClientRect();
      if (!rect) return;
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      const targetScale = rect.width / LOGO_TRACK_WIDTH;

      animate(springX, targetX, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
      animate(springY, targetY, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
      animate(scale, targetScale, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
      setTimeout(() => setSettled(true), 900);
    };

    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!started) {
        started = true;
        animate(reveal, 100, { duration: 3, ease: "linear", onComplete: snap });
      }
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [isTracking, mouseX, mouseY, springX, springY, scale, reveal]);

  return (
    <>
      {/* invisible layout placeholder — marks the pixel-exact spot the
          cursor-following logo snaps into once tracking stops */}
      <div ref={targetRef} aria-hidden style={{ visibility: "hidden", width: "100%", maxWidth: 1100, margin: "0 auto" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/samahhee.svg" alt="" style={{ width: "100%", height: "auto", display: "block" }} />
      </div>

      {!settled && (
        <motion.div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            x: springX,
            y: springY,
            scale,
            translateX: "-50%",
            translateY: "-50%",
            width: LOGO_TRACK_WIDTH,
            pointerEvents: "none",
            zIndex: 60,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/samahhee.svg" alt="" style={{ width: "100%", height: "auto", display: "block", opacity: 0.18 }} />
          <motion.img
            src="/logo/samahhee.svg"
            alt="Sam Ahhee"
            style={{ position: "absolute", inset: 0, width: "100%", height: "auto", display: "block", clipPath }}
          />
        </motion.div>
      )}

      {settled && (
        <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/samahhee.svg" alt="Sam Ahhee" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
      )}
    </>
  );
}

/** A grey placeholder tile — swap `src` in once real images are picked.
 *  "Bottom-edge 3D unfold": as the tile travels from the bottom of the
 *  viewport to the center, it starts tilted away (rotateX), scaled down,
 *  and pushed down (y), then normalizes to flat/full-scale/in-place —
 *  the perspective on the parent makes the tilt read as folding away from
 *  the viewer at the bottom edge, not just a flat rotation. */
function ScrollRevealTile({ aspect = "4 / 3" }: { aspect?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [45, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);

  return (
    <div ref={ref} style={{ aspectRatio: aspect, borderRadius: 4, overflow: "visible", perspective: 1200 }}>
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 4,
          background: "#e5e5e5",
          border: "1px solid #d4d4d4",
          transformOrigin: "50% 100%",
          rotateX,
          scale,
          y,
        }}
      />
    </div>
  );
}

export function HomepageHero() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          padding: "112px 24px 12px",
        }}
      >
        <motion.div
          custom={1.7}
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

        <div style={{ width: "100%", maxWidth: 1100, padding: "0 16px" }}>
          <CursorLogo />
        </div>

        <motion.p
          custom={1.9}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="font-portfolio-sans"
          style={{
            marginTop: 16,
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
          <ScrollRevealTile aspect="4 / 3" />
          <ScrollRevealTile aspect="4 / 3" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 24 }}>
          <ScrollRevealTile aspect="4 / 3" />
          <ScrollRevealTile aspect="4 / 3" />
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
          <ScrollRevealTile aspect="4 / 3" />
          <ScrollRevealTile aspect="4 / 3" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          <ScrollRevealTile aspect="4 / 3" />
          <ScrollRevealTile aspect="4 / 3" />
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
