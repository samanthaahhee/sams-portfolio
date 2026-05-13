"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/projects";
import { NAMED_PALETTES, PALETTE_HEX, paletteFromBg } from "@/lib/palette";

const TAGS = ["Brand", "Product", "Campaign", "Packaging", "Print", "Email"];

type Props = {
  project?: Project;
  mode: "create" | "edit";
};

export function ProjectForm({ project, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Project>(
    project ?? {
      slug: "",
      brand: "",
      title: "",
      tags: ["Brand"],
      year: "",
      palette: "butter-slate" as Project["palette"],
      cover: "",
      description: "",
      gallery: [],
      href: undefined,
    },
  );

  const toggleTag = (t: string) => {
    setForm((prev) => {
      const has = prev.tags.includes(t);
      const next = has ? prev.tags.filter((x) => x !== t) : [...prev.tags, t];
      // Always keep at least one tag
      return { ...prev, tags: next.length === 0 ? [t] : next };
    });
  };

  const set = <K extends keyof Project>(k: K, v: Project[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, _mode: mode, _originalSlug: project?.slug }),
    });
    setSaving(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Save failed");
      return;
    }
    router.push("/admin/projects");
    router.refresh();
  }

  async function remove() {
    if (!project) return;
    if (!confirm(`Delete ${project.brand} · ${project.title}? This cannot be undone.`)) return;
    const res = await fetch(
      `/api/admin/projects?slug=${encodeURIComponent(project.slug)}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    router.push("/admin/projects");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Field label="Slug (URL path)">
        <input
          required
          value={form.slug}
          onChange={(e) =>
            set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
          }
          className={fieldInput}
          placeholder="e.g. krover-brand"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Brand / client">
          <input
            required
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
            className={fieldInput}
          />
        </Field>
        <Field label="Title">
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={fieldInput}
          />
        </Field>
      </div>

      <Field label="Tags (one or more)">
        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => {
            const active = form.tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className="font-mono uppercase tracking-[0.14em] px-3 py-1.5 rounded-full text-[10px] border transition-colors"
                style={{
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "var(--paper)" : "var(--ink-soft)",
                  borderColor: active ? "var(--ink)" : "var(--rule)",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
        <p className="font-mono text-[color:var(--meta)] text-[10px] mt-2">
          First selected tag is the primary (shown on the archive filter).
        </p>
      </Field>

      <PaletteField
        palette={form.palette}
        customColors={form.customColors}
        onChange={(palette, customColors) => {
          setForm((prev) => ({ ...prev, palette, customColors }));
        }}
      />

      <Field label="Year (optional)">
        <input
          value={form.year ?? ""}
          onChange={(e) => set("year", e.target.value || undefined)}
          className={fieldInput}
        />
      </Field>

      <Field label="Description">
        <textarea
          required
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          className={fieldInput}
        />
      </Field>

      <ImageUploadBox
        label="Cover image"
        helper="Portrait, 4:5 ratio. Recommended ≥ 800 × 1000 px. JPG, PNG or WebP."
        aspect="4 / 5"
        value={form.cover}
        onChange={(url) => set("cover", url ?? "")}
      />

      <GalleryUploadGrid
        gallery={form.gallery}
        onChange={(g) => set("gallery", g)}
      />

      <Field label="External link (optional)">
        <input
          value={form.href ?? ""}
          onChange={(e) => set("href", e.target.value || undefined)}
          className={fieldInput}
          placeholder="https://www.behance.net/…"
        />
      </Field>

      {error && (
        <p className="font-mono text-red-700 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-[color:var(--rule)]">
        <button
          type="submit"
          disabled={saving}
          className="font-mono uppercase tracking-[0.14em] px-5 py-2.5 rounded-full text-[10px] disabled:opacity-50"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Create"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={remove}
            className="font-mono text-[color:var(--meta)] hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/* Image upload box — single image                                     */
/* ─────────────────────────────────────────────────────────────────── */

function ImageUploadBox({
  label,
  helper,
  aspect,
  value,
  onChange,
}: {
  label: string;
  helper: string;
  aspect: string;
  value: string;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Upload failed");
      }
      const { url } = (await res.json()) as { url: string };
      onChange(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="font-mono text-[color:var(--meta)]">{label}</p>
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
            if (f) upload(f);
          }}
          className={`relative block cursor-pointer rounded-sm border-2 border-dashed transition-colors ${
            dragOver
              ? "border-[color:var(--ink)] bg-[color:var(--paper-soft)]"
              : "border-[color:var(--rule)] hover:border-[color:var(--ink-soft)]"
          }`}
          style={{ aspectRatio: aspect, maxWidth: 320 }}
        >
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 gap-2">
            <p className="font-mono text-[color:var(--ink-soft)]">
              {uploading ? "Uploading…" : "Drop image or click"}
            </p>
            <p className="font-mono text-[color:var(--meta)] text-[10px] leading-relaxed max-w-[28ch]">
              {helper}
            </p>
          </div>
        </label>
      ) : (
        <div
          className="relative rounded-sm overflow-hidden"
          style={{ aspectRatio: aspect, maxWidth: 320 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Cover preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <label className="cursor-pointer font-mono uppercase tracking-[0.12em] text-[9px] px-3 py-1.5 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] hover:scale-[1.03] transition-transform">
              Replace
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
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
      {error && <p className="text-xs text-red-700 font-mono">{error}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/* Gallery upload — multiple images                                    */
/* ─────────────────────────────────────────────────────────────────── */

function GalleryUploadGrid({
  gallery,
  onChange,
}: {
  gallery: string[];
  onChange: (g: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadMany(files: FileList | File[]) {
    setUploading(true);
    setError(null);
    const next: string[] = [...gallery];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        const { url } = (await res.json()) as { url: string };
        next.push(url);
      }
      onChange(next);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[color:var(--meta)]">Gallery images</p>
        <p className="font-mono text-[color:var(--meta)] text-[10px]">
          Landscape, 16:10. Recommended ≥ 1600 × 1000 px.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {gallery.map((src, i) => (
          <div
            key={src + i}
            className="relative rounded-sm overflow-hidden"
            style={{ aspectRatio: "16 / 10" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Gallery ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-1.5 right-1.5 flex gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onChange(gallery.filter((_, j) => j !== i))
                }
                className="font-mono uppercase tracking-[0.12em] text-[9px] px-2.5 py-1 rounded-full bg-white text-[color:var(--ink)] hover:scale-[1.03] transition-transform"
              >
                Remove
              </button>
            </div>
            <span className="absolute bottom-1.5 left-2 font-mono text-[10px] tracking-[0.12em] text-white drop-shadow">
              Fig. {String(i + 1).padStart(2, "0")}
            </span>
          </div>
        ))}

        {/* Upload tile */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const files = e.dataTransfer.files;
            if (files?.length) uploadMany(files);
          }}
          className={`relative block cursor-pointer rounded-sm border-2 border-dashed transition-colors ${
            dragOver
              ? "border-[color:var(--ink)] bg-[color:var(--paper-soft)]"
              : "border-[color:var(--rule)] hover:border-[color:var(--ink-soft)]"
          }`}
          style={{ aspectRatio: "16 / 10" }}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) uploadMany(e.target.files);
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 gap-1">
            <p className="font-mono text-[color:var(--ink-soft)]">
              {uploading ? "Uploading…" : "+ Add images"}
            </p>
            <p className="font-mono text-[color:var(--meta)] text-[9px]">
              Drop here or click
            </p>
          </div>
        </label>
      </div>

      {error && <p className="text-xs text-red-700 font-mono">{error}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/* Palette picker — preset row + custom 2-colour input                 */
/* ─────────────────────────────────────────────────────────────────── */

function PaletteField({
  palette,
  customColors,
  onChange,
}: {
  palette: Project["palette"];
  customColors: Project["customColors"];
  onChange: (
    palette: Project["palette"],
    customColors: Project["customColors"],
  ) => void;
}) {
  const current =
    palette === "custom" && customColors
      ? customColors
      : PALETTE_HEX[palette as keyof typeof PALETTE_HEX];

  const setBg = (hex: string) => {
    onChange("custom", paletteFromBg(hex));
  };

  return (
    <div className="space-y-3">
      <p className="font-mono text-[color:var(--meta)]">Card background</p>

      {/* Preset swatches — single dot showing the background colour */}
      <div className="flex flex-wrap gap-2">
        {NAMED_PALETTES.map((p) => {
          const hex = PALETTE_HEX[p];
          const active = palette === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p, undefined)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-colors"
              style={{
                borderColor: active ? "var(--ink)" : "var(--rule)",
                background: active ? "var(--ink)" : "transparent",
                color: active ? "var(--paper)" : "var(--ink-soft)",
              }}
              aria-pressed={active}
            >
              <span
                className="inline-block w-4 h-4 rounded-full border border-black/10"
                style={{ background: hex.a }}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
                {p}
              </span>
            </button>
          );
        })}
      </div>

      {/* Single colour input — always visible. Editing flips to custom. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <ColorInput
          label="Or pick your own hex"
          value={current.a}
          onChange={setBg}
        />
        <div
          className="rounded-sm overflow-hidden border border-[color:var(--rule)] flex items-center justify-center font-mono uppercase tracking-[0.12em] text-[10px]"
          style={{
            background: current.a,
            color: current.aInk,
            height: 44,
          }}
        >
          Preview
        </div>
      </div>
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[color:var(--meta)] block">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-sm border border-[color:var(--rule)] cursor-pointer p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value.trim();
            if (/^#?[0-9a-fA-F]{6}$/.test(v)) {
              onChange(v.startsWith("#") ? v : `#${v}`);
            } else {
              onChange(e.target.value);
            }
          }}
          className="flex-1 px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm font-mono text-sm focus:outline-none focus:border-[color:var(--ink)]"
          placeholder="#a1b2c3"
        />
      </div>
    </label>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

const fieldInput =
  "w-full px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[color:var(--meta)] block">{label}</span>
      {children}
    </label>
  );
}
