"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useSpring, useTransform } from "motion/react";

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

/* The distortion is anchored to the VIEWPORT, not to the image: the bottom
   BAND_FRACTION of the screen is a warp zone, and whatever content is
   currently passing through it gets bent — so the effect lands part-way up
   an image rather than folding the whole element. A single CSS transform
   can't do that (it warps a rectangle uniformly), so each tile is built
   from horizontal strips and every strip reacts to its own screen
   position. Strips above the band are untouched. */
const BAND_FRACTION = 0.25;
/* Strips warp the CONTENT, but their edges are axis-aligned div borders,
   which the compositor pixel-snaps without antialiasing — so the silhouette
   they draw is always a visible staircase no matter how many you add. The
   visible edge is therefore cut by a clip-path polygon instead, which is
   vector geometry and antialiases cleanly. Each strip is sized from the
   flare at its BOTTOM edge, so content always covers the clip path and the
   staircase hides just outside it. */
const STRIP_COUNT = 140;
const MASK_POINTS = 220;
/* Strip height carries a small overlap to kill hairline seams; the
   background sizing below is derived from it so each slice still renders
   the image at exactly the tile's height. */
const STRIP_H = 100 / STRIP_COUNT + 0.2;
const BG_HEIGHT_PCT = 10000 / STRIP_H;
const BG_STEP_PCT = ((100 / STRIP_COUNT) * 100) / (100 - STRIP_H);
const MAX_FLARE = 0.5; // deepest point splays to 1.5x width
const FLARE_CURVE = 3; // high power => straight sides, then a sharp trumpet

/** A grey placeholder tile — pass `src` once real images are picked and
 *  each strip shows its own slice of the image, keeping the picture
 *  continuous while the bottom of the viewport bends it. */
function WorkTile({ aspect = "4 / 3", src }: { aspect?: string; src?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stripRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const host = hostRef.current;
      const row = host?.parentElement;
      if (host && row) {
        const rect = host.getBoundingClientRect();
        const vh = window.innerHeight;
        const bandTop = vh * (1 - BAND_FRACTION);

        /* The row bends as one surface, but only the TILES stretch — the
           gutters keep their exact base width and simply ride outward. If
           the gutters scaled too they would visibly part, which is wrong.

           So each tile scales about its own centre by `flare`, and the row
           is re-laid-out with constant gutters and re-centred. Solving that
           layout gives a translation that is linear in the flare:

             delta(f) = B * (f - 1),  B = (widthsBefore + ownWidth/2) - totalWidths/2

           B is the tile's centre measured in "tile-width space" relative to
           the row's centre, so an outer tile leans out hard, and a tile
           sitting on the centre of a three-up row has B = 0 and simply
           opens both ways about itself. Nothing stays parallel, and every
           gutter keeps its width because the tiles either side of it shift
           by exactly the amount the tiles between them grew. */
        const siblings = Array.from(row.children).filter((c) =>
          (c as HTMLElement).dataset.worktile !== undefined,
        ) as HTMLElement[];
        const idx = siblings.indexOf(host);
        let widthsBefore = 0;
        let totalWidths = 0;
        for (let s = 0; s < siblings.length; s++) {
          const w = siblings[s].getBoundingClientRect().width;
          if (s < idx) widthsBefore += w;
          totalWidths += w;
        }
        const W = rect.width;
        const B = widthsBefore + W / 2 - totalWidths / 2;

        // flare factor at an absolute viewport y
        const flareAt = (y: number) => {
          const k = Math.max(0, Math.min(1, (y - bandTop) / (vh - bandTop)));
          return 1 + MAX_FLARE * Math.pow(k, FLARE_CURVE);
        };

        if (rect.bottom > bandTop && rect.top < vh + rect.height) {
          for (let i = 0; i < STRIP_COUNT; i++) {
            const el = stripRefs.current[i];
            if (!el) continue;
            // size from the strip's lower edge: the widest it needs to be
            const f = flareAt(rect.top + (rect.height * (i + 1)) / STRIP_COUNT);
            el.style.transform = f > 1 ? `translateX(${(B * (f - 1)).toFixed(2)}px) scaleX(${f})` : "";
          }

          // antialiased silhouette, in the host's own pixel coordinates
          const right: string[] = [];
          const left: string[] = [];
          for (let j = 0; j <= MASK_POINTS; j++) {
            // bias samples toward the bottom, where the curve actually bends
            const t = 1 - Math.pow(1 - j / MASK_POINTS, 2);
            const yPx = rect.height * t;
            const f = flareAt(rect.top + yPx);
            const delta = B * (f - 1);
            const lx = W / 2 - (W * f) / 2 + delta;
            const rx = W / 2 + (W * f) / 2 + delta;
            right.push(`${rx.toFixed(2)}px ${yPx.toFixed(2)}px`);
            left.push(`${lx.toFixed(2)}px ${yPx.toFixed(2)}px`);
          }
          host.style.clipPath = `polygon(${right.join(",")},${left.reverse().join(",")})`;
        } else {
          for (let i = 0; i < STRIP_COUNT; i++) {
            const el = stripRefs.current[i];
            if (el && el.style.transform) el.style.transform = "";
          }
          if (host.style.clipPath) host.style.clipPath = "";
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    /* overflow must stay visible: the flared strips deliberately splay
       beyond the tile's own box near the bottom of the viewport */
    <div
      ref={hostRef}
      data-worktile=""
      style={{ aspectRatio: aspect, position: "relative", overflow: "visible" }}
    >
      {Array.from({ length: STRIP_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            stripRefs.current[i] = el;
          }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${(i * 100) / STRIP_COUNT}%`,
            // slight overlap so neighbouring strips never show a seam
            height: `${STRIP_H}%`,
            background: src ? undefined : "#e5e5e5",
            backgroundImage: src ? `url(${src})` : undefined,
            /* The image must render at exactly the tile's height inside a
               strip that is slightly taller than tileHeight/STRIP_COUNT
               (because of the overlap), otherwise each slice is scaled a
               few percent large and the picture visibly tears between
               strips. Both numbers are derived from STRIP_H for that
               reason rather than from STRIP_COUNT alone. */
            backgroundSize: `100% ${BG_HEIGHT_PCT}%`,
            backgroundPosition: `0 ${(i * BG_STEP_PCT).toFixed(4)}%`,
            backgroundRepeat: "no-repeat",
            borderRadius: i === 0 ? "4px 4px 0 0" : undefined,
            /* no will-change here: at 96 strips per tile it would promote
               hundreds of compositor layers for no gain */
          }}
        />
      ))}
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
          <WorkTile aspect="4 / 3" src="/images/bento/slot-1.jpg" />
          <WorkTile aspect="4 / 3" src="/images/bento/slot-4.jpg" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: GUTTER, marginBottom: GUTTER }}>
          <WorkTile aspect="4 / 3" src="/images/bento/slot-7.jpg" />
          <WorkTile aspect="4 / 3" src="/images/bento/slot-2.png" />
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
          <WorkTile aspect="4 / 3" src="/images/bento/slot-3.png" />
          <WorkTile aspect="4 / 3" src="/images/bento/slot-5.png" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: GUTTER }}>
          <WorkTile aspect="4 / 3" src="/images/bento/slot-6.png" />
          <WorkTile aspect="4 / 3" src="/images/bento/slot-1.jpg" />
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
