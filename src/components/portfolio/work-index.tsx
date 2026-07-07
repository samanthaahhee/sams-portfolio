"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Media } from "./media";
import type { PortfolioProject } from "@/lib/db-portfolio";

/* Placeholder covers — shown until real media is uploaded */
const PH_COVERS = [
  "https://picsum.photos/seed/walkrr-cover/1600/900",
  "https://picsum.photos/seed/bos-cover/1600/900",
  "https://picsum.photos/seed/temper-cover/1600/900",
  "https://picsum.photos/seed/recharge-cover/1600/900",
  "https://picsum.photos/seed/smallstitch-cover/1600/900",
  "https://picsum.photos/seed/icetea-cover/1600/900",
];

const PLACEHOLDER_PROJECTS: PortfolioProject[] = [
  { id: 0, slug: "walkrr", title: "Walkrr", discipline: "Brand Design", client: "Walkrr", role: "Brand Designer", year: "2023", orderIndex: 0, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[0], coverType: "image" },
  { id: 1, slug: "bos-ice-tea", title: "BOS Ice Tea", discipline: "360 Campaign", client: "BOS", role: "Art Director", year: "2022", orderIndex: 1, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[1], coverType: "image" },
  { id: 2, slug: "temper", title: "Temper", discipline: "Brand System", client: "Temper", role: "Product Designer", year: "2022", orderIndex: 2, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[2], coverType: "image" },
  { id: 3, slug: "recharge", title: "Recharge.com", discipline: "Art Direction", client: "Recharge.com", role: "Visual Designer", year: "2021", orderIndex: 3, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[3], coverType: "image" },
  { id: 4, slug: "small-stitch", title: "Small Stitch", discipline: "Brand Identity", client: "Small Stitch", role: "Brand Designer", year: "2023", orderIndex: 4, visible: true, workGridTemplate: null, coverUrl: PH_COVERS[4], coverType: "image" },
];

// The strip is driven manually. Every tile is a fixed 16:9 box; the focus tile
// is scaled up with a CSS transform (visual only — no layout reflow), so the
// enlargement never shifts the other tiles or the infinite loop.
const ACTIVE_W = 820;       // focus image width (10% smaller)
const PASSIVE_SCALE = 0.49; // secondary tiles are much smaller (per reference)
const GAP = 28;
const PAD = 56;             // left focus position
const COPIES = 6;           // repeated project sets for the infinite wrap
const IMG_RATIO = "16 / 10.35"; // 16:9 with height +15%
const RATIO = 16 / 10.35;   // numeric ratio for vertical-centering math
const META_H = 74;          // approx height of the title + discipline block

// Smooth 0..1 "focus-ness" by distance (in tile units) from the focus point.
function foc(d: number) {
  const a = Math.max(0, 1 - Math.abs(d));
  return a * a * (3 - 2 * a);
}

