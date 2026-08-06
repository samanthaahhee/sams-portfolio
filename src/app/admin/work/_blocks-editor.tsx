"use client";

import { useRef, useState } from "react";
import type { BlockLayout, PortfolioBlock, LibraryImage } from "@/lib/db-portfolio";

/* ── Project-page block editor ─────────────────────────────────────────
   The project page body is an ordered stream, so paragraphs can be
   dropped between image rows anywhere. Each row picks one of the three
   image layouts; each text block is a heading + body. */

const fieldInput =
  "w-full px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] transition-colors";

const LAYOUTS: { value: BlockLayout; label: string; slots: number }[] = [
  { value: "single", label: "Single landscape", slots: 1 },
  { value: "portrait_landscape", label: "Portrait + landscape", slots: 2 },
  { value: "landscape_portrait", label: "Landscape + portrait", slots: 2 },
  { value: "split", label: "Landscape 50/50", slots: 2 },
  { value: "portrait_trio", label: "Three portraits", slots: 3 },
];

const SLOTS: Record<BlockLayout, number> = {
  single: 1,
  portrait_landscape: 2,
  landscape_portrait: 2,
  split: 2,
  portrait_trio: 3,
};

function readImageDims(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions"));
    };
    img.src = url;
  });
}

async function uploadToBlob(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
  return json.url;
}

