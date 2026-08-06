"use client";

import { useState } from "react";
import type { BlockLayout, PortfolioBlock } from "@/lib/db-portfolio";

/* ── Project-page block editor ─────────────────────────────────────────
   The project page body is an ordered stream, so paragraphs can be
   dropped between image rows anywhere. Each row picks one of the three
   image layouts; each text block is a heading + body. */

const fieldInput =
  "w-full px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] transition-colors";

const LAYOUTS: { value: BlockLayout; label: string; slots: number }[] = [
  { value: "single", label: "Single landscape", slots: 1 },
  { value: "portrait_landscape", label: "Portrait + landscape", slots: 2 },
  { value: "split", label: "Landscape 50/50", slots: 2 },
];

const SLOTS: Record<BlockLayout, number> = { single: 1, portrait_landscape: 2, split: 2 };

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
}: {
  projectId: number;
  projectSlug: string;
  initialBlocks: PortfolioBlock[];
}) {
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
          : { kind: "images", id: json.id!, projectId, orderIndex: prev.length, layout: layout ?? "single", media: [] },
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

  async function setSlotImage(blockId: number, position: number, file: File, existingMediaId?: number) {
    setBusy(true);
    setError(null);
    try {
      const [url, dims] = await Promise.all([uploadToBlob(file), readImageDims(file)]);
      if (existingMediaId) {
        await fetch(`/api/admin/work/blocks/media?id=${existingMediaId}&projectSlug=${projectSlug}`, { method: "DELETE" });
      }
      const res = await fetch("/api/admin/work/blocks/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, projectSlug, blockId, position, url, width: dims.width, height: dims.height }),
      });
      const json = (await res.json()) as { id?: number; error?: string };
      if (!res.ok || !json.id) throw new Error(json.error ?? "Could not attach image");
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId || b.kind !== "images") return b;
          const media = b.media.filter((m) => m.id !== existingMediaId);
          media[position] = {
            id: json.id!,
            projectId,
            surface: "project_page",
            slotId: null,
            type: "image",
            url,
            width: dims.width,
            height: dims.height,
            aspectRatio: `${dims.width}:${dims.height}`,
            orderIndex: position,
            gridColStart: null,
            gridColSpan: 1,
            gridRowStart: null,
            gridRowSpan: 1,
          };
          return { ...b, media };
        }),
      );
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 pt-8 border-t border-[color:var(--rule)]">
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

                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: SLOTS[block.layout] }, (_, slot) => {
                    const m = block.media[slot];
                    return (
                      <label
                        key={slot}
                        className="block border border-dashed border-[color:var(--rule)] rounded-sm aspect-[4/3] overflow-hidden cursor-pointer relative"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setSlotImage(block.id, slot, f, m?.id);
                            e.target.value = "";
                          }}
                        />
                        {m ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="absolute inset-0 grid place-items-center font-mono text-[10px] text-[color:var(--meta)] uppercase tracking-[0.14em]">
                            {busy ? "Uploading…" : `Image ${slot + 1}`}
                          </span>
                        )}
                      </label>
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
