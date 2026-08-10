"use client";

import type { LibraryImage } from "@/lib/db-portfolio";

/** Every image already on the site, offered so an existing asset can be
 *  reused rather than uploaded a second time. Shared by the cover field
 *  and by each block slot. */
export function LibraryPicker({
  library,
  busy = false,
  onPick,
  onClose,
}: {
  library: LibraryImage[];
  busy?: boolean;
  onPick: (m: LibraryImage) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 p-6 overflow-auto"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="max-w-4xl mx-auto rounded-sm p-6 space-y-4"
        style={{ background: "var(--paper)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-mono uppercase tracking-[0.14em] text-[11px]">
            Media library · {library.length}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[color:var(--meta)] text-[11px] hover:text-[color:var(--ink)]"
          >
            Close
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {library.map((m) => (
            <button
              key={m.url}
              type="button"
              disabled={busy}
              onClick={() => onPick(m)}
              className="text-left hover:opacity-70 transition-opacity disabled:opacity-40"
            >
              <span className="block border border-[color:var(--rule)] rounded-sm aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              </span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--meta)] mt-1">
                {m.source}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
