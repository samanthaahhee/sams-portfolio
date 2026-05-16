"use client";

import { useState } from "react";
import { ImageUploadBox } from "./image-uploads";

export type VisualItem =
  | { kind: "image"; url: string; caption?: string }
  | { kind: "compare"; before: string; after: string; caption?: string }
  | { kind: "grid"; images: string[]; caption?: string }
  | { kind: "stack"; images: string[]; caption?: string }
  | {
      kind: "media";
      images: string[];
      layout: "vertical" | "horizontal";
      caption?: string;
    };

/* XHR upload helper (shared shape as image-uploads — keeps captions
 * sticky and per-row progress visible). */
function uploadToBlob(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file);
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress((e.loaded / e.total) * 100);
      }
    });
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText) as {
            url?: string;
            error?: string;
          };
          if (json.url) resolve(json.url);
          else reject(new Error(json.error ?? "No URL in response"));
        } catch {
          reject(new Error("Invalid response"));
        }
      } else {
        let msg = `Upload failed (HTTP ${xhr.status})`;
        try {
          const json = JSON.parse(xhr.responseText) as { error?: string };
          if (json.error) msg = json.error;
        } catch {}
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(fd);
  });
}

/**
 * Unified visuals editor. Each row is either an `image` or a `compare`
 * (before/after) item. All rows share the same reorder + remove
 * controls so visitors and admins see one continuous, ordered "Visuals"
 * stream on the page.
 */
export function VisualsEditor({
  visuals,
  onChange,
}: {
  visuals: VisualItem[];
  onChange: (v: VisualItem[]) => void;
}) {
  const [uploadingIdx, setUploadingIdx] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const update = (i: number, patch: Partial<VisualItem>) =>
    onChange(
      visuals.map((v, j) =>
        j === i ? ({ ...v, ...patch } as VisualItem) : v,
      ),
    );

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= visuals.length) return;
    const next = [...visuals];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const remove = (i: number) => onChange(visuals.filter((_, j) => j !== i));

  const addImage = () =>
    onChange([...visuals, { kind: "image", url: "", caption: "" }]);
  const addCompare = () =>
    onChange([
      ...visuals,
      { kind: "compare", before: "", after: "", caption: "" },
    ]);
  const addGrid = () =>
    onChange([
      ...visuals,
      { kind: "grid", images: ["", "", ""], caption: "" },
    ]);
  const addStack = () =>
    onChange([
      ...visuals,
      { kind: "stack", images: ["", ""], caption: "" },
    ]);
  const addMedia = () =>
    onChange([
      ...visuals,
      { kind: "media", images: [""], layout: "vertical", caption: "" },
    ]);

  async function doUpload(rowKey: string, file: File): Promise<string | null> {
    setUploadingIdx(rowKey);
    setProgress(0);
    setError(null);
    try {
      return await uploadToBlob(file, (p) => setProgress(Math.round(p)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
      return null;
    } finally {
      setUploadingIdx(null);
      setProgress(0);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <p className="font-mono text-[color:var(--meta)]">Visuals</p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={addImage}
            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
          >
            + Image
          </button>
          <button
            type="button"
            onClick={addCompare}
            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
          >
            + Before / after
          </button>
          <button
            type="button"
            onClick={addGrid}
            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
          >
            + 3-up grid
          </button>
          <button
            type="button"
            onClick={addStack}
            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
          >
            + Image stack
          </button>
          <button
            type="button"
            onClick={addMedia}
            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
          >
            + GIF / Media
          </button>
        </div>
      </div>

      {visuals.length === 0 && (
        <p className="font-mono text-[color:var(--meta)] text-[11px] py-4">
          No visuals yet. Add an image or a before/after slider.
        </p>
      )}

      <div className="space-y-3">
        {visuals.map((v, i) => (
          <div
            key={`${i}-${v.kind}`}
            className="border border-[color:var(--rule)] rounded-sm p-3 space-y-3"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="font-mono text-[color:var(--meta)] text-[11px]">
                {String(i + 1).padStart(2, "0")} ·{" "}
                {v.kind === "image"
                  ? "Image"
                  : v.kind === "compare"
                    ? "Before / after"
                    : v.kind === "grid"
                      ? "3-up grid"
                      : v.kind === "stack"
                        ? "Image stack"
                        : "GIF / Media"}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="font-mono text-[12px] w-7 h-7 rounded-full border border-[color:var(--rule)] disabled:opacity-30 hover:border-[color:var(--ink)] transition-colors leading-none"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, +1)}
                  disabled={i === visuals.length - 1}
                  aria-label="Move down"
                  className="font-mono text-[12px] w-7 h-7 rounded-full border border-[color:var(--rule)] disabled:opacity-30 hover:border-[color:var(--ink)] transition-colors leading-none"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="font-mono text-[9px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-red-700 hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>

            {v.kind === "image" && (
              <ImageUploadBox
                label=""
                aspect="16 / 10"
                value={v.url}
                onChange={(url) => update(i, { url: url ?? "" })}
                maxWidth={520}
              />
            )}

            {v.kind === "compare" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ImageUploadBox
                  label="Before"
                  aspect="16 / 10"
                  value={v.before}
                  onChange={(url) => update(i, { before: url ?? "" })}
                  maxWidth={400}
                />
                <ImageUploadBox
                  label="After"
                  aspect="16 / 10"
                  value={v.after}
                  onChange={(url) => update(i, { after: url ?? "" })}
                  maxWidth={400}
                />
              </div>
            )}

            {v.kind === "grid" && (
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((slot) => (
                  <ImageUploadBox
                    key={slot}
                    label={`Tile ${slot + 1}`}
                    aspect="1 / 1"
                    value={v.images[slot] ?? ""}
                    onChange={(url) => {
                      const next = [...v.images];
                      next[slot] = url ?? "";
                      update(i, { images: next });
                    }}
                    maxWidth={200}
                  />
                ))}
              </div>
            )}

            {v.kind === "stack" && (
              <StackImagesEditor
                images={v.images}
                onChange={(images) => update(i, { images })}
              />
            )}

            {v.kind === "media" && (
              <MediaImagesEditor
                images={v.images}
                layout={v.layout}
                onChange={(patch) => update(i, patch)}
              />
            )}

            <input
              type="text"
              value={v.caption ?? ""}
              placeholder="Caption (optional)"
              onChange={(e) => update(i, { caption: e.target.value })}
              className="w-full px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] font-mono text-sm"
            />
          </div>
        ))}
      </div>

      {/* Add buttons repeated at the END of the list so you never have
          to scroll back up when populating a long visuals list. */}
      {visuals.length > 0 && (
        <div className="flex items-center gap-2 pt-2 flex-wrap">
          <button
            type="button"
            onClick={addImage}
            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
          >
            + Image
          </button>
          <button
            type="button"
            onClick={addCompare}
            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
          >
            + Before / after
          </button>
          <button
            type="button"
            onClick={addGrid}
            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
          >
            + 3-up grid
          </button>
          <button
            type="button"
            onClick={addStack}
            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
          >
            + Image stack
          </button>
          <button
            type="button"
            onClick={addMedia}
            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
          >
            + GIF / Media
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-700 font-mono bg-red-50 px-2 py-1 rounded">
          {error}
        </p>
      )}
      {uploadingIdx && (
        <p className="font-mono text-[color:var(--meta)] text-[10px]">
          Uploading {progress}%…
        </p>
      )}
    </div>
  );
}