export function WorkIndex({ projects }: { projects: PortfolioProject[] }) {
  const list = projects.length > 0 ? projects : PLACEHOLDER_PROJECTS;
  const n = list.length;
  const T = COPIES * n;

  const containerRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pos = useRef(2 * n);    // continuous focus position (project 0 active)
  const target = useRef(2 * n);
  const rafRef = useRef(0);

  // Vertical layout: centre the hero tile in the viewport (all tiles share this
  // bottom baseline), and anchor the intro just above the passive tiles.
  const [vlayout, setVlayout] = useState({ bottom: 150, introBottom: 500 });
  useEffect(() => {
    const compute = () => {
      const containerH = window.innerHeight - 56;
      const heroTileH = ACTIVE_W / RATIO + META_H;
      const bottom = Math.max(36, (containerH - heroTileH) / 2);
      const passiveTileH = (ACTIVE_W * PASSIVE_SCALE) / RATIO + META_H;
      setVlayout({ bottom, introBottom: bottom + passiveTileH + 28 });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    const w = new Array<number>(T);
    const C = new Array<number>(T);
    let settle: ReturnType<typeof setTimeout>;
    const SCROLL_UNIT = ACTIVE_W * PASSIVE_SCALE + GAP; // px per tile advance

    const frame = () => {
      pos.current += (target.current - pos.current) * 0.14;
      if (Math.abs(target.current - pos.current) < 0.0005) pos.current = target.current;

      // Infinite wrap — content repeats every n, so shifting pos by n is seamless.
      const lo = n, hi = (COPIES - 2) * n;
      if (pos.current < lo) { pos.current += n; target.current += n; }
      else if (pos.current > hi) { pos.current -= n; target.current -= n; }

      const p = pos.current;
      for (let L = 0; L < T; L++) w[L] = ACTIVE_W * (PASSIVE_SCALE + (1 - PASSIVE_SCALE) * foc(L - p));
      C[0] = 0;
      for (let L = 1; L < T; L++) C[L] = C[L - 1] + w[L - 1] + GAP;
      const b = Math.floor(p);
      const Cpos = C[b] + (p - b) * (w[b] + GAP);
      const scroll = Cpos - PAD;

      for (let L = 0; L < T; L++) {
        const el = tileRefs.current[L];
        if (!el) continue;
        const f = foc(L - p);
        el.style.width = w[L] + "px"; // only the image column resizes; meta stays constant
        el.style.transform = `translate3d(${C[L] - scroll}px,0,0)`;
        el.style.opacity = String(0.4 + 0.6 * f);
        el.style.zIndex = f > 0.5 ? "3" : "1";
      }
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    const el = containerRef.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      target.current += d / SCROLL_UNIT;
      clearTimeout(settle);
      settle = setTimeout(() => { target.current = Math.round(target.current); }, 150);
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => { cancelAnimationFrame(rafRef.current); clearTimeout(settle); el.removeEventListener("wheel", onWheel); };
  }, [T, n]);

  function goTo(L: number) { target.current = L; }

  const tiles = Array.from({ length: T }, (_, L) => ({ L, proj: list[L % n], i: L % n }));

  return (
    <div ref={containerRef} style={{ height: "calc(100vh - 56px)", position: "relative", overflow: "hidden" }}>
      {/* Mask the left gutter so tiles wrapping past the edge don't peek */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: PAD, background: "#fff", zIndex: 4, pointerEvents: "none" }} />

      {/* Intro — anchored just above the passive tiles' top edge */}
      <div style={{ position: "absolute", bottom: vlayout.introBottom, left: PAD + ACTIVE_W + 40, zIndex: 5, maxWidth: 600, pointerEvents: "none" }}>
        <h1 className="font-lore" style={{ fontSize: "clamp(2.4rem, 3.6vw, 3.4rem)", fontWeight: 700, lineHeight: 1, color: "#111" }}>
          Thanks
        </h1>
        <p className="font-lore" style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.4rem)", fontWeight: 400, lineHeight: 1.4, color: "#111", marginTop: 18 }}>
          for stopping by.<br />here is a collection<br />of work <span style={{ fontWeight: 700 }}>I&rsquo;m</span> proud of.
        </p>
      </div>

      {/* Tiles — absolutely positioned, driven by the rAF loop above */}
      {tiles.map(({ L, proj, i }) => {
        const cover = proj.coverUrl ?? PH_COVERS[i % PH_COVERS.length];
        const type = (proj.coverType ?? "image") as "image" | "gif" | "mp4";
        return (
          <div
            key={L}
            ref={(el) => { tileRefs.current[L] = el; }}
            onClick={() => goTo(L)}
            style={{
              position: "absolute",
              left: 0,
              bottom: vlayout.bottom,
              width: ACTIVE_W,
              willChange: "transform, opacity",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ width: "100%", aspectRatio: IMG_RATIO, borderRadius: 20, overflow: "hidden", position: "relative", background: "#e9e7e2" }}>
              <Media src={cover} type={type} alt={proj.title} className="w-full h-full object-cover" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "18px 4px 0", gap: 16 }}>
              <div style={{ minWidth: 0 }}>
                <div className="font-portfolio-sans" style={{ fontSize: 26, fontWeight: 700, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.1 }}>
                  {proj.title}
                </div>
                <div className="font-portfolio-sans" style={{ fontSize: 15, color: "#888", marginTop: 4, whiteSpace: "nowrap" }}>
                  {proj.discipline}
                </div>
              </div>
              <Link
                href={`/work/${proj.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="font-portfolio-sans"
                style={{ fontSize: 15, fontWeight: 700, color: "#111", whiteSpace: "nowrap", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                View project <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
