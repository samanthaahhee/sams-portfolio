"use client";

/**
 * Client island for /hero-preview — lava-lamp morphing blobs (SVG
 * goo filter on animated coloured circles) plus a magnifying-glass
 * cursor that follows the mouse inside the hero section.
 */

import { useEffect, useRef } from "react";

const BLOBS = [
  { size: 26, x: 18, y: 30, dx: 18, dy: 22, dur: 11, color: "#e89478" },
  { size: 32, x: 60, y: 25, dx: -22, dy: 28, dur: 13, color: "#d4684a" },
  { size: 22, x: 78, y: 65, dx: -18, dy: -24, dur: 9, color: "#d4a04a" },
  { size: 28, x: 35, y: 70, dx: 24, dy: -20, dur: 14, color: "#b8807a" },
  { size: 18, x: 50, y: 50, dx: -16, dy: 18, dur: 8, color: "#e89478" },
  { size: 24, x: 88, y: 32, dx: -28, dy: 14, dur: 12, color: "#d4684a" },
  { size: 20, x: 8, y: 70, dx: 22, dy: -22, dur: 10, color: "#d4a04a" },
] as const;

export function HeroBlobs() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lensRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  // Mouse-following lens with eased trailing.
  useEffect(() => {
    const el = containerRef.current;
    const lens = lensRef.current;
    if (!el || !lens) return;

    // No lens on touch devices — falls back to default tap behaviour.
    if (window.matchMedia("(hover: none)").matches) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      targetPos.current.x = e.clientX - r.left;
      targetPos.current.y = e.clientY - r.top;
      lens.style.opacity = "1";
    };
    const onLeave = () => {
      if (lens) lens.style.opacity = "0";
    };

    // Initial position offscreen.
    currentPos.current.x = -200;
    currentPos.current.y = -200;
    targetPos.current.x = -200;
    targetPos.current.y = -200;

    const tick = () => {
      // Lerp toward target for soft trailing.
      currentPos.current.x +=
        (targetPos.current.x - currentPos.current.x) * 0.18;
      currentPos.current.y +=
        (targetPos.current.y - currentPos.current.y) * 0.18;
      if (lens) {
        lens.style.transform = `translate3d(${currentPos.current.x - 60}px, ${
          currentPos.current.y - 60
        }px, 0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{
        height: "calc(100vh - 56px)",
        minHeight: 560,
        background: "#1f0f0c",
        cursor: "none",
      }}
    >
      {/* SVG goo filter — heavy gaussian blur followed by an alpha
          threshold matrix glues overlapping circles into one organic
          shape with smooth edges (the lava-lamp / metaball trick). */}
      <svg
        aria-hidden
        width="0"
        height="0"
        style={{ position: "absolute" }}
      >
        <defs>
          <filter id="hp-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Gooey blob layer */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ filter: "url(#hp-goo)" }}
      >
        {BLOBS.map((b, i) => (
          <span
            key={i}
            className={`hp-blob hp-blob--${i}`}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}vmin`,
              height: `${b.size}vmin`,
              background: b.color,
              ["--dx" as string]: `${b.dx}vmin`,
              ["--dy" as string]: `${b.dy}vmin`,
              ["--dur" as string]: `${b.dur}s`,
              ["--delay" as string]: `${-i * 1.7}s`,
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(20,8,6,0.78) 95%)",
        }}
      />

      {/* Faint grain */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Headline */}
      <div className="relative h-full flex items-center justify-center px-[var(--spacing-page)] text-white">
        <h1
          className="font-display text-center leading-[0.95]"
          style={{
            fontSize: "clamp(2.5rem, 9vw, 8.5rem)",
            letterSpacing: "-0.025em",
            textShadow:
              "0 1px 0 rgba(0,0,0,0.25), -1.5px 0 0 rgba(232,148,120,0.22), 1.5px 0 0 rgba(108,154,200,0.18)",
          }}
        >
          A multidisciplinary
          <br />
          designer.
        </h1>
      </div>

      {/* Bottom info strip */}
      <div className="absolute left-0 right-0 bottom-0 px-[var(--spacing-page)] pb-5 md:pb-8 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.14em] text-white/85">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          <div>
            <p>Based in Amsterdam</p>
            <p className="text-white/55">Born in Cape Town</p>
          </div>
          <div className="md:text-center">
            <p>Multidisciplinary designer</p>
            <p className="text-white/55">brand · product · visual</p>
          </div>
          <div className="md:text-right">
            <p>Brand, product, illustration</p>
            <p className="text-white/55">and visual communication</p>
          </div>
        </div>
      </div>

      {/* Magnifying-glass lens — follows the cursor inside the hero */}
      <div
        ref={lensRef}
        aria-hidden
        className="absolute pointer-events-none top-0 left-0 transition-opacity duration-200"
        style={{
          width: 120,
          height: 120,
          borderRadius: 9999,
          border: "1.5px solid rgba(255,255,255,0.85)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.25) inset",
          backdropFilter:
            "saturate(2) contrast(1.15) brightness(1.08) invert(0.04)",
          WebkitBackdropFilter:
            "saturate(2) contrast(1.15) brightness(1.08) invert(0.04)",
          mixBlendMode: "screen",
          opacity: 0,
          willChange: "transform",
          zIndex: 30,
        }}
      >
        {/* Tiny crosshair dot in the middle */}
        <span
          aria-hidden
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            width: 4,
            height: 4,
            marginTop: -2,
            marginLeft: -2,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.85)",
          }}
        />
      </div>

      {/* Animation rules — kept inline so this stays a self-contained
          preview component. Each blob orbits a different ellipse for
          continuous, never-repeating motion. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hp-blob {
          position: absolute;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          will-change: transform;
          animation: hp-orbit var(--dur) ease-in-out var(--delay) infinite alternate;
        }
        @media (prefers-reduced-motion: reduce) {
          .hp-blob { animation: none !important; }
        }
        @keyframes hp-orbit {
          0%   { transform: translate(-50%, -50%) translate(0, 0) scale(1); }
          25%  { transform: translate(-50%, -50%) translate(var(--dx), 0) scale(1.15); }
          50%  { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.92); }
          75%  { transform: translate(-50%, -50%) translate(0, var(--dy)) scale(1.1); }
          100% { transform: translate(-50%, -50%) translate(calc(var(--dx) * -0.4), calc(var(--dy) * 0.6)) scale(1); }
        }
        `,
        }}
      />
    </div>
  );
}
