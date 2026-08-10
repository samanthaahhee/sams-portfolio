"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { BendingPanel } from "./bending-panel";
import { WorkTile } from "./work-tile";
import { SiteFooter } from "./site-footer";
import { META_STYLE, MetaRowContent } from "./site-meta";

/* ── Homepage ─────────────────────────────────────────────────────────
   Recreates Sam's reference design (red lettering logo, meta row, work
   grid, bio + services, contact banner) as a normal stacked page — no
   sticky/pin trickery, just scroll-triggered reveals (motion's
   whileInView) on each section. Grid images are grey placeholders until
   real assets are picked/uploaded. */

const RED = "#FF2E31";
/* DM Mono, referenced by variable: the next/font class is on <html>, so the
   custom property resolves anywhere without needing a Tailwind utility. */
const MONO = "var(--font-dm-mono)";

const FIELDS = ["Fintech", "FMCG", "Retail", "Consumer Tech"];

const SERVICES = [
  "Art Direction",
  "Packaging",
  "Creative Strategy",
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
  /* What actually gets rendered. While the cursor is being followed these
     mirror the springs; at snap time they are detached and animated
     directly. Animating the SPRINGS instead bends the flight path badly —
     the spring keeps pulling toward the last cursor position and carries a
     different residual velocity on each axis, so the logo arcs across the
     screen instead of travelling straight. */
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const reveal = useMotionValue(0);
  const clipPath = useTransform(reveal, (v) => `inset(0 ${100 - v}% 0 0)`);

  useEffect(() => {
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);
    x.set(window.innerWidth / 2);
    y.set(window.innerHeight / 2);
  }, [mouseX, mouseY, x, y]);

  useEffect(() => {
    if (!isTracking) return;

    // mirror the spring-smoothed cursor while we are still following it
    const unsubX = springX.on("change", (v) => x.set(v));
    const unsubY = springY.on("change", (v) => y.set(v));

    let started = false;
    const snap = () => {
      setIsTracking(false);
      /* Detach from the springs first. Left attached they keep driving
         toward the last cursor position, which is what bent the flight
         path into an arc. Once detached, x and y are plain values and a
         shared duration + easing makes both axes interpolate in lockstep,
         so the logo travels in a straight line to its resting place. */
      unsubX();
      unsubY();

      const rect = targetRef.current?.getBoundingClientRect();
      if (!rect) return;
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      const targetScale = rect.width / LOGO_TRACK_WIDTH;

      const opts = { duration: ENLARGE_SECONDS, ease: "easeInOut" as const };
      animate(x, targetX, opts);
      animate(y, targetY, opts);
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
    return () => {
      window.removeEventListener("mousemove", handleMove);
      unsubX();
      unsubY();
    };
  }, [isTracking, mouseX, mouseY, springX, springY, x, y, scale, reveal, onSettled]);

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
            x,
            y,
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

export type HomeTile = {
  slug: string;
  client: string;
  title: string;
  src?: string;
};

export function HomepageHero({ tiles = [] }: { tiles?: HomeTile[] }) {
  /* Two-up rows, as many as there are projects. The about panel sits
     after the second row, so the grid reads as work / about / more work
     however long the list gets. */
  const rows: HomeTile[][] = [];
  for (let i = 0; i < tiles.length; i += 2) rows.push(tiles.slice(i, i + 2));
  const ROW_STYLE: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: GUTTER,
    marginBottom: GUTTER,
  };
  /* Both pills come from the project row: client on the solid pill,
     title on the frosted one — the same pair the project page shows as
     "CLIENT | TITLE". */
  const renderRow = (row: HomeTile[], key: number) => (
    <div key={key} style={ROW_STYLE}>
      {row.map((t) => (
        <WorkTile
          key={t.slug}
          aspect="4 / 3"
          src={t.src}
          title={t.client}
          tags={t.title ? [t.title] : []}
          href={`/work/${t.slug}`}
        />
      ))}
    </div>
  );

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
          style={{ ...META_STYLE, color: RED }}
        >
          <MetaRowContent />
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
        {rows.slice(0, 2).map(renderRow)}

        {/* About — one panel, laid out as two rows rather than two columns:
            the intro occupies the first row on its own, then the contact
            link and the services rail share the second. That is what drops
            services below the intro instead of alongside it, and keeps its
            label on the same baseline as the link. */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          className="font-portfolio-sans"
        >
        <BendingPanel
          color="#f2f2f2"
          className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto]"
          style={{
            padding: "clamp(32px, 4.5vw, 72px) clamp(36px, 6vw, 88px)",
            columnGap: "clamp(28px, 3vw, 48px)",
            rowGap: "clamp(36px, 4vw, 64px)",
          }}
        >
          <p
            style={{
              fontSize: "clamp(1.15rem, 2.1vw, 1.85rem)",
              lineHeight: 1.32,
              color: RED,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              maxWidth: "26ch",
            }}
          >
            Hey I&rsquo;m Sam, a South African Visual Comms Designer living in Amsterdam. I enjoy
            helping start-ups and scale-ups create memorable brand experiences.
          </p>
          {/* holds the intro row open across the second column */}
          <div className="hidden md:block" aria-hidden />

          <Link
            href="/contact"
            className="hover:opacity-70 transition-opacity self-start"
            style={{ color: RED, fontSize: "clamp(0.9rem, 1.15vw, 1rem)", fontWeight: 500 }}
          >
            Lets work together &rarr;
          </Link>

          {/* Two mono rails, both flush to the panel's right padding so the
              right inset reads the same as the left. */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "clamp(28px, 3.4vw, 56px)",
              textAlign: "right",
            }}
          >
            {[
              { label: "Fields", items: FIELDS },
              { label: "Services", items: SERVICES },
            ].map(({ label, items }) => (
              <div key={label}>
                <p style={{ fontFamily: MONO, fontStyle: "italic", fontSize: 14, color: RED, marginBottom: 18 }}>
                  {label} &#8627;
                </p>
                <ul style={{ fontFamily: MONO, listStyle: "none", margin: 0, padding: 0 }}>
                  {items.map((s) => (
                    <li key={s} style={{ fontSize: 14, color: RED, lineHeight: 1.9, whiteSpace: "nowrap" }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </BendingPanel>
        </motion.div>

        <div style={{ marginTop: GUTTER }}>{rows.slice(2).map(renderRow)}</div>
      </div>

      {/* ── Contact banner ────────────────────────────────────────── */}
      <SiteFooter sidePad={SIDE_PAD} />
    </>
  );
}
