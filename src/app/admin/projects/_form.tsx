"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/projects";
import { NAMED_PALETTES, PALETTE_HEX, paletteFromBg } from "@/lib/palette";
import { ImageUploadBox } from "@/app/admin/_components/image-uploads";
import { VisualsEditor } from "@/app/admin/_components/visuals-editor";

const TAGS = ["Brand", "Packaging", "Illustration", "Campaign", "Product"];
const CATEGORIES = ["Brand", "Packaging", "Illustration", "Campaign", "Product"];

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
      published: true,
    },
  );

  /* Link is stored as a {label, href} object; the form treats label /
   * href as separate inputs for easier editing. Kept in local state and
   * flattened on submit. */
  const [linkLabel, setLinkLabel] = useState(project?.link?.label ?? "");
  const [linkHref, setLinkHref] = useState(project?.link?.href ?? "");

  const addDecision = () =>
    setForm((prev) => ({
      ...prev,
      decisions: [...(prev.decisions ?? []), { title: "", body: "" }],
    }));
  const updateDecision = (i: number, key: "title" | "body", v: string) =>
    setForm((prev) => ({
      ...prev,
      decisions: (prev.decisions ?? []).map((d, j) =>
        j === i ? { ...d, [key]: v } : d,
      ),
    }));
  const removeDecision = (i: number) =>
    setForm((prev) => ({
      ...prev,
      decisions: (prev.decisions ?? []).filter((_, j) => j !== i),
    }));

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

  const [savedAt, setSavedAt] = useState<Date | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const link =
      linkLabel.trim() && linkHref.trim()
        ? { label: linkLabel.trim(), href: linkHref.trim() }
        : undefined;
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        link,
        _mode: mode,
        _originalSlug: project?.slug,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Save failed");
      return;
    }
    setSavedAt(new Date());
    if (mode === "create") {
      // Redirect to edit URL of the just-created entity
      router.push(`/admin/projects/${form.slug}`);
    } else {
      // Stay on page; refresh data so server state is in sync
      router.refresh();
    }
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
      {/* Sticky save bar — keeps Save in reach on long forms */}
      <div className="sticky top-14 z-10 -mx-6 px-6 py-3 bg-[color:var(--paper)] border-b border-[color:var(--rule)] flex items-center justify-end gap-3 flex-wrap">
        <PublishToggle
          published={form.published !== false}
          onChange={(v) => set("published", v)}
        />
        {savedAt && (
          <span className="font-mono text-[color:var(--meta)] text-[11px]">
            ✓ Saved at{" "}
            {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="font-mono uppercase tracking-[0.14em] px-5 py-2.5 rounded-full text-[10px] disabled:opacity-50"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Create"}
        </button>
      </div>

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

      <VisualsEditor
        visuals={form.visuals ?? []}
        onChange={(v) => set("visuals", v)}
      />

      <Field label="External link (optional)">
        <input
          value={form.href ?? ""}
          onChange={(e) => set("href", e.target.value || undefined)}
          className={fieldInput}
          placeholder="https://www.behance.net/…"
        />
      </Field>

      {/* ── Editorial fields — same shape as case studies. All optional;
          empty sections are skipped on the public detail page. ──── */}
      <div className="pt-6 border-t border-[color:var(--rule)] space-y-6">
        <div>
          <p className="font-mono text-[color:var(--meta)] mb-1">
            Editorial detail
          </p>
          <p className="font-mono text-[color:var(--meta)] text-[10px]">
            Optional. Fill any of these to turn the project page into a
            longer-form case study layout. Empty fields are skipped.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="No. (optional)">
            <input
              value={form.no ?? ""}
              onChange={(e) => set("no", e.target.value || undefined)}
              className={fieldInput}
              placeholder="01"
            />
          </Field>
          <Field label="Client (optional)">
            <input
              value={form.client ?? ""}
              onChange={(e) => set("client", e.target.value || undefined)}
              className={`${fieldInput} col-span-2`}
              placeholder="Defaults to Brand"
            />
          </Field>
          <Field label="Category (optional)">
            <select
              value={form.category ?? ""}
              onChange={(e) => set("category", e.target.value || undefined)}
              className={fieldInput}
            >
              <option value="">—</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Primary role (optional)">
          <input
            value={form.primaryRole ?? ""}
            onChange={(e) =>
              set("primaryRole", e.target.value || undefined)
            }
            className={fieldInput}
            placeholder="Brand Designer"
          />
        </Field>

        <Field label="Roles (comma-separated, optional)">
          <input
            value={(form.role ?? []).join(", ")}
            onChange={(e) =>
              set(
                "role",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            className={fieldInput}
            placeholder="Brand, Visual Design, Illustration Direction"
          />
        </Field>

        <Field label="Summary (bold pullquote on detail page)">
          <textarea
            value={form.summary ?? ""}
            onChange={(e) => set("summary", e.target.value || undefined)}
            rows={3}
            className={fieldInput}
          />
        </Field>

        <Field label="Context">
          <textarea
            value={form.context ?? ""}
            onChange={(e) => set("context", e.target.value || undefined)}
            rows={4}
            className={fieldInput}
          />
        </Field>
        <Field label="Problem">
          <textarea
            value={form.problem ?? ""}
            onChange={(e) => set("problem", e.target.value || undefined)}
            rows={4}
            className={fieldInput}
          />
        </Field>
        <Field label="Approach">
          <textarea
            value={form.approach ?? ""}
            onChange={(e) => set("approach", e.target.value || undefined)}
            rows={4}
            className={fieldInput}
          />
        </Field>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[color:var(--meta)]">Decisions</p>
            <button
              type="button"
              onClick={addDecision}
              className="font-mono text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
            >
              + Add decision
            </button>
          </div>
          {(form.decisions ?? []).map((d, i) => (
            <div
              key={i}
              className="border border-[color:var(--rule)] rounded-sm p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[color:var(--meta)]">
                  Decision {String(i + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => removeDecision(i)}
                  className="font-mono text-[color:var(--meta)] hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <input
                value={d.title}
                onChange={(e) =>
                  updateDecision(i, "title", e.target.value)
                }
                placeholder="Title"
                className={fieldInput}
              />
              <textarea
                value={d.body}
                onChange={(e) =>
                  updateDecision(i, "body", e.target.value)
                }
                placeholder="Body"
                rows={3}
                className={fieldInput}
              />
            </div>
          ))}
        </div>

        <Field label="Outcome">
          <textarea
            value={form.outcome ?? ""}
            onChange={(e) => set("outcome", e.target.value || undefined)}
            rows={3}
            className={fieldInput}
          />
        </Field>
        <Field label="Reflection">
          <textarea
            value={form.reflection ?? ""}
            onChange={(e) => set("reflection", e.target.value || undefined)}
            rows={3}
            className={fieldInput}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Live link label (optional)">
            <input
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              className={fieldInput}
              placeholder="brand.com"
            />
          </Field>
          <Field label="Live link URL (optional)">
            <input
              value={linkHref}
              onChange={(e) => setLinkHref(e.target.value)}
              className={fieldInput}
              placeholder="https://…"
            />
          </Field>
        </div>
      </div>

      {error && (
        <p className="font-mono text-red-700 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-[color:var(--rule)] flex-wrap">
        <PublishToggle
          published={form.published !== false}
          onChange={(v) => set("published", v)}
        />
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
        {savedAt && (
          <span className="font-mono text-[color:var(--meta)] text-[11px]">
            ✓ Saved at {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </form>
  );
}

/* (ImageUploadBox + GalleryUploadGrid now imported from
   @/app/admin/_components/image-uploads — they use Vercel Blob's
   direct client upload to bypass the 4.5 MB serverless body limit.) */

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

/** Pill toggle for the published / draft state. Drafts are hidden from
 *  public pages but stay in the admin list. */
function PublishToggle({
  published,
  onChange,
}: {
  published: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2 mr-auto">
      <button
        type="button"
        onClick={() => onChange(true)}
        aria-pressed={published}
        className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border transition-colors"
        style={{
          background: published ? "var(--ink)" : "transparent",
          color: published ? "var(--paper)" : "var(--ink-soft)",
          borderColor: published ? "var(--ink)" : "var(--rule)",
        }}
      >
        Published
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        aria-pressed={!published}
        className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border transition-colors"
        style={{
          background: !published ? "var(--ink)" : "transparent",
          color: !published ? "var(--paper)" : "var(--ink-soft)",
          borderColor: !published ? "var(--ink)" : "var(--rule)",
        }}
      >
        Draft
      </button>
    </div>
  );
}
