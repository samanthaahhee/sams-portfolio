"use client";

import { useMemo, useRef, useState } from "react";
import type { PortfolioMedia } from "@/lib/db-portfolio";

type Placement = { colStart: number; colSpan: number; rowStart: number; rowSpan: number };

function parseTemplate(json: string | null): { columns: number; rows: number } {
  if (json) {
    try {
      const t = JSON.parse(json) as { columns?: number; rows?: number };
      if (t.columns && t.rows) return { columns: t.columns, rows: t.rows };
    } catch {}
  }
  return { columns: 4, rows: 3 };
}

/** Freeform bento grid builder — drag images onto a columns×rows canvas,
 *  drag to move, drag the corner handle to resize (col/row span). No
 *  external DnD library; hand-rolled with pointer events + grid snapping. */
export function GridBuilder({
  projectId,
  projectSlug,
  media,
  initialTemplate,
}: {
  projectId: number;
  projectSlug: string;
  media: PortfolioMedia[];
  initialTemplate: string | null;
}) {
  const initial = parseTemplate(initialTemplate);
  const [columns, setColumns] = useState(initial.columns);
  const [rows, setRows] = useState(initial.rows);
  const [placements, setPlacements] = useState<Record<number, Placement | null>>(() =>
    Object.fromEntries(
      media.map((m) => [
        m.id,
        m.gridColStart != null && m.gridRowStart != null
          ? { colStart: m.gridColStart, colSpan: m.gridColSpan, rowStart: m.gridRowStart, rowSpan: m.gridRowSpan }
          : null,
      ]),
    ),
  );
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const CANVAS_W = 640;
  const unit = CANVAS_W / columns;
  const canvasH = unit * rows;

  const placed = media.filter((m) => placements[m.id]);
  const unplaced = media.filter((m) => !placements[m.id]);

  const occupied = useMemo(() => {
    // grid[row][col] = mediaId | null, 1-indexed inputs, 0-indexed storage
    const grid: (number | null)[][] = Array.from({ length: rows }, () => Array(columns).fill(null));
    for (const m of media) {
      const p = placements[m.id];
      if (!p) continue;
      for (let r = p.rowStart - 1; r < p.rowStart - 1 + p.rowSpan && r < rows; r++) {
        for (let c = p.colStart - 1; c < p.colStart - 1 + p.colSpan && c < columns; c++) {
          if (r >= 0 && c >= 0) grid[r][c] = m.id;
        }
      }
    }
    return grid;
  }, [placements, media, columns, rows]);

  function firstOpenCell(): { col: number; row: number } | null {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        if (occupied[r][c] == null) return { col: c + 1, row: r + 1 };
      }
    }
    return null;
  }

  function clamp(v: number, min: number, max: number) {
    return Math.min(Math.max(v, min), max);
  }

  function dropOnCanvas(mediaId: number) {
    const cell = firstOpenCell();
    setPlacements((prev) => ({
      ...prev,
      [mediaId]: cell ? { colStart: cell.col, colSpan: 1, rowStart: cell.row, rowSpan: 1 } : { colStart: 1, colSpan: 1, rowStart: 1, rowSpan: 1 },
    }));
  }

  function unplace(mediaId: number) {
    setPlacements((prev) => ({ ...prev, [mediaId]: null }));
  }

  function startMove(e: React.PointerEvent, mediaId: number) {
    e.preventDefault();
    const start = placements[mediaId];
    if (!start) return;
    const startX = e.clientX;
    const startY = e.clientY;

    function onMove(ev: PointerEvent) {
      const dCol = Math.round((ev.clientX - startX) / unit);
      const dRow = Math.round((ev.clientY - startY) / unit);
      setPlacements((prev) => ({
        ...prev,
        [mediaId]: {
          ...start!,
          colStart: clamp(start!.colStart + dCol, 1, columns - start!.colSpan + 1),
          rowStart: clamp(start!.rowStart + dRow, 1, rows - start!.rowSpan + 1),
        },
      }));
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function startResize(e: React.PointerEvent, mediaId: number) {
    e.preventDefault();
    e.stopPropagation();
    const start = placements[mediaId];
    if (!start) return;
    const startX = e.clientX;
    const startY = e.clientY;

    function onMove(ev: PointerEvent) {
      const dCol = Math.round((ev.clientX - startX) / unit);
      const dRow = Math.round((ev.clientY - startY) / unit);
      setPlacements((prev) => ({
        ...prev,
        [mediaId]: {
          ...start!,
          colSpan: clamp(start!.colSpan + dCol, 1, columns - start!.colStart + 1),
          rowSpan: clamp(start!.rowSpan + dRow, 1, rows - start!.rowStart + 1),
        },
      }));
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  async function save() {
    setSaving(true);
    // Auto-place anything still sitting unplaced so nothing is silently hidden.
    const finalPlacements = { ...placements };
    for (const m of unplaced) {
      const cell = firstOpenCell();
      finalPlacements[m.id] = cell ? { colStart: cell.col, colSpan: 1, rowStart: cell.row, rowSpan: 1 } : { colStart: 1, colSpan: 1, rowStart: 1, rowSpan: 1 };
      // Reserve the cell for the next lookup within this loop.
      if (cell) occupied[cell.row - 1][cell.col - 1] = m.id;
    }
    setPlacements(finalPlacements);

    await fetch("/api/admin/work/media/grid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        projectSlug,
        columns,
        rows,
        placements: media.map((m) => {
          const p = finalPlacements[m.id];
          return {
            id: m.id,
            gridColStart: p?.colStart ?? null,
            gridColSpan: p?.colSpan ?? 1,
            gridRowStart: p?.rowStart ?? null,
            gridRowSpan: p?.rowSpan ?? 1,
          };
        }),
      }),
    });
    setSaving(false);
    setSavedAt(new Date());
  }

  async function clearCustomLayout() {
    if (!confirm("Revert to the automatic trio + banner layout? Your custom placement is discarded.")) return;
    setSaving(true);
    await fetch("/api/admin/work/media/grid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        projectSlug,
        columns,
        rows,
        placements: media.map((m) => ({ id: m.id, gridColStart: null, gridColSpan: 1, gridRowStart: null, gridRowSpan: 1 })),
      }),
    });
    // Explicitly null the template too (grid endpoint always sets it — send
    // a follow-up with columns/rows kept, but the public renderer only
    // activates once at least one item has a placement, so nulling every
    // placement above already achieves the revert).
    setPlacements(Object.fromEntries(media.map((m) => [m.id, null])));
    setSaving(false);
    setSavedAt(new Date());
  }

  return (
    <div className="space-y-4 pt-6 border-t border-[color:var(--rule)]">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <p className="font-mono text-[color:var(--meta)] mb-1">Custom bento layout</p>
          <p className="font-mono text-[color:var(--meta)] text-[10px] max-w-md">
            Drag images from the tray onto the grid, drag to move, drag the ⌟ handle to resize.
            Leave everything in the tray to keep the automatic trio + banner layout.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-mono text-[10px] text-[color:var(--meta)]">
            Columns
            <button type="button" onClick={() => setColumns((c) => clamp(c - 1, 1, 8))} className="w-6 h-6 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)]">
              −
            </button>
            <span className="w-4 text-center">{columns}</span>
            <button type="button" onClick={() => setColumns((c) => clamp(c + 1, 1, 8))} className="w-6 h-6 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)]">
              +
            </button>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-[color:var(--meta)]">
            Rows
            <button type="button" onClick={() => setRows((r) => clamp(r - 1, 1, 8))} className="w-6 h-6 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)]">
              −
            </button>
            <span className="w-4 text-center">{rows}</span>
            <button type="button" onClick={() => setRows((r) => clamp(r + 1, 1, 8))} className="w-6 h-6 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)]">
              +
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative rounded-sm"
        style={{
          width: CANVAS_W,
          height: canvasH,
          background: "var(--paper-soft)",
          backgroundImage:
            "linear-gradient(to right, var(--rule) 1px, transparent 1px), linear-gradient(to bottom, var(--rule) 1px, transparent 1px)",
          backgroundSize: `${unit}px ${unit}px`,
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const id = Number(e.dataTransfer.getData("text/plain"));
          if (id) dropOnCanvas(id);
        }}
      >
        {placed.map((m) => {
          const p = placements[m.id]!;
          return (
            <div
              key={m.id}
              onPointerDown={(e) => startMove(e, m.id)}
              className="absolute rounded-sm overflow-hidden border-2 border-white shadow-sm cursor-grab active:cursor-grabbing group"
              style={{
                left: (p.colStart - 1) * unit,
                top: (p.rowStart - 1) * unit,
                width: p.colSpan * unit,
                height: p.rowSpan * unit,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  unplace(m.id);
                }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove from canvas"
              >
                ×
              </button>
              <div
                onPointerDown={(e) => startResize(e, m.id)}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "linear-gradient(135deg, transparent 50%, var(--ink) 50%)" }}
                aria-label="Resize"
              />
            </div>
          );
        })}
      </div>

      {/* Unplaced tray */}
      {unplaced.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[color:var(--meta)] text-[10px]">Unplaced — drag onto the grid above</p>
          <div className="flex flex-wrap gap-2">
            {unplaced.map((m) => (
              <div
                key={m.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", String(m.id))}
                onClick={() => dropOnCanvas(m.id)}
                className="relative rounded-sm overflow-hidden cursor-grab active:cursor-grabbing border border-[color:var(--rule)]"
                style={{ width: 72, height: 45 }}
                title="Drag onto the grid, or click to auto-place"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px] disabled:opacity-50"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          {saving ? "Saving…" : "Save layout"}
        </button>
        {placed.length > 0 && (
          <button type="button" onClick={clearCustomLayout} disabled={saving} className="font-mono text-[color:var(--meta)] hover:text-red-700">
            Revert to automatic layout
          </button>
        )}
        {savedAt && (
          <span className="font-mono text-[color:var(--meta)] text-[11px]">
            ✓ Saved at {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}
