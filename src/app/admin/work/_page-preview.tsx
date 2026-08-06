"use client";

import { useRef, useState } from "react";

/** Live preview of the project page, so the page can be watched as it is
 *  built instead of round-tripping through a second tab.
 *
 *  An iframe of the real route, not a re-implementation — a mock would
 *  drift from the page it claims to show. Reloading is manual because
 *  block edits save immediately: an automatic refresh on every keystroke
 *  would fight the typing. */
export function PagePreview({ slug }: { slug: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);
  const [open, setOpen] = useState(true);

  /* Reload by re-keying the iframe. Reaching into contentWindow would
     throw once the frame has navigated. */
  const reload = () => setNonce((n) => n + 1);

  const scale = width ? Math.min(1, 900 / width) : 1;

  return (
    <section className="space-y-3 pt-8 border-t border-[color:var(--rule)]">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-mono uppercase tracking-[0.14em] text-[11px]">
          Preview · /work/{slug}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {([
            ["Desktop", 1440],
            ["Tablet", 834],
            ["Mobile", 390],
          ] as const).map(([label, w]) => (
            <button
              key={label}
              type="button"
              onClick={() => setWidth(w)}
              aria-pressed={width === w}
              className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border transition-colors"
              style={{
                background: width === w ? "var(--ink)" : "transparent",
                color: width === w ? "var(--paper)" : "var(--ink-soft)",
                borderColor: width === w ? "var(--ink)" : "var(--rule)",
              }}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={reload}
            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)]"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)]"
          >
            {open ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <p className="font-mono text-[color:var(--meta)] text-[10px]">
        Blocks save as you go — hit Refresh to see them. Fields above need
        Save first.
      </p>

      {open && (
        <div
          className="border border-[color:var(--rule)] rounded-sm overflow-hidden"
          style={{ height: 620 }}
        >
          <iframe
            ref={frameRef}
            key={nonce}
            src={`/work/${slug}`}
            title={`Preview of /work/${slug}`}
            style={
              width
                ? {
                    width,
                    height: 620 / scale,
                    border: 0,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }
                : { width: "100%", height: 620, border: 0 }
            }
          />
        </div>
      )}
    </section>
  );
}
