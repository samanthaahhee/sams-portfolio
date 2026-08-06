"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BAND_FRACTION, FLARE_CURVE, MASK_POINTS, MAX_FLARE, MAX_SHEAR } from "./warp";

const MONO = "var(--font-dm-mono)";

/** A work tile whose image bends through the viewport's bottom band.
 *  Pass `src`; without one it renders a flat grey placeholder. */
export function WorkTile({
  aspect = "4 / 3",
  src,
  title,
  tags = [],
  href,
}: {
  aspect?: string;
  src?: string;
  title?: string;
  tags?: string[];
  href?: string;
}) {
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
      className="group"
      style={{ aspectRatio: aspect, position: "relative", overflow: "visible", borderRadius: 4 }}
    >
      {/* Rounding lives on the canvas, not the host: the host must keep
          overflow visible for the warp, so it cannot clip anything. */}
      <canvas
        ref={canvasRef}
        className="transition-[border-radius] duration-300 ease-out group-hover:rounded-2xl"
        style={{ position: "absolute", top: 0, display: "block" }}
      />

      {(title || tags.length > 0) && (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            {title && <Pill label={title} solid />}
            {tags.map((t) => (
              <Pill key={t} label={t} />
            ))}
          </div>
          <span
            aria-hidden
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full"
            style={{ background: "rgba(255,255,255,0.35)", backdropFilter: "blur(12px) saturate(140%)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#1a1a1a" strokeWidth="1.6">
              <path d="M8.5 1.5H12.5V5.5M5.5 12.5H1.5V8.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      )}

      {href && (
        <Link href={href} aria-label={title} className="absolute inset-0" style={{ borderRadius: "inherit" }} />
      )}
    </div>
  );
}
/** Overlay pill. The first (the project name) is solid white; tags sit on
 *  a frosted panel so they stay legible over any image. */
function Pill({ label, solid = false }: { label: string; solid?: boolean }) {
  return (
    <span
      className="whitespace-nowrap rounded-full px-3 py-1.5"
      style={{
        fontFamily: MONO,
        fontSize: 12,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: solid ? "#1a1a1a" : "rgba(26,26,26,0.62)",
        background: solid ? "#fff" : "rgba(255,255,255,0.35)",
        backdropFilter: solid ? undefined : "blur(12px) saturate(140%)",
        WebkitBackdropFilter: solid ? undefined : "blur(12px) saturate(140%)",
      }}
    >
      {label}
    </span>
  );}
