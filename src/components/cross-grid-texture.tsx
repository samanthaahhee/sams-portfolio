/**
 * Generative white cross-grid texture inspired by Carl Andre /
 * Vera Molnár-style optical works. A field of small plus signs
 * whose rotation gradually warps around a focal point — gives the
 * sense of a magnetic field passing through the grid.
 *
 * Pure SVG, no client JS. Drop behind any content as a background
 * texture; control density, focal point, and warp strength via
 * props.
 */

type Props = {
  /** Columns × rows in the grid. */
  cols?: number;
  rows?: number;
  /** Focal point (0–1) — where the warp origin sits. */
  focusX?: number;
  focusY?: number;
  /** Stroke colour. Defaults to soft white. */
  color?: string;
  /** Cross size in viewBox units. */
  crossSize?: number;
  /** Stroke thickness in viewBox units. */
  strokeWidth?: number;
  /** Maximum rotation in degrees applied at the focal point. */
  maxRotate?: number;
  className?: string;
};

export function CrossGridTexture({
  cols = 18,
  rows = 24,
  focusX = 0.55,
  focusY = 0.7,
  color = "rgba(255,255,255,0.32)",
  crossSize = 5,
  strokeWidth = 0.9,
  maxRotate = 80,
  className = "",
}: Props) {
  const W = 100;
  const H = 100 * (rows / cols);
  const fx = W * focusX;
  const fy = H * focusY;
  const maxDist = Math.hypot(W, H);

  const crosses: { x: number; y: number; rot: number; scale: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ((c + 0.5) * W) / cols;
      const y = ((r + 0.5) * H) / rows;
      const dx = x - fx;
      const dy = y - fy;
      const dist = Math.hypot(dx, dy);
      // Rotation: peaks at the focal point, falls off with distance.
      const tangentAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const falloff = Math.max(0, 1 - dist / (maxDist * 0.55));
      const rot = tangentAngle * falloff * (maxRotate / 90);
      // Scale: shrinks slightly near the focus for added pull.
      const scale = 1 - Math.max(0, 0.35 - dist / maxDist) * 0.6;
      crosses.push({ x, y, rot, scale });
    }
  }

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      {crosses.map((c, i) => (
        <g
          key={i}
          transform={`translate(${c.x.toFixed(2)} ${c.y.toFixed(2)}) rotate(${c.rot.toFixed(1)}) scale(${c.scale.toFixed(3)})`}
        >
          <line
            x1="0"
            y1={-crossSize / 2}
            x2="0"
            y2={crossSize / 2}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <line
            x1={-crossSize / 2}
            y1="0"
            x2={crossSize / 2}
            y2="0"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}
