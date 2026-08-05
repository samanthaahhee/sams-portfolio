"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";

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

/* Layout + timing constants measured frame-by-frame off the reference
   recording (captured at 3414x1722, i.e. a 1707x861 CSS viewport):
     side padding 44px · grid gutter 44px · logo spans the full padded width
     meta row top 24px · meta->logo 100px · logo->sub 121px · sub->grid 76px
   The intro holds the wordmark at a constant ~321px wide while the wipe
   fills it (t=3.00s..5.53s), then enlarges it to full width in ~0.47s. */
const LOGO_TRACK_WIDTH = 321;
const WIPE_SECONDS = 2.5;
const ENLARGE_SECONDS = 0.5;

const SIDE_PAD = "clamp(16px, 2.6vw, 44px)";
const GAP_META_LOGO = "clamp(40px, 5.86vw, 100px)";
const GAP_LOGO_SUB = "clamp(48px, 7.09vw, 121px)";
const GAP_SUB_GRID = "clamp(32px, 4.45vw, 76px)";
const GUTTER = "clamp(16px, 2.6vw, 44px)";

/** Wordmark entrance: the real SVG logo tracks the cursor (spring-lagged)
 *  at a fixed small size while a loading-bar clip-path wipe fills it in,
 *  starting on the first cursor movement. Once the wipe completes it
 *  disconnects and enlarges into its static header position — position and
 *  scale animating together — landing exactly where a hidden layout
 *  placeholder measures it should sit, so the handoff from fixed
 *  cursor-follow to normal in-flow image is seamless. Holding size during
 *  the wipe and only then enlarging is what the reference actually does:
 *  its wordmark measures a constant 108px tall for the full 2.5s of the
 *  wipe, then scales up over the last ~0.47s. */
function CursorLogo({ settled, onSettled }: { settled: boolean; onSettled: () => void }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isTracking, setIsTracking] = useState(true);

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

      const opts = { duration: ENLARGE_SECONDS, ease: "easeInOut" as const };
      animate(springX, targetX, opts);
      animate(springY, targetY, opts);
      animate(scale, targetScale, opts);
      setTimeout(onSettled, ENLARGE_SECONDS * 1000);
    };

    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!started) {
        started = true;
        animate(reveal, 100, { duration: WIPE_SECONDS, ease: "linear", onComplete: snap });
      }
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [isTracking, mouseX, mouseY, springX, springY, scale, reveal, onSettled]);

  return (
    <>
      {/* invisible layout placeholder — marks the pixel-exact spot the
          cursor-following logo snaps into once tracking stops. Only
          needed until settled: the real settled logo below takes over
          that same flow space, so keeping both mounted would double it. */}
      {!settled && (
        <div ref={targetRef} aria-hidden style={{ visibility: "hidden", width: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/samahhee.svg" alt="" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
      )}

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
        /* sits above the white intro overlay while that fades out, so the
           logo never flickers behind it during the handoff */
        <div style={{ width: "100%", position: "relative", zIndex: 60 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/samahhee.svg" alt="Sam Ahhee" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
      )}
    </>
  );
}

/** A grey placeholder tile — swap `src` in once real images are picked.
 *
 *  Two independent motions, nested so they don't fight over `transform`:
 *
 *  1. Viewport-edge distortion (outer): a scroll-linked 3D fold. As the
 *     tile crosses the bottom threshold of the screen it carries
 *     rotateX(60deg) under a shallow perspective (800px, which exaggerates
 *     the warp), plus a slight scale-down, so it reads as compressed and
 *     angled away from the viewer; that eases back to flat as the tile
 *     travels up to the centre of the viewport, so it unfolds and snaps
 *     into place. Hinged at its bottom edge so the fold pivots off the
 *     incoming edge rather than the middle.
 *  2. Load entrance (inner): opacity 0->1 with a ~46px slide-up, on a long
 *     expo ease-out, fired once the intro finishes. */
function WorkTile({ show, aspect = "4 / 3" }: { show: boolean; aspect?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <div ref={ref} style={{ perspective: 800, aspectRatio: aspect }}>
      <motion.div style={{ width: "100%", height: "100%", rotateX, scale, transformOrigin: "50% 100%" }}>
        <motion.div
          initial={{ opacity: 0, y: 46 }}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 46 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 4,
            background: "#e5e5e5",
            border: "1px solid #d4d4d4",
          }}
        />
      </motion.div>
    </div>
  );
}

export function HomepageHero() {
  /* The intro runs in strict order, matching the reference exactly:
     screen starts full white (a fixed overlay hides the nav and page
     underneath) → the logo loads + enlarges into place on top of it →
     only then does the overlay clear and everything else fade in. */
  const [settled, setSettled] = useState(false);
  const onSettled = useCallback(() => setSettled(true), []);

  useEffect(() => {
    if (settled) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [settled]);

  return (
    <>
      <AnimatePresence>
        {!settled && (
          <motion.div
            key="intro-veil"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 55, pointerEvents: "none" }}
          />
        )}
      </AnimatePresence>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div style={{ position: "relative", padding: `24px ${SIDE_PAD} 0` }}>
        {/* meta row: justified left / centre / right, as in the reference */}
        <motion.div
          custom={0}
          initial="hidden"
          animate={settled ? "visible" : "hidden"}
          variants={fadeUp}
          className="font-portfolio-sans"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "4px 20px",
            fontSize: "clamp(10px, 2.6vw, 13px)",
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: RED,
          }}
        >
          <span>{META.role}</span>
          <span>{META.year}</span>
          <span>{META.handle}</span>
        </motion.div>

        {/* logo: fills the full padded width, no max-width cap */}
        <div style={{ width: "100%", marginTop: GAP_META_LOGO }}>
          <CursorLogo settled={settled} onSettled={onSettled} />
        </div>

        <motion.p
          custom={0.1}
          initial="hidden"
          animate={settled ? "visible" : "hidden"}
          variants={fadeUp}
          className="font-portfolio-sans"
          style={{
            marginTop: GAP_LOGO_SUB,
            fontSize: "clamp(0.85rem, 1.3vw, 1rem)",
            fontWeight: 600,
            letterSpacing: "0.03em",
            lineHeight: 1.5,
            color: RED,
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Amsterdam based visual comms designer
          <br />
          and art director.
        </motion.p>
      </div>

      {/* ── Work grid ─────────────────────────────────────────────── */}
      {/* no fade on the container itself — each tile runs its own measured
          entrance, and stacking the two would double-fade them */}
      <div style={{ padding: `0 ${SIDE_PAD} ${GUTTER}`, marginTop: GAP_SUB_GRID }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: GUTTER, marginBottom: GUTTER }}>
          <WorkTile show={settled} aspect="4 / 3" />
          <WorkTile show={settled} aspect="4 / 3" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: GUTTER, marginBottom: GUTTER }}>
          <WorkTile show={settled} aspect="4 / 3" />
          <WorkTile show={settled} aspect="4 / 3" />
        </div>

        {/* Bio + services */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: GUTTER, marginBottom: GUTTER }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: GUTTER, marginBottom: GUTTER }}>
          <WorkTile show={settled} aspect="4 / 3" />
          <WorkTile show={settled} aspect="4 / 3" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: GUTTER }}>
          <WorkTile show={settled} aspect="4 / 3" />
          <WorkTile show={settled} aspect="4 / 3" />
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
          margin: `0 ${SIDE_PAD} 40px`,
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
