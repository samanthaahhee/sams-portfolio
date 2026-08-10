"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LibraryImage } from "@/lib/db-portfolio";
import { LibraryPicker } from "./_library-picker";

/** The project's cover image — the homepage thumbnail and the hero at the
 *  top of its own page, which are the same picture.
 *
 *  Saves on its own rather than waiting for the form's Save button: it
 *  writes a media row, not a project column, so it has nothing to do with
 *  the surrounding form submit. */
export function CoverField({
  projectId,
  projectSlug,
  initialUrl,
  library,
}: {
  projectId: number;
  projectSlug: string;
  initialUrl: string | null;
  library: LibraryImage[];
}) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  async function save(nextUrl: string, width: number | null, height: number | null) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/work/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, projectSlug, url: nextUrl, width, height }),
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
      <span className="font-mono text-[color:var(--meta)] block">
        Cover image (homepage thumbnail + hero)
      </span>

      {picking && (
        <LibraryPicker
          library={library}
          busy={busy}
          onPick={(m) => save(m.url, m.width, m.height)}
          onClose={() => setPicking(false)}
        />
      )}

      <div className="flex items-start gap-4 flex-wrap">
        <div className="border border-[color:var(--rule)] rounded-sm overflow-hidden w-48 aspect-[4/3] grid place-items-center shrink-0">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--meta)]">
              None
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
          {busy && <span className="font-mono text-[10px] text-[color:var(--meta)]">Saving…</span>}
          {savedAt && !busy && (
            <span className="font-mono text-[10px] text-[color:var(--meta)]">
              ✓ Saved — shown on the homepage
            </span>
          )}
        </div>
      </div>

      {error && <p className="font-mono text-red-700 bg-red-50 px-3 py-2 rounded text-[11px]">{error}</p>}
    </div>
  );
}
