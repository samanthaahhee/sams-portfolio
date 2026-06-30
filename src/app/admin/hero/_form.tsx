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
  // 3-stop gradient. Empty strings mean "unset" — all empty == auto.
  const [gradStart, setGradStart] = useState(initial?.bgGradient?.[0] ?? "");
  const [gradMid, setGradMid] = useState(initial?.bgGradient?.[1] ?? "");
  const [gradEnd, setGradEnd] = useState(initial?.bgGradient?.[2] ?? "");

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
    // Only persist the gradient if at least the first and last stops are set;
    // missing middle falls back to a 50/50 mix of the two ends.
    const stops: string[] = [];
    const s = gradStart.trim();
    const m = gradMid.trim();
    const e = gradEnd.trim();
    if (s && e) {
      stops.push(s, m || mixHex(s, e), e);
    }
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
          bgGradient: stops.length > 0 ? stops : null,
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
          Optional. When this card is on top of the deck, these
          colours override the automatic ones sampled from the image.
          Leave blank to keep auto behaviour.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <ColorField
            label="Sam Ahhee wordmark colour"
            value={accentColor}
            onChange={setAccentColor}
            fallback="#f4b8d0"
          />
          <ColorField
            label="Solid background fallback"
            value={bgColor}
            onChange={setBgColor}
            fallback="#170a0d"
          />
        </div>
      </div>

      {/* Gradient picker + preview */}
      <div className="space-y-3 max-w-2xl">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[color:var(--meta)]">
            Background gradient
          </p>
          <button
            type="button"
            onClick={() => {
              setGradStart("");
              setGradMid("");
              setGradEnd("");
            }}
            className="font-mono text-[10px] text-[color:var(--meta)] underline hover:text-[color:var(--ink)]"
          >
            Clear (use auto)
          </button>
        </div>
        <p className="font-mono text-[10px] text-[color:var(--meta)] leading-relaxed">
          Set start + end (and optionally middle) to paint a 3-stop
          gradient behind the deck when this card is on top. Leave any
          stop blank to skip; if start &amp; end are set without
          middle, the middle stop is auto-mixed.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <GradientStop label="Start" value={gradStart} onChange={setGradStart} />
          <GradientStop label="Middle" value={gradMid} onChange={setGradMid} />
          <GradientStop label="End" value={gradEnd} onChange={setGradEnd} />
        </div>

        {/* Live hero-style preview */}
        <GradientPreview
          gradStart={gradStart}
          gradMid={gradMid}
          gradEnd={gradEnd}
          accent={accentColor}
          bgFallback={bgColor}
          cardImage={imageUrl}
        />
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

/* ─── Gradient picker stop ───────────────────────────────────── */

function GradientStop({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--meta)] block">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={isHexColor(value) ? value : "#1a0d10"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 rounded-sm border border-[color:var(--rule)] bg-transparent cursor-pointer"
          aria-label={`${label} colour picker`}
        />
        <input
          type="text"
          value={value}
          placeholder="—"
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] font-mono text-sm"
        />
      </div>
    </div>
  );
}

/* ─── Live preview ───────────────────────────────────────────── */

function GradientPreview({
  gradStart,
  gradMid,
  gradEnd,
  accent,
  bgFallback,
  cardImage,
}: {
  gradStart: string;
  gradMid: string;
  gradEnd: string;
  accent: string;
  bgFallback: string;
  cardImage: string;
}) {
  const s = isHexColor(gradStart) ? gradStart : null;
  const e = isHexColor(gradEnd) ? gradEnd : null;
  const m = isHexColor(gradMid)
    ? gradMid
    : s && e
      ? mixHex(s, e)
      : null;

  // Match the hero's actual treatment: linear-gradient(160deg, …) on
  // top of the solid fallback. Falls back to a muted mahogany so the
  // preview is still readable when no stops are set.
  let bg: string;
  if (s && e && m) {
    bg = `linear-gradient(160deg, ${s} 0%, ${m} 55%, ${e} 100%), ${bgFallback || "#170a0d"}`;
  } else if (s && e) {
    bg = `linear-gradient(160deg, ${s} 0%, ${e} 100%), ${bgFallback || "#170a0d"}`;
  } else if (bgFallback) {
    bg = bgFallback;
  } else {
    bg = "linear-gradient(160deg, #2a1622 0%, #1a0d18 55%, #100507 100%), #170a0d";
  }

  const accentSafe = isHexColor(accent) ? accent : "#f4b8d0";

  return (
    <div className="mt-2 space-y-1.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--meta)]">
        Preview · how it sits behind the deck
      </p>
      <div
        className="relative overflow-hidden rounded-md border border-[color:var(--rule)]"
        style={{
          aspectRatio: "16 / 9",
          background: bg,
          transition: "background 300ms ease",
        }}
      >
        {/* Vignette mirroring the live hero */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)",
          }}
        />
        {/* Faux wordmark in the accent colour */}
        <p
          className="absolute top-3 left-0 right-0 text-center font-sans font-medium tracking-tight px-3"
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "10px",
            lineHeight: 1.25,
          }}
        >
          Hey I&rsquo;m Sam. I&rsquo;m a visual communication
          <br />
          designer, translating complex ideas into clear storytelling.
        </p>
        {/* The card itself */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "62%",
            transform: "translate(-50%, -50%)",
            width: "38%",
            aspectRatio: "4 / 3",
          }}
        >
          {cardImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cardImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover rounded-sm shadow-[0_10px_30px_-6px_rgba(0,0,0,0.6)]"
            />
          ) : (
            <div className="absolute inset-0 rounded-sm border border-dashed border-white/30 flex items-center justify-center font-mono text-[9px] uppercase tracking-[0.14em] text-white/60">
              card preview
            </div>
          )}
        </div>
        {/* Accent swatch corner */}
        <span
          className="absolute bottom-3 right-3 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/70"
        >
          <span
            className="inline-block w-3 h-3 rounded-full border border-white/40"
            style={{ background: accentSafe }}
          />
          accent
        </span>
      </div>
    </div>
  );
}

/* ─── Hex helpers ────────────────────────────────────────────── */

function mixHex(a: string, b: string): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  if (!pa || !pb) return a;
  const mix = (x: number, y: number) => Math.round((x + y) / 2);
  return rgbToHex(mix(pa[0], pb[0]), mix(pa[1], pb[1]), mix(pa[2], pb[2]));
}

function parseHex(h: string): [number, number, number] | null {
  let v = h.replace(/^#/, "");
  if (v.length === 3) v = v.split("").map((c) => c + c).join("");
  if (v.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(v)) return null;
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}
