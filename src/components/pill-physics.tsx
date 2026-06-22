"use client";

/**
 * A playful 2D physics playground inspired by the "sad box" tag soup
 * from the old Framer portfolio. Pills and spiky stars are rigid
 * bodies under gravity; the visitor can drag them around, fling them,
 * stack them, etc.
 *
 * Implementation notes
 * ────────────────────
 *  - Matter.js runs the simulation. Bodies are *invisible* — we read
 *    each body's position every frame and translate a matching DOM
 *    element. Keeps the typography crisp (no canvas raster) and lets
 *    the pills inherit existing site tokens.
 *  - DOM elements are located via querySelectorAll inside the
 *    container on each setup pass (and reused inside the rAF loop).
 *    This sidesteps React 19 callback-ref lifecycle weirdness that
 *    was leaving most refs null.
 *  - Stars are circumscribed polygon bodies — the visual is a spiky
 *    SVG path, but the hitbox is a heptagon. Close enough and
 *    avoids needing poly-decomp.
 *  - Mouse / touch dragging is wired via Matter's Mouse +
 *    MouseConstraint modules.
 *  - Reduce-motion users get a static pile with no engine running.
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Matter from "matter-js";

/* ── Types ─────────────────────────────────────────────────────────── */

export type Pill = {
  label: string;
  /** Pill background colour. */
  bg: string;
  /** Text colour. */
  fg?: string;
  /** Optional rotation in degrees applied at spawn. Otherwise random. */
  rotate?: number;
};

export type Star = {
  /** Approximate diameter in px. */
  size: number;
  bg: string;
  /** Number of points (default 7). */
  points?: number;
  /** Inner/outer radius ratio (default 0.6). Lower = spikier. */
  inset?: number;
  /** Optional inner blue dot in the middle. */
  dot?: string;
};

/* ── Defaults — matches the user's screenshot ──────────────────────── */

export const DEFAULT_PILLS: Pill[] = [
  { label: "UI design", bg: "#ffffff", fg: "#111111" },
  { label: "brand-builder", bg: "#ffffff", fg: "#111111" },
  { label: "design systems", bg: "#ffffff", fg: "#111111" },
  { label: "visual comms", bg: "#ffffff", fg: "#111111" },
  { label: "playlist maker", bg: "#cbe861", fg: "#1a1f0a" },
  { label: "nature lover", bg: "#7fc99c", fg: "#0e2418" },
  { label: "dinner party lover", bg: "#e9b6e2", fg: "#3a1230", rotate: -18 },
  { label: "explorer", bg: "#a8d4dd", fg: "#0c2a30" },
  { label: "bird watcher", bg: "#d18078", fg: "#3a0e0a" },
  { label: "runner", bg: "#6c9aff", fg: "#0a1530" },
  { label: "illustration", bg: "#ffffff", fg: "#111111" },
];

export const DEFAULT_STARS: Star[] = [
  { size: 60, bg: "#3fb59a", points: 7, inset: 0.55 },
  { size: 44, bg: "#6c5fff", points: 7, inset: 0.55 },
  { size: 56, bg: "#7e6a3e", points: 7, inset: 0.55 },
  { size: 130, bg: "#c8db4a", points: 8, inset: 0.52 },
  { size: 170, bg: "#ec8c52", points: 9, inset: 0.5, dot: "#0d4a6a" },
];

/* ── Helpers ───────────────────────────────────────────────────────── */

