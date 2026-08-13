"use client";

import { useRef, useState } from "react";
import type { BlockLayout, PortfolioBlock, LibraryImage } from "@/lib/db-portfolio";
import { rowAspect, slotAspect, slotCount } from "@/lib/block-layouts";
import { LibraryPicker } from "./_library-picker";
import { LayoutPreview } from "./_layout-preview";

/* ── Project-page block editor ─────────────────────────────────────────
   The project page body is an ordered stream, so paragraphs can be
   dropped between image rows anywhere. Each row picks one of the three
   image layouts; each text block is a heading + body. */

const fieldInput =
  "w-full px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] transition-colors";

/* A dropdown rather than a row of ten pills: the layouts are a single
   choice from a closed set, and laid out as buttons they read as ten
   competing actions. */
const selectInput =
  "px-3 py-1.5 border border-[color:var(--rule)] bg-transparent rounded-sm font-mono text-[11px] focus:outline-none focus:border-[color:var(--ink)]";

const LAYOUTS: { value: BlockLayout; label: string; slots: number }[] = [
  { value: "single", label: "Single landscape", slots: 1 },
  { value: "portrait_landscape", label: "Portrait + landscape", slots: 2 },
  { value: "landscape_portrait", label: "Landscape + portrait", slots: 2 },
  { value: "split", label: "Landscape 50/50", slots: 2 },
  { value: "portrait_trio", label: "Three portraits", slots: 3 },
  { value: "trio", label: "Three across (original ratio)", slots: 3 },
  { value: "portrait_portrait", label: "Two portraits", slots: 2 },
  { value: "compare", label: "Before / after", slots: 2 },
  { value: "stack", label: "Layered stack", slots: 1 },
  { value: "native", label: "Original size / GIF", slots: 1 },
];

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
  accent,
}: {
  projectId: number;
  projectSlug: string;
  initialBlocks: PortfolioBlock[];
  /** Everything already uploaded, so an existing asset can be reused
   *  rather than uploaded again. */
  library: LibraryImage[];
  /** Only for the preview, so its headings match the real page. */
  accent: string;
}) {
  /** Which slot the library picker is currently filling. */
  const [picking, setPicking] = useState<{ blockId: number; slot: number } | null>(null);
  /** What the add control at the foot of the list will create next. */
  const [pending, setPending] = useState<string>("single");
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
          zoom: 1,
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
  function setCropLocal(blockId: number, position: number, mediaId: number, fx: number, fy: number, z?: number) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.kind !== "images") return b;
        const slots = b.slots.map((f) => [...(f ?? [])]);
        slots[position] = (slots[position] ?? []).map((m) =>
          m.id === mediaId ? { ...m, focalX: fx, focalY: fy, zoom: z ?? m.zoom } : m,
        );
        return { ...b, slots };
      }),
    );
  }

  async function saveCrop(mediaId: number, fx: number, fy: number, z: number) {
    const res = await fetch("/api/admin/work/blocks/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: mediaId, focalX: fx, focalY: fy, zoom: z, projectSlug }),
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
        <LibraryPicker
          library={library}
          busy={busy}
          onPick={pickFromLibrary}
          onClose={() => setPicking(null)}
        />
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-mono uppercase tracking-[0.14em] text-[11px]">Page blocks</h2>
        <p className="font-mono text-[10px] text-[color:var(--meta)]">
          Sections render top to bottom
        </p>
      </div>

      {error && <p className="font-mono text-red-700 bg-red-50 px-3 py-2 rounded">{error}</p>}

      {blocks.length === 0 && (
        <p className="font-mono text-[color:var(--meta)] text-[11px]">
          No sections yet — add one below.
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
                <label className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--meta)]">
                    Layout
                  </span>
                  <select
                    value={block.layout}
                    onChange={(e) => {
                      const next = e.target.value as BlockLayout;
                      setBlocks((prev) =>
                        prev.map((b) => (b.id === block.id && b.kind === "images" ? { ...b, layout: next } : b)),
                      );
                      patch(block.id, { layout: next, heading: null, body: null });
                    }}
                    className={selectInput}
                  >
                    {LAYOUTS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: `repeat(${slotCount(block.layout)}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: slotCount(block.layout) }, (_, slot) => {
                    const frames = block.slots[slot] ?? [];
                    /* The exact frame this slot crops to, so the preview
                       below is the real thing rather than a stand-in. */
                    const aspect =
                      rowAspect(block.layout, block.slots[0]?.[0]) ??
                      slotAspect(block.layout, slot);
                    return (
                      <div key={slot} className="space-y-2">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--meta)]">
                          Image {slot + 1}
                          {frames.length > 1 && ` · ${frames.length} frames, loops`}
                        </p>

                        {frames.length === 0 && (
                          <div
                            className="border border-dashed border-[color:var(--rule)] rounded-sm grid place-items-center"
                            style={{ aspectRatio: aspect ?? "4 / 3" }}
                          >
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
                            aspect={aspect}
                            onMove={(fx, fy, z) => setCropLocal(block.id, slot, m.id, fx, fy, z)}
                            onCommit={(fx, fy, z) => saveCrop(m.id, fx, fy, z)}
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

      {/* The add control sits after the sections, not above them: new
          sections append to the end, so this is where you already are
          when you want one. */}
      <div className="flex items-center gap-2 flex-wrap pt-2">
        <select
          value={pending}
          onChange={(e) => setPending(e.target.value)}
          className={selectInput}
          aria-label="Section type to add"
        >
          <option value="text">Text paragraph</option>
          <optgroup label="Image row">
            {LAYOUTS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </optgroup>
        </select>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            pending === "text"
              ? addBlock("text")
              : addBlock("images", pending as BlockLayout)
          }
          className="font-mono uppercase tracking-[0.14em] text-[10px] px-4 py-2 rounded-full disabled:opacity-50"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          + Add section
        </button>
      </div>

      {/* Driven by this component's own state, so it is never stale */}
      <LayoutPreview blocks={blocks} accent={accent} />
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
  aspect,
  onMove,
  onCommit,
  onRemove,
}: {
  media: { id: number; url: string; focalX: number; focalY: number; zoom: number; width?: number | null; height?: number | null };
  index: number;
  total: number;
  /** The frame this slot is cropped to, or null when it is not cropped
   *  (a native row shows the whole image, so there is nothing to set). */
  aspect: string | null;
  onMove: (fx: number, fy: number, zoom: number) => void;
  onCommit: (fx: number, fy: number, zoom: number) => void;
  onRemove: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const native = aspect === null;

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
        className={`border border-[color:var(--rule)] rounded-sm overflow-hidden relative select-none ${
          native ? "" : "cursor-crosshair"
        }`}
        style={aspect ? { aspectRatio: aspect } : undefined}
        onPointerDown={native ? undefined : (e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          setDragging(true);
          const p = pointTo(e.clientX, e.clientY);
          if (p) onMove(p.fx, p.fy, media.zoom);
        }}
        onPointerMove={native ? undefined : (e) => {
          if (!dragging) return;
          const p = pointTo(e.clientX, e.clientY);
          if (p) onMove(p.fx, p.fy, media.zoom);
        }}
        onPointerUp={native ? undefined : () => {
          setDragging(false);
          onCommit(media.focalX, media.focalY, media.zoom);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.url}
          alt=""
          draggable={false}
          className={native ? "w-full h-auto block pointer-events-none" : "w-full h-full object-cover pointer-events-none"}
          style={
            native
              ? undefined
              : {
                  objectPosition: `${media.focalX * 100}% ${media.focalY * 100}%`,
                  transform: media.zoom > 1 ? `scale(${media.zoom})` : undefined,
                  transformOrigin: `${media.focalX * 100}% ${media.focalY * 100}%`,
                }
          }
        />
        {!native && (
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
        )}
      </div>
      {!native && (
        <label className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--meta)]">
            Zoom {media.zoom.toFixed(1)}x
          </span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.1}
            value={media.zoom}
            onChange={(e) => onMove(media.focalX, media.focalY, Number(e.target.value))}
            onPointerUp={() => onCommit(media.focalX, media.focalY, media.zoom)}
            onKeyUp={() => onCommit(media.focalX, media.focalY, media.zoom)}
            className="flex-1"
          />
        </label>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] text-[color:var(--meta)] uppercase tracking-[0.14em]">
          {/* The uploaded file's own pixel dimensions, so it is obvious
              what is actually being served. */}
          {media.width && media.height ? `${media.width} × ${media.height}` : "size unknown"}
          {total > 1 ? ` · frame ${index + 1}` : ""}
          {aspect ? ` · crops to ${aspect.replace(/\s/g, "")}` : " · uncropped"}
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
