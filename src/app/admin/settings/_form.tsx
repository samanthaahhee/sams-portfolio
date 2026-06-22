"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Uploads a file to /api/admin/upload (Vercel Blob) and returns the URL. */
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
          const j = JSON.parse(xhr.responseText) as { error?: string };
          if (j.error) msg = j.error;
        } catch {}
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(fd);
  });
}

export function SettingsForm({
  initialCvUrl,
  defaultCvUrl,
}: {
  initialCvUrl: string;
  defaultCvUrl: string;
}) {
  const router = useRouter();
  const [cvUrl, setCvUrl] = useState(initialCvUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const effective = (cvUrl.trim() || defaultCvUrl);
  const isBlob = /blob\.vercel-storage\.com/.test(effective);

  async function handleUpload(file: File) {
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const url = await uploadToBlob(file, (p) => setProgress(Math.round(p)));
      setCvUrl(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_url: cvUrl.trim() }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setSavedAt(Date.now());
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function resetToDefault() {
    setCvUrl("");
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl mb-2">CV download link</h2>
        <p className="font-mono text-[color:var(--meta)] text-[11px] leading-relaxed max-w-prose">
          The Experience link in the site header points here. Upload a new
          PDF or paste a URL. Leave blank to fall back to the bundled
          default ({defaultCvUrl}).
        </p>
      </div>

      {/* Upload */}
      <div className="space-y-2">
        <p className="font-mono text-[color:var(--meta)]">
          Upload new PDF (≤ 4 MB)
        </p>
        <label
          className="relative block cursor-pointer rounded-sm border-2 border-dashed border-[color:var(--rule)] hover:border-[color:var(--ink-soft)] transition-colors p-6 text-center"
        >
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />
          <p className="font-mono text-[color:var(--ink-soft)]">
            {uploading ? `Uploading ${progress}%…` : "Drop or click to upload PDF"}
          </p>
          {uploading && (
            <div className="w-3/4 h-1 bg-[color:var(--rule)] rounded-full overflow-hidden mt-3 mx-auto">
              <div
                className="h-full bg-[color:var(--ink)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </label>
      </div>

      {/* Manual URL */}
      <div className="space-y-2">
        <label
          htmlFor="cv-url"
          className="font-mono text-[color:var(--meta)] block"
        >
          Or paste a URL
        </label>
        <input
          id="cv-url"
          type="text"
          value={cvUrl}
          onChange={(e) => setCvUrl(e.target.value)}
          placeholder={defaultCvUrl}
          className="w-full px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] font-mono text-sm"
        />
        <p className="font-mono text-[10px] text-[color:var(--meta)]">
          Currently serving: <span className="break-all">{effective}</span>
          {isBlob && (
            <>
              {" "}
              <span className="opacity-70">
                (force-download via ?download=… appended at render)
              </span>
            </>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={save}
          disabled={saving || uploading}
          className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px] disabled:opacity-50"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={resetToDefault}
          disabled={saving || uploading}
          className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px] border border-[color:var(--rule)] hover:border-[color:var(--ink)] disabled:opacity-50"
        >
          Reset to default
        </button>
        <a
          href={effective}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[10px] uppercase tracking-[0.14em] underline hover:text-[color:var(--ink)]"
        >
          Preview ↗
        </a>
        {savedAt && (
          <span
            aria-live="polite"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--meta)]"
          >
            Saved
          </span>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-700 font-mono bg-red-50 px-3 py-2 rounded">
          {error}
        </p>
      )}
    </section>
  );
}