function starPathSvg(size: number, points = 7, inset = 0.6) {
  const outer = size / 2;
  const inner = outer * inset;
  const cx = size / 2;
  const cy = size / 2;
  const step = Math.PI / points;
  const verts: { x: number; y: number }[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * step - Math.PI / 2;
    verts.push({ x: Math.cos(a) * r + cx, y: Math.sin(a) * r + cy });
  }
  return verts
    .map((v, i) => `${i === 0 ? "M" : "L"} ${v.x.toFixed(2)} ${v.y.toFixed(2)}`)
    .join(" ")
    .concat(" Z");
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ── Component ─────────────────────────────────────────────────────── */

export function PillPhysics({
  pills = DEFAULT_PILLS,
  stars = DEFAULT_STARS,
  height = 520,
  background = "#000000",
  className = "",
}: {
  pills?: Pill[];
  stars?: Star[];
  height?: number;
  background?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState({ w: 0, h: height });
  const reduceMotion = useMemo(() => prefersReducedMotion(), []);
  const reactId = useId();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const setSize = () => {
      const rect = el.getBoundingClientRect();
      setMeasured({ w: Math.max(320, rect.width), h: height });
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [height]);

  useEffect(() => {
    if (reduceMotion) return;
    const el = containerRef.current;
    if (!el || measured.w === 0) return;

    const W = measured.w;
    const H = measured.h;

    const {
      Engine,
      Runner,
      Bodies,
      Composite,
      Mouse,
      MouseConstraint,
    } = Matter;

    const engine = Engine.create({
      gravity: { x: 0, y: 1, scale: 0.0014 },
    });
    const world = engine.world;

    // Walls — invisible, just contain the bodies.
    const wallOpts: Matter.IChamferableBodyDefinition = {
      isStatic: true,
      restitution: 0.4,
      friction: 0.5,
      render: { visible: false },
    };
    // Walls: floor + two sides. No ceiling — pills spawn above the
    // container and fall in. (An earlier version had a ceiling at
    // y = -100 which trapped every pill spawned above that line.)
    const wallT = 200;
    Composite.add(world, [
      Bodies.rectangle(W / 2, H + wallT / 2, W, wallT, wallOpts),
      Bodies.rectangle(-wallT / 2, H / 2, wallT, H * 4, wallOpts),
      Bodies.rectangle(W + wallT / 2, H / 2, wallT, H * 4, wallOpts),
    ]);

    // Find DOM nodes via querySelectorAll inside the container. This is
    // robust against React 19 callback-ref edge cases — every node that
    // was rendered is in the DOM by the time useEffect runs.
    const pillNodes = Array.from(
      el.querySelectorAll<HTMLDivElement>("[data-pill-idx]"),
    );
    const starNodes = Array.from(
      el.querySelectorAll<HTMLDivElement>("[data-star-idx]"),
    );

    // Pill bodies — sized from the rendered DOM element with a
    // label-length fallback in case the rect isn't laid out yet.
    const pillBodies: Matter.Body[] = [];
    for (let i = 0; i < pills.length; i++) {
      const node = pillNodes[i];
      const r = node?.getBoundingClientRect();
      const estW = pills[i].label.length * 9 + 40;
      const w = Math.max(r?.width ?? 0, estW, 80);
      const h = Math.max(r?.height ?? 0, 40);
      const x = ((i + 0.5) / pills.length) * W + (Math.random() - 0.5) * 60;
      const y = -80 - i * 50;
      const body = Bodies.rectangle(x, y, w, h, {
        chamfer: { radius: h / 2 },
        restitution: 0.45,
        friction: 0.25,
        frictionAir: 0.018,
        density: 0.0015,
        angle: ((pills[i].rotate ?? (Math.random() - 0.5) * 30) * Math.PI) / 180,
      });
      pillBodies.push(body);
    }

    // Stars — circumscribed polygon hitboxes (cheap + always valid).
    const starBodies: Matter.Body[] = [];
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const x = Math.random() * (W - 80) + 40;
      const y = -120 - Math.random() * 200;
      const body = Bodies.polygon(x, y, s.points ?? 7, s.size / 2, {
        restitution: 0.55,
        friction: 0.25,
        frictionAir: 0.022,
        density: 0.0012,
        angle: Math.random() * Math.PI,
      });
      starBodies.push(body);
    }

    Composite.add(world, [...pillBodies, ...starBodies]);

    // Mouse / touch.
    const mouse = Mouse.create(el);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        damping: 0.1,
        render: { visible: false },
      },
    });
    Composite.add(world, mouseConstraint);

    // Let the page scroll over the canvas.
    const m = mouse as unknown as {
      element: HTMLElement;
      mousewheel: EventListener;
    };
    m.element.removeEventListener("wheel", m.mousewheel);
    m.element.removeEventListener("DOMMouseScroll", m.mousewheel);

    const runner = Runner.create();
    Runner.run(runner, engine);

    let rafId = 0;
    const sync = () => {
      for (let i = 0; i < pillBodies.length; i++) {
        const node = pillNodes[i];
        if (!node) continue;
        const b = pillBodies[i];
        node.style.transform = `translate3d(${
          b.position.x - node.offsetWidth / 2
        }px, ${b.position.y - node.offsetHeight / 2}px, 0) rotate(${b.angle}rad)`;
      }
      for (let i = 0; i < starBodies.length; i++) {
        const node = starNodes[i];
        if (!node) continue;
        const b = starBodies[i];
        node.style.transform = `translate3d(${
          b.position.x - node.offsetWidth / 2
        }px, ${b.position.y - node.offsetHeight / 2}px, 0) rotate(${b.angle}rad)`;
      }
      rafId = requestAnimationFrame(sync);
    };
    rafId = requestAnimationFrame(sync);

    return () => {
      cancelAnimationFrame(rafId);
      Runner.stop(runner);
      Composite.clear(world, false, true);
      Engine.clear(engine);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measured.w, measured.h, reduceMotion, pills, stars]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{
        height,
        background,
        touchAction: "none",
        cursor: "grab",
      }}
      aria-label="Interactive playground of personality tags"
    >
      {/* Decorative starfield */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 18%, #ffffff14 0 1.5px, transparent 1.5px), radial-gradient(circle at 78% 32%, #ffffff10 0 1px, transparent 1px), radial-gradient(circle at 42% 72%, #ffffff10 0 1.5px, transparent 1.5px), radial-gradient(circle at 88% 86%, #ffffff14 0 1px, transparent 1px)",
        }}
      />

      {pills.map((p, i) => (
        <div
          key={`${reactId}-pill-${i}`}
          data-pill-idx={i}
          className="absolute top-0 left-0 px-5 py-2.5 rounded-full font-mono text-[15px] md:text-[16px] whitespace-nowrap shadow-[0_1px_0_rgba(0,0,0,0.06)] will-change-transform"
          style={{
            background: p.bg,
            color: p.fg ?? "#111",
            transform: "translate3d(-9999px, -9999px, 0)",
          }}
        >
          {p.label}
        </div>
      ))}

      {stars.map((s, i) => (
        <div
          key={`${reactId}-star-${i}`}
          data-star-idx={i}
          className="absolute top-0 left-0 will-change-transform"
          style={{
            width: s.size,
            height: s.size,
            transform: "translate3d(-9999px, -9999px, 0)",
          }}
        >
          <svg
            width={s.size}
            height={s.size}
            viewBox={`0 0 ${s.size} ${s.size}`}
            aria-hidden
          >
            <path
              d={starPathSvg(s.size, s.points ?? 7, s.inset ?? 0.6)}
              fill={s.bg}
            />
            {s.dot && (
              <circle
                cx={s.size / 2}
                cy={s.size / 2 + s.size * 0.05}
                r={s.size * 0.09}
                fill={s.dot}
              />
            )}
          </svg>
        </div>
      ))}

      {reduceMotion && (
        <div className="absolute inset-0 flex flex-wrap items-end content-end gap-2 p-6 pointer-events-none">
          {pills.map((p, i) => (
            <span
              key={i}
              className="px-5 py-2.5 rounded-full font-mono text-[15px]"
              style={{ background: p.bg, color: p.fg ?? "#111" }}
            >
              {p.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
