/**
 * Preview-only landing-hero exploration inspired by Monopo London.
 *
 *  • Soft morphing gradient blobs on a deep warm-earthy base
 *  • Big display type centred over the gradient
 *  • Minimal three-column info strip pinned to the bottom
 *
 * Pure CSS + SVG (no JS) for the animation, with prefers-reduced-motion
 * honoured. Lives at /hero-preview and is not linked from anywhere on
 * the live site — promote it to /page.tsx when you're happy with it.
 */

import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Hero preview" };

export default function HeroPreview() {
  return (
    <div className="bg-[#1f0f0c] text-white">
      <SiteHeader pageNo="HP" />

      <section
        className="relative w-full overflow-hidden"
        style={{ height: "calc(100vh - 56px)", minHeight: 560 }}
      >
        {/* Base background */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "#1f0f0c" }}
        />

        {/* Animated gradient blobs */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div className="hp-blob hp-blob--1" />
          <div className="hp-blob hp-blob--2" />
          <div className="hp-blob hp-blob--3" />
          <div className="hp-blob hp-blob--4" />
        </div>

        {/* Vignette to deepen the corners */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 35%, rgba(20,8,6,0.75) 90%)",
          }}
        />

        {/* Faint film grain */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* Headline */}
        <div className="relative h-full flex items-center justify-center px-[var(--spacing-page)]">
          <h1
            className="font-display text-center leading-[0.95]"
            style={{
              fontSize: "clamp(2.5rem, 9vw, 8.5rem)",
              letterSpacing: "-0.025em",
              textShadow:
                "0 1px 0 rgba(0,0,0,0.25), -1.5px 0 0 rgba(232,148,120,0.18), 1.5px 0 0 rgba(108,154,200,0.14)",
            }}
          >
            A multidisciplinary
            <br />
            designer.
          </h1>
        </div>

        {/* Bottom info strip */}
        <div className="absolute left-0 right-0 bottom-0 px-[var(--spacing-page)] pb-5 md:pb-8 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.14em]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 text-white/85">
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
      </section>

      <div className="px-[var(--spacing-page)] py-12 md:py-16 text-center">
        <p className="font-mono text-[color:var(--meta)] text-[10px] uppercase tracking-[0.14em]">
          Preview · not linked publicly. Live homepage is unchanged.
        </p>
      </div>

      {/* All animation in one place. Pure CSS so the page stays a
          server component. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hp-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          will-change: transform;
          opacity: 0.92;
        }
        @media (prefers-reduced-motion: reduce) {
          .hp-blob { animation: none !important; }
        }
        .hp-blob--1 {
          width: 70vw; height: 70vw;
          left: -22%; top: -28%;
          background: #e89478;
          animation: hp-drift-1 22s ease-in-out infinite alternate;
        }
        .hp-blob--2 {
          width: 60vw; height: 60vw;
          right: -18%; top: -8%;
          background: #d4684a;
          animation: hp-drift-2 26s ease-in-out infinite alternate;
        }
        .hp-blob--3 {
          width: 85vw; height: 85vw;
          left: 8%; bottom: -50%;
          background: #d4a04a;
          opacity: 0.7;
          animation: hp-drift-3 30s ease-in-out infinite alternate;
        }
        .hp-blob--4 {
          width: 50vw; height: 50vw;
          right: -12%; bottom: -25%;
          background: #b8807a;
          opacity: 0.85;
          animation: hp-drift-4 34s ease-in-out infinite alternate;
        }
        @keyframes hp-drift-1 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(28vw, 18vh) scale(1.18); }
          100% { transform: translate(8vw, 48vh) scale(0.92); }
        }
        @keyframes hp-drift-2 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-22vw, 28vh) scale(1.12); }
          100% { transform: translate(-8vw, 8vh) scale(0.96); }
        }
        @keyframes hp-drift-3 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(18vw, -22vh) scale(1.08); }
          100% { transform: translate(-14vw, -38vh) scale(1.04); }
        }
        @keyframes hp-drift-4 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-28vw, -18vh) scale(1.18); }
          100% { transform: translate(-8vw, -32vh) scale(0.92); }
        }
      `,
        }}
      />
    </div>
  );
}
