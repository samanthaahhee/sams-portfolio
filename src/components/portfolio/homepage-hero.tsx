"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useSpring, useTransform } from "motion/react";

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

const META = {
  role: "VISUAL COMMS DESIGNER",
  year: "2026",
  handle: "@SAMANTHAAHHEE",
};

/* Real profiles, not invented: LinkedIn from src/lib/about.ts, Behance from
   the source note in src/lib/projects.ts. */
const SOCIALS = [
  { label: "Behance", href: "https://www.behance.net/Samantha_ahhee" },
  { label: "LinkedIn", href: "https://linkedin.com/in/samanthaahhee" },
];

const CONTACT = {
  email: "samantha.ahhee@gmail.com",
  phone: "+31 68 545 5874",
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

/* The distortion is anchored to the VIEWPORT, not to the image: the bottom
   BAND_FRACTION of the screen is a warp zone, and whatever content passes
   through it gets bent, so the effect lands part-way up an image rather
   than folding the whole element.

   This is drawn on a canvas rather than with DOM elements. Slicing the
   tile into divs was the obvious approach but it cannot be made smooth:
   every slice is a single uniform blit, so a vertical line in a photo
   breaks by (slope x halfWidth x sliceHeight) at each boundary. Even at
   140 slices that left ~1.8px jags. Drawing one device-pixel row at a
   time with fractional source/destination rects lets the canvas
   interpolate between rows instead, so the warp is continuous. */
const BAND_FRACTION = 0.125;
const MASK_POINTS = 220;
const MAX_FLARE = 0.5; // deepest point splays to 1.5x width
const FLARE_CURVE = 3; // high power => straight sides, then a sharp trumpet
/* On top of the flare the whole row slides sideways as it sinks, by an
   amount that depends only on depth — never on x. That makes every
   vertical line lean together, so the gutter bends as one channel instead
   of standing rigid, and because it is a pure translation no width
   changes: the gap stays exactly as wide at the floor as at the top.
   Expressed as a fraction of the row's combined tile width so it scales
   with the layout. */
const MAX_SHEAR = 0.025;

/** A work tile whose image bends through the viewport's bottom band.
 *  Pass `src`; without one it renders a flat grey placeholder. */
function WorkTile({ aspect = "4 / 3", src }: { aspect?: string; src?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.decoding = "async";
    const done = () => {
      imgRef.current = img;
      setLoaded(true);
    };
    img.onload = done;
    img.src = src;
    if (img.complete && img.naturalWidth) done();
  }, [src]);

  useEffect(() => {
    let raf = 0;
    let lastKey = "";
    let sizedFor = "";

    const tick = () => {
      const host = hostRef.current;
      const canvas = canvasRef.current;
      const row = host?.parentElement;
      if (!host || !canvas || !row) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const rect = host.getBoundingClientRect();
      const vh = window.innerHeight;
      const bandTop = vh * (1 - BAND_FRACTION);
      const W = rect.width;
      const H = rect.height;
      if (W < 1 || H < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      /* Only the TILES stretch; gutters keep their exact base width and
         ride outward. Re-solving the row layout under that constraint
         makes the tile's shift linear in the flare:

           delta(f) = B * (f - 1),
           B = (widthsBefore + ownWidth/2) - totalWidths/2

         B is the tile's centre in "tile-width space" relative to the row
         centre, so outer tiles lean out hard while a tile centred in a
         three-up row has B = 0 and opens both ways about itself. Nothing
         stays parallel, and gutters cannot part because the tiles either
         side shift by exactly what the tiles between them grew. */
      const siblings = Array.from(row.children).filter(
        (c) => (c as HTMLElement).dataset.worktile !== undefined,
      ) as HTMLElement[];
      const idx = siblings.indexOf(host);
      let widthsBefore = 0;
      let totalWidths = 0;
      for (let s = 0; s < siblings.length; s++) {
        const w = siblings[s].getBoundingClientRect().width;
        if (s < idx) widthsBefore += w;
        totalWidths += w;
      }
      const B = widthsBefore + W / 2 - totalWidths / 2;

      const flareAt = (yAbs: number) => {
        const k = Math.max(0, Math.min(1, (yAbs - bandTop) / (vh - bandTop)));
        return 1 + MAX_FLARE * Math.pow(k, FLARE_CURVE);
      };
      /* Same easing as the flare, but a plain sideways offset. Driven off
         the row's combined width so every tile in the row shifts by an
         identical amount and the gutters ride along unchanged. */
      const shearMax = totalWidths * MAX_SHEAR;
      const shearAt = (yAbs: number) => {
        const k = Math.max(0, Math.min(1, (yAbs - bandTop) / (vh - bandTop)));
        return shearMax * Math.pow(k, FLARE_CURVE);
      };

      // horizontal room the flare needs on each side of the tile
      const pad = Math.ceil((W * MAX_FLARE) / 2 + Math.abs(B) * MAX_FLARE + shearMax + 2);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = W + pad * 2;

      const sizeKey = `${Math.round(cssW)}x${Math.round(H)}@${dpr}`;
      if (sizedFor !== sizeKey) {
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width = `${cssW}px`;
        canvas.style.height = `${H}px`;
        canvas.style.left = `${-pad}px`;
        sizedFor = sizeKey;
        lastKey = ""; // force a redraw at the new size
      }

      /* Redraw on any sub-pixel movement, but ONLY while the tile actually
         touches the warp band. Rounding the position to whole pixels was a
         jitter source — the canvas scrolls smoothly with the page while its
         drawn warp refreshed once per pixel, so the bend snapped a step
         behind the movement. Tiles clear of the band are unwarped, so their
         pixels never change: they draw once and are then skipped, which is
         what keeps the per-frame cost to the one or two tiles in the band. */
      const touchesBand = rect.bottom > bandTop && rect.top < vh;
      const key = `${touchesBand ? rect.top.toFixed(2) : "flat"}|${sizeKey}|${loaded}`;
      if (key === lastKey) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastKey = key;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        raf = requestAnimationFrame(tick);
        return;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, H);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const img = imgRef.current;
      // object-fit: cover mapping from the source image onto the tile
      let sx = 0;
      let sy = 0;
      let sw = 0;
      let sh = 0;
      if (img) {
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        if (iw / ih > W / H) {
          sh = ih;
          sw = ih * (W / H);
          sx = (iw - sw) / 2;
        } else {
          sw = iw;
          sh = iw / (W / H);
          sy = (ih - sh) / 2;
        }
      }

      const drawSpan = (yTop: number, yBot: number) => {
        const fTop = flareAt(rect.top + yTop);
        const fBot = flareAt(rect.top + yBot);
        const f = (fTop + fBot) / 2;
        const shear = (shearAt(rect.top + yTop) + shearAt(rect.top + yBot)) / 2;
        const dW = W * f;
        const dX = pad + W / 2 - dW / 2 + B * (f - 1) + shear;
        if (img) {
          ctx.drawImage(
            img,
            sx,
            sy + (yTop / H) * sh,
            sw,
            Math.max((sh * (yBot - yTop)) / H, 0.0001),
            dX,
            yTop,
            dW,
            yBot - yTop,
          );
        } else {
          ctx.fillStyle = "#e5e5e5";
          ctx.fillRect(dX, yTop, dW, yBot - yTop);
        }
      };

      /* Span boundaries are pinned to a fixed lattice measured from the
         TILE's own top, never from the band. Adaptive spans were the other
         jitter source: their heights depended on where the tile sat on
         screen, so every boundary crept across the image as you scrolled,
         and since each span is a uniform blit the content shimmered as
         they moved. On a lattice the boundaries always land on the same
         pixels of the picture, so only the stretch changes. */
      const flatUntil = Math.max(0, Math.min(H, bandTop - rect.top));
      // below the viewport floor the flare is clamped, so one span covers it
      const warpEnd = Math.min(H, Math.max(flatUntil, vh - rect.top));
      // keep the lattice fine, but never let a tall tile explode the count
      const step = Math.max(1 / dpr, (warpEnd - flatUntil) / 320);
      const firstWarp = Math.min(H, Math.ceil(flatUntil / step) * step);

      // everything above the band is unwarped: one blit, not many rows
      if (firstWarp > 0) drawSpan(0, firstWarp);

      for (let y = firstWarp; y < warpEnd; y += step) {
        drawSpan(y, Math.min(y + step, warpEnd));
      }
      if (warpEnd < H) drawSpan(warpEnd, H);

      // the silhouette is cut with a vector clip-path: canvas edges land on
      // pixel boundaries, this antialiases them
      const rightPts: string[] = [];
      const leftPts: string[] = [];
      for (let j = 0; j <= MASK_POINTS; j++) {
        const t = 1 - Math.pow(1 - j / MASK_POINTS, 2); // bias toward the bend
        const yPx = H * t;
        const f = flareAt(rect.top + yPx);
        const delta = B * (f - 1) + shearAt(rect.top + yPx);
        rightPts.push(`${(W / 2 + (W * f) / 2 + delta).toFixed(2)}px ${yPx.toFixed(2)}px`);
        leftPts.push(`${(W / 2 - (W * f) / 2 + delta).toFixed(2)}px ${yPx.toFixed(2)}px`);
      }
      host.style.clipPath = `polygon(${rightPts.join(",")},${leftPts.reverse().join(",")})`;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loaded]);

  return (
    /* overflow stays visible: the warped canvas deliberately extends past
       the tile's own box near the bottom of the viewport */
    <div
      ref={hostRef}
      data-worktile=""
      style={{ aspectRatio: aspect, position: "relative", overflow: "visible", borderRadius: 4 }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, display: "block" }} />
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

        {/* About — one panel holding the bio and the services rail, rather
            than two separate cards. Bio sits top-left with the contact
            link beneath it; services occupy the right-hand column. */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          className="font-portfolio-sans grid grid-cols-1 md:grid-cols-[7fr_3fr]"
          style={{
            background: "#f2f2f2",
            borderRadius: 4,
            padding: "clamp(32px, 4.5vw, 72px) clamp(36px, 6vw, 88px)",
            gap: "clamp(28px, 3vw, 48px)",
            marginBottom: GUTTER,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 40 }}>
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
            <Link
              href="/contact"
              className="hover:opacity-70 transition-opacity"
              style={{ color: RED, fontSize: "clamp(0.9rem, 1.15vw, 1rem)", fontWeight: 500 }}
            >
              Lets work together &rarr;
            </Link>
          </div>

          <div>
            <p
              style={{
                fontFamily: MONO,
                fontStyle: "italic",
                fontSize: 14,
                color: RED,
                marginBottom: 18,
              }}
            >
              Services &#8627;
            </p>
            <ul style={{ fontFamily: MONO, listStyle: "none", margin: 0, padding: 0 }}>
              {SERVICES.map((s) => (
                <li key={s} style={{ fontSize: 14, color: RED, lineHeight: 1.9 }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

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
      <motion.footer
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
        className="font-portfolio-sans"
        style={{
          background: RED,
          color: "#fff",
          margin: `0 ${SIDE_PAD} ${SIDE_PAD}`,
          borderRadius: 8,
          padding: "clamp(28px, 4.4vw, 76px)",
          /* headline pinned to the top, details to the bottom, with the
             block itself holding open the tall gap between them */
          minHeight: "clamp(320px, 34vw, 620px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 40,
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.5rem, 3.2vw, 3.1rem)",
            lineHeight: 1.18,
            fontWeight: 500,
            letterSpacing: "-0.015em",
            maxWidth: "16ch",
          }}
        >
          Looking forward to new projects and opportunities.
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "28px 32px",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:opacity-70 transition-opacity"
                  style={{
                    color: "#fff",
                    fontSize: "clamp(12px, 1.05vw, 15px)",
                    letterSpacing: "0.06em",
                  }}
                >
                  <span aria-hidden style={{ marginRight: 6 }}>
                    &#8627;
                  </span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <div style={{ textAlign: "right", marginLeft: "auto", display: "grid", gap: 2 }}>
            <a
              href={`mailto:${CONTACT.email}`}
              className="hover:opacity-70 transition-opacity"
              style={{ color: "#fff", fontSize: "clamp(1.05rem, 2.6vw, 2.55rem)", letterSpacing: "-0.01em" }}
            >
              {CONTACT.email}
            </a>
            <a
              href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
              className="hover:opacity-70 transition-opacity"
              style={{ color: "#fff", fontSize: "clamp(1.05rem, 2.6vw, 2.55rem)", letterSpacing: "-0.01em" }}
            >
              {CONTACT.phone}
            </a>
          </div>
        </div>
      </motion.footer>
    </>
  );
}
