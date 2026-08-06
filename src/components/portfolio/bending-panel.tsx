"use client";

import { useEffect, useRef } from "react";
import { BAND_FRACTION, FLARE_CURVE, MASK_POINTS, MAX_FLARE, MAX_SHEAR } from "./warp";

/** A flat-colour panel whose BACKGROUND bends through the viewport's
 *  bottom band, using the same flare + shear as the work tiles.
 *
 *  Only the background layer is warped, never the content: bending live
 *  text would need the tiles' slice-and-redraw treatment and would make
 *  the copy unreadable. Since these panels are a single flat colour, the
 *  silhouette is the whole effect, so this is both simpler and correct.
 *  The layer is wider than the panel so the flare has somewhere to go —
 *  a clip-path can only reveal pixels that exist. */
export function BendingPanel({
  color,
  radius = 4,
  className,
  style,
  children,
}: {
  color: string;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let last = "";
    const tick = () => {
      const host = hostRef.current;
      const bg = bgRef.current;
      if (!host || !bg) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const rect = host.getBoundingClientRect();
      const vh = window.innerHeight;
      const bandTop = vh * (1 - BAND_FRACTION);
      const W = rect.width;
      const H = rect.height;

      const touches = rect.bottom > bandTop && rect.top < vh;
      const key = touches ? `${rect.top.toFixed(2)}|${Math.round(W)}x${Math.round(H)}` : "flat";
      if (key === last || W < 1 || H < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      last = key;

      const pad = Math.ceil(W * MAX_FLARE * 0.5 + W * MAX_SHEAR + 2);
      bg.style.left = `${-pad}px`;
      bg.style.right = `${-pad}px`;

      if (!touches) {
        bg.style.clipPath = `inset(0 ${pad}px 0 ${pad}px round ${radius}px)`;
        raf = requestAnimationFrame(tick);
        return;
      }

      const shearMax = W * MAX_SHEAR;
      const at = (yPx: number) => {
        const k = Math.max(0, Math.min(1, (rect.top + yPx - bandTop) / (vh - bandTop)));
        const e = Math.pow(k, FLARE_CURVE);
        return { f: 1 + MAX_FLARE * e, shear: shearMax * e };
      };

      const right: string[] = [];
      const left: string[] = [];
      for (let j = 0; j <= MASK_POINTS; j++) {
        const t = 1 - Math.pow(1 - j / MASK_POINTS, 2);
        const yPx = H * t;
        const { f, shear } = at(yPx);
        // panel's own left edge sits at `pad` inside the wider layer
        const lx = pad + W / 2 - (W * f) / 2 + shear;
        const rx = pad + W / 2 + (W * f) / 2 + shear;
        right.push(`${rx.toFixed(2)}px ${yPx.toFixed(2)}px`);
        left.push(`${lx.toFixed(2)}px ${yPx.toFixed(2)}px`);
      }
      bg.style.clipPath = `polygon(${right.join(",")},${left.reverse().join(",")})`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [radius]);

  return (
    /* The caller's layout goes on the CONTENT layer, not the host: the host
       exists only to position the background behind it, and putting a grid
       there would make the background one of its tracks. */
    <div ref={hostRef} style={{ position: "relative" }}>
      <div
        ref={bgRef}
        aria-hidden
        style={{ position: "absolute", top: 0, bottom: 0, background: color, pointerEvents: "none" }}
      />
      <div className={className} style={{ ...style, position: "relative" }}>
        {children}
      </div>
    </div>
  );
}
