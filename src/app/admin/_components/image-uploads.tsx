"use client";

import { useState } from "react";

/* ─────────────────────────────────────────────────────────────────── */
/* Shared types                                                         */
/* ─────────────────────────────────────────────────────────────────── */

export type GalleryItem = { url: string; caption?: string };
export type Comparison = { before: string; after: string; caption?: string };

/* ─────────────────────────────────────────────────────────────────── */
/* XHR upload with progress                                             */
/* ─────────────────────────────────────────────────────────────────── */

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
          reject(new Error("Invalid JSON response from upload"));
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
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.ontimeout = () => reject(new Error("Upload timed out"));
    xhr.send(fd);
  });
}

/* ─────────────────────────────────────────────────────────────────── */
/* Single-image upload box                                              */
/* ─────────────────────────────────────────────────────────────────── */

export function ImageUploadBox({
  label,
  helper,
  aspect,
  value,
  onChange,
  maxWidth = 320,
}: {
  label: string;
  helper?: string;
  aspect: string;
  value: string;
  onChange: (url: string | null) => void;
  maxWidth?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const url = await uploadToBlob(file, (p) => setProgress(Math.round(p)));
      onChange(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
      console.error("[upload]", e);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <div className="space-y-2">
      {label && <p className="font-mono text-[color:var(--meta)]">{label}</p>}
      {!value ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={`relative block cursor-pointer rounded-sm border-2 border-dashed transition-colors ${
            dragOver
              ? "border-[color:var(--ink)] bg-[color:var(--paper-soft)]"
              : "border-[color:var(--rule)] hover:border-[color:var(--ink-soft)]"
          }`}
          style={{ aspectRatio: aspect, maxWidth }}
        >
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 gap-1">
            <p className="font-mono text-[color:var(--ink-soft)]">
              {uploading ? `Uploading ${progress}%…` : "Drop or click"}
            </p>
            {uploading ? (
              <div className="w-3/4 h-1 bg-[color:var(--rule)] rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-[color:var(--ink)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            ) : (
              helper && (
                <p className="font-mono text-[color:var(--meta)] text-[10px] leading-relaxed max-w-[28ch]">
                  {helper}
                </p>
              )
            )}
          </div>
        </label>
      ) : (
        <div
          className="relative rounded-sm overflow-hidden"
          style={{ aspectRatio: aspect, maxWidth }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={value}
            src={value}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <label className="cursor-pointer font-mono uppercase tracking-[0.12em] text-[9px] px-3 py-1.5 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] hover:scale-[1.03] transition-transform">
              {uploading ? "…" : "Replace"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  // Reset so the same filename can be picked again
                  e.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="font-mono uppercase tracking-[0.12em] text-[9px] px-3 py-1.5 rounded-full bg-white text-[color:var(--ink)] hover:scale-[1.03] transition-transform"
            >
              Remove
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="text-xs text-red-700 font-mono bg-red-50 px-2 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/* Gallery — multiple items, each with caption + reorder controls       */
/* ─────────────────────────────────────────────────────────────────── */

export function GalleryUploadGrid({
  gallery,
  onChange,
}: {
  gallery: GalleryItem[];
  onChange: (g: GalleryItem[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function uploadMany(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    let done = 0;
    const next: GalleryItem[] = [...gallery];

    try {
      for (const file of list) {
        // Per-file progress, scaled into the overall bar
        const url = await uploadToBlob(file, (p) => {
          const overall = ((done + p / 100) / list.length) * 100;
          setProgress(Math.round(overall));
        });
        next.push({ url });
        done += 1;
        // Update gallery incrementally so user sees each image appear
        onChange([...next]);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
      console.error("[upload]", e);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= gallery.length) return;
    const next = [...gallery];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const updateCaption = (i: number, caption: string) => {
    onChange(gallery.map((g, j) => (j === i ? { ...g, caption } : g)));
  };

  const remove = (i: number) => onChange(gallery.filter((_, j) => j !== i));

  const [replacingIdx, setReplacingIdx] = useState<number | null>(null);
  const [replaceProgress, setReplaceProgress] = useState(0);

  const replace = async (i: number, file: File) => {
    setReplacingIdx(i);
    setReplaceProgress(0);
    setError(null);
    try {
      const url = await uploadToBlob(file, (p) =>
        setReplaceProgress(Math.round(p)),
      );
      // Preserve caption, swap URL in place
      onChange(gallery.map((g, j) => (j === i ? { ...g, url } : g)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setReplacingIdx(null);
      setReplaceProgress(0);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[color:var(--meta)]">Gallery images</p>
        <p className="font-mono text-[color:var(--meta)] text-[10px]">
          Landscape, 16:10. ≥ 1600 × 1000 px. Reorder with ↑ ↓.
        </p>
      </div>

      {/* Existing items — fixed thumbnail width, caption + URL beside it,
          row of action buttons across the bottom. Everything contained
          in a single bordered row so nothing overflows. */}
      <div className="space-y-3">
        {gallery.map((g, i) => (
          <div
            key={g.url + i}
            className="flex flex-col sm:flex-row gap-3 items-stretch border border-[color:var(--rule)] rounded-sm p-3"
          >
            {/* Thumbnail — fixed size, won't grow */}
            <div
              className="relative rounded-sm overflow-hidden flex-shrink-0"
              style={{ width: 160, height: 100 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={g.url}
                src={g.url}
                alt={`Gallery ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1.5 font-mono text-[9px] tracking-[0.14em] text-white drop-shadow">
                FIG. {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Caption + URL stacked, fills remaining space */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <input
                type="text"
                value={g.caption ?? ""}
                placeholder="Caption (optional)"
                onChange={(e) => updateCaption(i, e.target.value)}
                className="w-full px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] font-mono text-sm"
              />
              <p className="font-mono text-[10px] text-[color:var(--meta)] truncate">
                {g.url}
              </p>
              <div className="flex items-center gap-2 mt-auto">
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
                  disabled={i === gallery.length - 1}
                  aria-label="Move down"
                  className="font-mono text-[12px] w-7 h-7 rounded-full border border-[color:var(--rule)] disabled:opacity-30 hover:border-[color:var(--ink)] transition-colors leading-none"
                >
                  ↓
                </button>
                <label className="ml-auto cursor-pointer font-mono text-[9px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors">
                  {replacingIdx === i
                    ? `Replacing ${replaceProgress}%…`
                    : "Replace"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={replacingIdx !== null}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) replace(i, f);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Remove"
                  className="font-mono text-[9px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-red-700 hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add tile — always at the end */}
      <label
        className="relative block cursor-pointer rounded-sm border-2 border-dashed border-[color:var(--rule)] hover:border-[color:var(--ink-soft)] transition-colors"
        style={{ height: 80 }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files?.length) uploadMany(e.target.files);
            // Reset the input so the same filename can be picked again
            e.target.value = "";
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 gap-1">
          <p className="font-mono text-[color:var(--ink-soft)]">
            {uploading ? `Uploading ${progress}%…` : "+ Add image(s)"}
          </p>
          {uploading ? (
            <div className="w-3/4 h-1 bg-[color:var(--rule)] rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-[color:var(--ink)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : (
            <p className="font-mono text-[color:var(--meta)] text-[9px]">
              Drop or click — multiple images supported
            </p>
          )}
        </div>
      </label>

      {error && (
        <p className="text-xs text-red-700 font-mono bg-red-50 px-2 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/* Before / after comparison pairs                                      */
/* ─────────────────────────────────────────────────────────────────── */

export function ComparisonsEditor({
  comparisons,
  onChange,
}: {
  comparisons: Comparison[];
  onChange: (c: Comparison[]) => void;
}) {
  const update = (i: number, patch: Partial<Comparison>) =>
    onChange(comparisons.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const remove = (i: number) => onChange(comparisons.filter((_, j) => j !== i));
  const add = () =>
    onChange([...comparisons, { before: "", after: "", caption: "" }]);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= comparisons.length) return;
    const next = [...comparisons];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[color:var(--meta)]">Before / after sliders</p>
        <button
          type="button"
          onClick={add}
          className="font-mono text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
        >
          + Add slider
        </button>
      </div>

      {comparisons.length === 0 && (
        <p className="font-mono text-[color:var(--meta)] text-[11px]">
          No before/after comparisons yet. Add one to upload paired images.
        </p>
      )}

      {comparisons.map((c, i) => (
        <div
          key={i}
          className="border border-[color:var(--rule)] rounded-sm p-3 space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[color:var(--meta)]">
              Slider {String(i + 1).padStart(2, "0")}
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
                disabled={i === comparisons.length - 1}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ImageUploadBox
              label="Before"
              aspect="16 / 10"
              value={c.before}
              onChange={(url) => update(i, { before: url ?? "" })}
              maxWidth={400}
            />
            <ImageUploadBox
              label="After"
              aspect="16 / 10"
              value={c.after}
              onChange={(url) => update(i, { after: url ?? "" })}
              maxWidth={400}
            />
          </div>
          <input
            type="text"
            value={c.caption ?? ""}
            placeholder="Caption (optional)"
            onChange={(e) => update(i, { caption: e.target.value })}
            className="w-full px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] font-mono text-sm"
          />
        </div>
      ))}
    </div>
  );
}
