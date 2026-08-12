"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LibraryImage } from "@/lib/db-portfolio";
import { LibraryPicker } from "./_library-picker";

/** One image field — the hero cover, or the homepage thumbnail with its
 *  own crop. Both write a media row rather than a project column, so
 *  both save on their own rather than waiting for the form's Save.
 *
 *  The thumbnail variant carries a focal point, previewed in a 4:3 box
 *  because that is exactly the frame the homepage tile crops to. */
export function CoverField({
  projectId,
  projectSlug,
  initialUrl,
  library,
  endpoint = "/api/admin/work/cover",
  label = "Cover image (hero at the top of the project page)",
  hint,
  croppable = false,
  initialFocalX = 0.5,
  initialFocalY = 0.5,
  initialZoom = 1,
  aspect = "4 / 3",
  clearable = false,
}: {
  projectId: number;
  projectSlug: string;
  initialUrl: string | null;
  library: LibraryImage[];
  endpoint?: string;
  label?: string;
  hint?: string;
  croppable?: boolean;
  initialFocalX?: number;
  initialFocalY?: number;
  initialZoom?: number;
  /** The frame this image is cropped to on the page. */
  aspect?: string;
  clearable?: boolean;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [focal, setFocal] = useState({ x: initialFocalX, y: initialFocalY });
  const [zoom, setZoom] = useState(initialZoom);
  const [dragging, setDragging] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  async function save(nextUrl: string | null, width: number | null, height: number | null) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          projectSlug,
          url: nextUrl,
          width,
          height,
          focalX: focal.x,
          focalY: focal.y,
          zoom,
        }),
      });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Save failed");
      setUrl(nextUrl);
      setSavedAt(new Date());
      setPicking(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveCrop(x: number, y: number, z: number) {
    if (!url) return;
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, projectSlug, url, focalX: x, focalY: y, zoom: z }),
    });
    setSavedAt(new Date());
    router.refresh();
  }

  const pointTo = (clientX: number, clientY: number) => {
    const el = boxRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (clientY - r.top) / r.height)),
    };
  };

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
          URL.revokeObjectURL(objectUrl);
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Could not read image dimensions"));
        };
        img.src = objectUrl;
      });
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
      await save(json.url, dims.width, dims.height);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <span className="font-mono text-[color:var(--meta)] block">{label}</span>
      {hint && <p className="font-mono text-[10px] text-[color:var(--meta)]">{hint}</p>}

      {picking && (
        <LibraryPicker
          library={library}
          busy={busy}
          onPick={(m) => save(m.url, m.width, m.height)}
          onClose={() => setPicking(false)}
        />
      )}

      <div className="flex items-start gap-4 flex-wrap">
        <div
          ref={boxRef}
          className={`border border-[color:var(--rule)] rounded-sm overflow-hidden w-48 grid place-items-center shrink-0 relative ${
            croppable && url ? "cursor-crosshair select-none" : ""
          }`}
          style={{ aspectRatio: aspect }}
          onPointerDown={
            croppable && url
              ? (e) => {
                  (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                  setDragging(true);
                  const pt = pointTo(e.clientX, e.clientY);
                  if (pt) setFocal(pt);
                }
              : undefined
          }
          onPointerMove={
            croppable && url
              ? (e) => {
                  if (!dragging) return;
                  const pt = pointTo(e.clientX, e.clientY);
                  if (pt) setFocal(pt);
                }
              : undefined
          }
          onPointerUp={
            croppable && url
              ? () => {
                  setDragging(false);
                  saveCrop(focal.x, focal.y, zoom);
                }
              : undefined
          }
        >
          {url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                draggable={false}
                className="w-full h-full object-cover pointer-events-none"
                style={
                  croppable
                    ? {
                        objectPosition: `${focal.x * 100}% ${focal.y * 100}%`,
                        transform: zoom > 1 ? `scale(${zoom})` : undefined,
                        transformOrigin: `${focal.x * 100}% ${focal.y * 100}%`,
                      }
                    : undefined
                }
              />
              {croppable && (
                <span
                  aria-hidden
                  className="absolute w-5 h-5 rounded-full border-2 border-white pointer-events-none"
                  style={{
                    left: `${focal.x * 100}%`,
                    top: `${focal.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.45)",
                  }}
                />
              )}
            </>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--meta)]">
              None
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {croppable && url && (
            <label className="flex items-center gap-2 w-full">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--meta)]">
                Zoom {zoom.toFixed(1)}x
              </span>
              <input
                type="range"
                min={1}
                max={4}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                onPointerUp={() => saveCrop(focal.x, focal.y, zoom)}
                onKeyUp={() => saveCrop(focal.x, focal.y, zoom)}
                className="flex-1 max-w-[160px]"
              />
            </label>
          )}
          <button
            type="button"
            disabled={busy || library.length === 0}
            onClick={() => setPicking(true)}
            className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] disabled:opacity-40"
          >
            Choose
          </button>
          <label className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] cursor-pointer">
            Upload
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
          </label>
          {clearable && url && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setUrl(null);
                save(null, null, null);
              }}
              className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] text-[color:var(--meta)] disabled:opacity-40"
            >
              Clear
            </button>
          )}
          {busy && <span className="font-mono text-[10px] text-[color:var(--meta)]">Saving…</span>}
          {savedAt && !busy && (
            <span className="font-mono text-[10px] text-[color:var(--meta)]">✓ Saved</span>
          )}
        </div>
      </div>

      {error && <p className="font-mono text-red-700 bg-red-50 px-3 py-2 rounded text-[11px]">{error}</p>}
    </div>
  );
}
