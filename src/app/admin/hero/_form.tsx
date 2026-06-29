"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HeroCard } from "@/lib/db";

function uploadToBlob(
  file: File,
  onProgress?: (n: number) => void,
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
          const j = JSON.parse(xhr.responseText) as {
            url?: string;
            error?: string;
          };
          if (j.url) return resolve(j.url);
          reject(new Error(j.error ?? "No URL in response"));
        } catch {
          reject(new Error("Invalid JSON response"));
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
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(fd);
  });
}

export function HeroCardForm({ initial }: { initial?: HeroCard }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [href, setHref] = useState(initial?.href ?? "");
  const [client, setClient] = useState(initial?.client ?? "");
  const [accentColor, setAccentColor] = useState(initial?.accentColor ?? "");
  const [bgColor, setBgColor] = useState(initial?.bgColor ?? "");

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const url = await uploadToBlob(file, (p) => setProgress(Math.round(p)));
      setImageUrl(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!imageUrl || !title) {
      setError("Image and title are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initial?.id,
          imageUrl,
          title,
          href: href || "#",
          client,
          accentColor,
          bgColor,
        }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      router.push("/admin/hero");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!initial?.id) return;
    if (!confirm("Delete this hero card?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/hero?id=${initial.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/admin/hero");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Image */}
      <div className="space-y-3">
        <p className="font-mono text-[color:var(--meta)]">Image</p>
        {imageUrl ? (
          <div className="space-y-3">
            <div
              className="relative rounded-sm overflow-hidden border border-[color:var(--rule)]"
              style={{ aspectRatio: "4 / 3", maxWidth: 480 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <label className="inline-block cursor-pointer font-mono uppercase tracking-[0.12em] text-[10px] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--ink)]">
              {uploading ? `Replacing ${progress}%…` : "Replace image"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        ) : (
          <label
            className="relative block cursor-pointer rounded-sm border-2 border-dashed border-[color:var(--rule)] hover:border-[color:var(--ink-soft)] p-8 text-center"
            style={{ maxWidth: 480 }}
          >
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <p className="font-mono text-[color:var(--ink-soft)]">
              {uploading ? `Uploading ${progress}%…` : "Drop or click — image"}
            </p>
            <p className="font-mono text-[10px] text-[color:var(--meta)] mt-2">
              Landscape 4 : 3 preferred · ≤ 4 MB
            </p>
          </label>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className="font-mono text-[color:var(--meta)] block">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Recharge brand uplift"
          className="w-full max-w-2xl px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] font-mono text-sm"
        />
      </div>

      {/* Client */}
      <div className="space-y-2">
        <label className="font-mono text-[color:var(--meta)] block">
          Client / subtitle <span className="opacity-50">(optional)</span>
        </label>
        <input
          type="text"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="e.g. Recharge.com"
          className="w-full max-w-2xl px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] font-mono text-sm"
        />
      </div>

      {/* Href */}
      <div className="space-y-2">
        <label className="font-mono text-[color:var(--meta)] block">
          Link
        </label>
        <input
          type="text"
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="/work/recharge or https://…"
          className="w-full max-w-2xl px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] font-mono text-sm"
        />
      </div>

      {/* Colour overrides */}
      <div className="space-y-3 max-w-2xl">
        <p className="font-mono text-[color:var(--meta)]">
          Per-card colour overrides
        </p>
        <p className="font-mono text-[10px] text-[color:var(--meta)] leading-relaxed">
          Optional. When this card is on top of the deck, these colours
          override the automatic ones sampled from the image. Leave
          blank to keep auto behaviour.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <ColorField
            label="Sam Ahhee wordmark colour"
            value={accentColor}
            onChange={setAccentColor}
            fallback="#f4b8d0"
          />
          <ColorField
            label="Background colour"
            value={bgColor}
            onChange={setBgColor}
            fallback="#170a0d"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700 font-mono bg-red-50 px-3 py-2 rounded max-w-2xl">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap pt-2">
        <button
          type="button"
          onClick={save}
          disabled={saving || uploading}
          className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px] disabled:opacity-50"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          {saving ? "Saving…" : initial?.id ? "Save changes" : "Create card"}
        </button>
        {initial?.id && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px] border border-[color:var(--rule)] hover:border-red-700 hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  fallback,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  fallback: string;
}) {
  // Show a swatch picker for quick choice + a text input for paste.
  const display = value || fallback;
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--meta)] block">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={isHexColor(display) ? display : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 rounded-sm border border-[color:var(--rule)] bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={value}
          placeholder={fallback + " (auto)"}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] font-mono text-sm"
        />
      </div>
    </div>
  );
}

function isHexColor(s: string) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s);
}