/** Media editor — variable number of natural-aspect images / GIFs.
 *  Layout toggle: stack vertically or arrange horizontally on the page.
 *  Preview boxes use a generic 4:3 placeholder; the published page
 *  renders each image at its intrinsic aspect ratio. */
function MediaImagesEditor({
  images,
  layout,
  onChange,
}: {
  images: string[];
  layout: "vertical" | "horizontal";
  onChange: (patch: {
    images?: string[];
    layout?: "vertical" | "horizontal";
  }) => void;
}) {
  const setImages = (next: string[]) => onChange({ images: next });
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[color:var(--meta)] text-[10px] uppercase tracking-[0.14em]">
          Layout
        </span>
        <button
          type="button"
          onClick={() => onChange({ layout: "vertical" })}
          className={`font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border transition-colors ${
            layout === "vertical"
              ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]"
              : "border-[color:var(--rule)] hover:border-[color:var(--ink)]"
          }`}
        >
          Vertical
        </button>
        <button
          type="button"
          onClick={() => onChange({ layout: "horizontal" })}
          className={`font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border transition-colors ${
            layout === "horizontal"
              ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]"
              : "border-[color:var(--rule)] hover:border-[color:var(--ink)]"
          }`}
        >
          Horizontal
        </button>
      </div>
      <p className="font-mono text-[color:var(--meta)] text-[10px]">
        Each image keeps its natural aspect ratio on the live page. GIFs
        animate automatically. Upload one or many.
      </p>
      <div
        className={
          layout === "horizontal"
            ? "grid grid-cols-2 md:grid-cols-3 gap-3"
            : "space-y-3"
        }
      >
        {images.map((src, idx) => (
          <div key={idx} className="space-y-2">
            <ImageUploadBox
              label={`Media ${idx + 1}`}
              aspect="4 / 3"
              value={src}
              onChange={(url) => {
                const next = [...images];
                next[idx] = url ?? "";
                setImages(next);
              }}
              maxWidth={layout === "horizontal" ? 240 : 520}
            />
            <button
              type="button"
              onClick={() => setImages(images.filter((_, j) => j !== idx))}
              className="font-mono text-[color:var(--meta)] hover:text-red-700 text-[10px]"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setImages([...images, ""])}
          className="self-start font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors h-fit"
        >
          + Add media
        </button>
      </div>
    </div>
  );
}

/** Stack editor — variable number of layered images, 2–6 typical.
 *  Each slot is its own upload box. Add / remove individual images. */
function StackImagesEditor({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="font-mono text-[color:var(--meta)] text-[10px]">
        Layer 2–6 images. They cycle every ~3 seconds in the order shown.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((src, idx) => (
          <div key={idx} className="space-y-2">
            <ImageUploadBox
              label={`Layer ${idx + 1}`}
              aspect="16 / 10"
              value={src}
              onChange={(url) => {
                const next = [...images];
                next[idx] = url ?? "";
                onChange(next);
              }}
              maxWidth={260}
            />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, j) => j !== idx))}
              className="font-mono text-[color:var(--meta)] hover:text-red-700 text-[10px]"
            >
              Remove layer
            </button>
          </div>
        ))}
        {images.length < 6 && (
          <button
            type="button"
            onClick={() => onChange([...images, ""])}
            className="self-start font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
          >
            + Add layer
          </button>
        )}
      </div>
    </div>
  );
}