export function BlocksEditor({
  projectId,
  projectSlug,
  initialBlocks,
  library,
}: {
  projectId: number;
  projectSlug: string;
  initialBlocks: PortfolioBlock[];
  /** Everything already uploaded, so an existing asset can be reused
   *  rather than uploaded again. */
  library: LibraryImage[];
}) {
  /** Which slot the library picker is currently filling. */
  const [picking, setPicking] = useState<{ blockId: number; slot: number } | null>(null);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function fail(e: unknown) {
    setError(e instanceof Error ? e.message : "Something went wrong");
  }

  async function addBlock(kind: "images" | "text", layout?: BlockLayout) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/work/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, projectSlug, kind, layout }),
      });
      const json = (await res.json()) as { id?: number; error?: string };
      if (!res.ok || !json.id) throw new Error(json.error ?? "Could not add block");
      setBlocks((prev) => [
        ...prev,
        kind === "text"
          ? { kind: "text", id: json.id!, projectId, orderIndex: prev.length, heading: null, body: null }
          : { kind: "images", id: json.id!, projectId, orderIndex: prev.length, layout: layout ?? "single", slots: [] },
      ]);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  /** Local edit only — persisted on blur, so typing isn't one request per
   *  keystroke. */
  function setCopy(id: number, patch: { heading?: string | null; body?: string | null }) {
    setBlocks((prev) => prev.map((b) => (b.id === id && b.kind === "text" ? { ...b, ...patch } : b)));
  }

  async function patch(id: number, patchBody: { layout?: BlockLayout; heading?: string | null; body?: string | null }) {
    const res = await fetch("/api/admin/work/blocks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, projectSlug, ...patchBody }),
    });
    if (!res.ok) setError("Save failed");
  }

  async function removeBlock(id: number) {
    if (!confirm("Delete this block and its images?")) return;
    const res = await fetch(`/api/admin/work/blocks?id=${id}&projectSlug=${projectSlug}`, { method: "DELETE" });
    if (!res.ok) return setError("Delete failed");
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...blocks];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
    const res = await fetch("/api/admin/work/blocks/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, projectSlug, ids: next.map((b) => b.id) }),
    });
    if (!res.ok) setError("Reorder failed");
  }

  async function setSlotImage(blockId: number, position: number, file: File) {
    setBusy(true);
    setError(null);
    try {
      const [url, dims] = await Promise.all([uploadToBlob(file), readImageDims(file)]);
      await attach(blockId, position, url, dims.width, dims.height);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  /** Append a frame to a slot's sequence — the same call the upload path
   *  finishes with, minus the upload. One frame is a still; more than one
   *  loops on the page. */
  async function attach(
    blockId: number,
    position: number,
    url: string,
    width: number | null,
    height: number | null,
  ) {
    const res = await fetch("/api/admin/work/blocks/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, projectSlug, blockId, position, url, width, height }),
    });
    const json = (await res.json()) as { id?: number; frameIndex?: number; error?: string };
    if (!res.ok || !json.id) throw new Error(json.error ?? "Could not attach image");
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.kind !== "images") return b;
        const slots = b.slots.map((f) => [...(f ?? [])]);
        (slots[position] ??= []).push({
          id: json.id!,
          projectId,
          surface: "project_page",
          slotId: null,
          type: "image",
          url,
          width,
          height,
          aspectRatio: width && height ? `${width}:${height}` : null,
          orderIndex: position,
          gridColStart: null,
          gridColSpan: 1,
          gridRowStart: null,
          gridRowSpan: 1,
          frameIndex: json.frameIndex ?? 0,
          focalX: 0.5,
          focalY: 0.5,
        });
        return { ...b, slots };
      }),
    );
  }

  async function removeFrame(blockId: number, position: number, mediaId: number) {
    setBusy(true);
    try {
      await fetch(`/api/admin/work/blocks/media?id=${mediaId}&projectSlug=${projectSlug}`, { method: "DELETE" });
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId || b.kind !== "images") return b;
          const slots = b.slots.map((f) => [...(f ?? [])]);
          slots[position] = (slots[position] ?? []).filter((m) => m.id !== mediaId);
          return { ...b, slots };
        }),
      );
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  /** Crop is a focal point: which part of the image survives the cover
   *  crop. Saved on release, not on every pointer move. */
  function setCropLocal(blockId: number, position: number, mediaId: number, fx: number, fy: number) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.kind !== "images") return b;
        const slots = b.slots.map((f) => [...(f ?? [])]);
        slots[position] = (slots[position] ?? []).map((m) =>
          m.id === mediaId ? { ...m, focalX: fx, focalY: fy } : m,
        );
        return { ...b, slots };
      }),
    );
  }

  async function saveCrop(mediaId: number, fx: number, fy: number) {
    const res = await fetch("/api/admin/work/blocks/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: mediaId, focalX: fx, focalY: fy, projectSlug }),
    });
    if (!res.ok) setError("Could not save crop");
  }

  async function pickFromLibrary(m: LibraryImage) {
    if (!picking) return;
    setBusy(true);
    setError(null);
    try {
      await attach(picking.blockId, picking.slot, m.url, m.width, m.height);
      setPicking(null);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 pt-8 border-t border-[color:var(--rule)]">
      {/* Library picker — every image already uploaded to the site,
          whatever it was originally uploaded for. */}
      {picking && (
        <div
          className="fixed inset-0 z-50 p-6 overflow-auto"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setPicking(null)}
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
                onClick={() => setPicking(null)}
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
                  onClick={() => pickFromLibrary(m)}
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
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-mono uppercase tracking-[0.14em] text-[11px]">Page blocks</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {LAYOUTS.map((l) => (
            <button
              key={l.value}
              type="button"
              disabled={busy}
              onClick={() => addBlock("images", l.value)}
              className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] disabled:opacity-50"
            >
              + {l.label}
            </button>
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={() => addBlock("text")}
            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full disabled:opacity-50"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            + Text
          </button>
        </div>
      </div>

      {error && <p className="font-mono text-red-700 bg-red-50 px-3 py-2 rounded">{error}</p>}

      {blocks.length === 0 && (
        <p className="font-mono text-[color:var(--meta)] text-[11px]">
          No blocks yet. Add image rows and paragraphs — they render top to bottom in this order.
        </p>
      )}

      <ol className="space-y-4">
        {blocks.map((block, i) => (
          <li key={block.id} className="border border-[color:var(--rule)] rounded-sm p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[color:var(--meta)] text-[11px] uppercase tracking-[0.14em]">
                {i + 1}. {block.kind === "text" ? "Text" : LAYOUTS.find((l) => l.value === block.layout)?.label}
              </span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="font-mono text-[11px] disabled:opacity-30">
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === blocks.length - 1}
                  className="font-mono text-[11px] disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="font-mono text-[11px] text-[color:var(--meta)] hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>

            {block.kind === "text" ? (
              <div className="space-y-2">
                <input
                  value={block.heading ?? ""}
                  placeholder="Header (optional)"
                  onChange={(e) => setCopy(block.id, { heading: e.target.value || null })}
                  onBlur={() => patch(block.id, { heading: block.heading, body: block.body })}
                  className={fieldInput}
                />
                <textarea
                  value={block.body ?? ""}
                  placeholder="Paragraph — leave a blank line between paragraphs"
                  rows={5}
                  onChange={(e) => setCopy(block.id, { body: e.target.value || null })}
                  onBlur={() => patch(block.id, { heading: block.heading, body: block.body })}
                  className={fieldInput}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {LAYOUTS.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => {
                        setBlocks((prev) =>
                          prev.map((b) => (b.id === block.id && b.kind === "images" ? { ...b, layout: l.value } : b)),
                        );
                        patch(block.id, { layout: l.value, heading: null, body: null });
                      }}
                      aria-pressed={block.layout === l.value}
                      className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border transition-colors"
                      style={{
                        background: block.layout === l.value ? "var(--ink)" : "transparent",
                        color: block.layout === l.value ? "var(--paper)" : "var(--ink-soft)",
                        borderColor: block.layout === l.value ? "var(--ink)" : "var(--rule)",
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: `repeat(${SLOTS[block.layout]}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: SLOTS[block.layout] }, (_, slot) => {
                    const frames = block.slots[slot] ?? [];
                    return (
                      <div key={slot} className="space-y-2">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--meta)]">
                          Image {slot + 1}
                          {frames.length > 1 && ` · ${frames.length} frames, loops`}
                        </p>

                        {frames.length === 0 && (
                          <div className="border border-dashed border-[color:var(--rule)] rounded-sm aspect-[4/3] grid place-items-center">
                            <span className="font-mono text-[10px] text-[color:var(--meta)] uppercase tracking-[0.14em]">
                              {busy ? "Working…" : "Empty"}
                            </span>
                          </div>
                        )}

                        {frames.map((m, fi) => (
                          <CropBox
                            key={m.id}
                            media={m}
                            index={fi}
                            total={frames.length}
                            onMove={(fx, fy) => setCropLocal(block.id, slot, m.id, fx, fy)}
                            onCommit={(fx, fy) => saveCrop(m.id, fx, fy)}
                            onRemove={() => removeFrame(block.id, slot, m.id)}
                          />
                        ))}

                        <div className="flex items-center gap-2">
                          {/* Choose first: reusing an existing asset should be
                              at least as easy as uploading a second copy. */}
                          <button
                            type="button"
                            disabled={busy || library.length === 0}
                            onClick={() => setPicking({ blockId: block.id, slot })}
                            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] disabled:opacity-40"
                          >
                            {frames.length ? "+ Choose" : "Choose"}
                          </button>
                          <label className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] cursor-pointer">
                            {frames.length ? "+ Upload" : "Upload"}
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setSlotImage(block.id, slot, f);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </div>
                        {frames.length === 1 && (
                          <p className="font-mono text-[9px] text-[color:var(--meta)]">
                            Add another image to make this slot loop.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** One frame, with its crop. The box is the slot's aspect and shows the
 *  image cover-cropped exactly as the page will, so dragging the marker
 *  is a direct preview rather than an abstract pair of numbers. */
function CropBox({
  media,
  index,
  total,
  onMove,
  onCommit,
  onRemove,
}: {
  media: { id: number; url: string; focalX: number; focalY: number };
  index: number;
  total: number;
  onMove: (fx: number, fy: number) => void;
  onCommit: (fx: number, fy: number) => void;
  onRemove: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const pointTo = (clientX: number, clientY: number) => {
    const el = boxRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      fx: Math.max(0, Math.min(1, (clientX - r.left) / r.width)),
      fy: Math.max(0, Math.min(1, (clientY - r.top) / r.height)),
    };
  };

  return (
    <div className="space-y-1">
      <div
        ref={boxRef}
        className="border border-[color:var(--rule)] rounded-sm aspect-[4/3] overflow-hidden relative cursor-crosshair select-none"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          setDragging(true);
          const p = pointTo(e.clientX, e.clientY);
          if (p) onMove(p.fx, p.fy);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          const p = pointTo(e.clientX, e.clientY);
          if (p) onMove(p.fx, p.fy);
        }}
        onPointerUp={() => {
          setDragging(false);
          onCommit(media.focalX, media.focalY);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.url}
          alt=""
          draggable={false}
          className="w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: `${media.focalX * 100}% ${media.focalY * 100}%` }}
        />
        <span
          aria-hidden
          className="absolute w-5 h-5 rounded-full border-2 border-white pointer-events-none"
          style={{
            left: `${media.focalX * 100}%`,
            top: `${media.focalY * 100}%`,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.45)",
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] text-[color:var(--meta)] uppercase tracking-[0.14em]">
          {total > 1 ? `Frame ${index + 1}` : "Drag to set crop"}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--meta)] hover:text-red-700"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
