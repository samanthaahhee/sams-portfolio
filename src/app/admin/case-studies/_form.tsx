"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CaseStudy } from "@/lib/case-studies";
import { NAMED_PALETTES, PALETTE_HEX, paletteFromBg } from "@/lib/palette";

const TAGS = ["Brand", "Product", "Campaign", "Packaging", "Print", "Email"];
const CATEGORIES = ["Brand", "Product", "Campaign", "Packaging", "Print", "Email"];

type Props = {
  study?: CaseStudy;
  mode: "create" | "edit";
};

const EMPTY: CaseStudy = {
  slug: "",
  no: "",
  title: "",
  client: "",
  year: "",
  role: [],
  primaryRole: "",
  category: "Brand",
  tags: ["Brand"],
  summary: "",
  palette: "butter-slate",
  cover: "",
  context: "",
  problem: "",
  approach: "",
  decisions: [],
  outcome: "",
  reflection: "",
};

export function CaseStudyForm({ study, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CaseStudy>(study ?? EMPTY);
  const [linkLabel, setLinkLabel] = useState(study?.link?.label ?? "");
  const [linkHref, setLinkHref] = useState(study?.link?.href ?? "");

  const set = <K extends keyof CaseStudy>(k: K, v: CaseStudy[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const toggleTag = (t: string) => {
    setForm((prev) => {
      const has = prev.tags.includes(t);
      const next = has ? prev.tags.filter((x) => x !== t) : [...prev.tags, t];
      return { ...prev, tags: next.length === 0 ? [t] : next };
    });
  };

  const addDecision = () =>
    setForm((prev) => ({
      ...prev,
      decisions: [...prev.decisions, { title: "", body: "" }],
    }));

  const updateDecision = (i: number, key: "title" | "body", v: string) =>
    setForm((prev) => ({
      ...prev,
      decisions: prev.decisions.map((d, j) =>
        j === i ? { ...d, [key]: v } : d,
      ),
    }));

  const removeDecision = (i: number) =>
    setForm((prev) => ({
      ...prev,
      decisions: prev.decisions.filter((_, j) => j !== i),
    }));

  async function uploadCover(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      setError("Cover upload failed");
      return;
    }
    const { url } = (await res.json()) as { url: string };
    set("cover", url);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const link = linkLabel && linkHref ? { label: linkLabel, href: linkHref } : undefined;
    const res = await fetch("/api/admin/case-studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        link,
        _mode: mode,
        _originalSlug: study?.slug,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Save failed");
      return;
    }
    router.push("/admin/case-studies");
    router.refresh();
  }

  async function remove() {
    if (!study) return;
    if (!confirm(`Delete case study "${study.title}"? This cannot be undone.`)) return;
    const res = await fetch(
      `/api/admin/case-studies?slug=${encodeURIComponent(study.slug)}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    router.push("/admin/case-studies");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Field label="No.">
          <input
            required
            value={form.no}
            onChange={(e) => set("no", e.target.value)}
            className={fieldInput}
            placeholder="01"
          />
        </Field>
        <Field label="Slug (URL)">
          <input
            required
            value={form.slug}
            onChange={(e) =>
              set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
            }
            className={`${fieldInput} col-span-2`}
            placeholder="recharge"
          />
        </Field>
        <Field label="Year">
          <input
            required
            value={form.year}
            onChange={(e) => set("year", e.target.value)}
            className={fieldInput}
            placeholder="2024"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Client">
          <input
            required
            value={form.client}
            onChange={(e) => set("client", e.target.value)}
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

      <Field label="Primary role">
        <input
          required
          value={form.primaryRole}
          onChange={(e) => set("primaryRole", e.target.value)}
          className={fieldInput}
          placeholder="Brand Designer"
        />
      </Field>

      <Field label="Roles (comma-separated)">
        <input
          value={form.role.join(", ")}
          onChange={(e) =>
            set("role", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
          }
          className={fieldInput}
          placeholder="Brand, Visual Design, Illustration Direction"
        />
      </Field>

      <Field label="Category">
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className={fieldInput}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>

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
      </Field>

      <Field label="Summary (one paragraph)">
        <textarea
          required
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
          rows={3}
          className={fieldInput}
        />
      </Field>

      <PaletteField
        palette={form.palette}
        customColors={form.customColors}
        onChange={(palette, customColors) =>
          setForm((prev) => ({ ...prev, palette, customColors }))
        }
      />

      <CoverField
        value={form.cover}
        onUpload={uploadCover}
        onClear={() => set("cover", "")}
      />

      <Field label="Context">
        <textarea
          value={form.context}
          onChange={(e) => set("context", e.target.value)}
          rows={4}
          className={fieldInput}
        />
      </Field>
      <Field label="Problem">
        <textarea
          value={form.problem}
          onChange={(e) => set("problem", e.target.value)}
          rows={4}
          className={fieldInput}
        />
      </Field>
      <Field label="Approach">
        <textarea
          value={form.approach}
          onChange={(e) => set("approach", e.target.value)}
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
        {form.decisions.map((d, i) => (
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
              onChange={(e) => updateDecision(i, "title", e.target.value)}
              placeholder="Title"
              className={fieldInput}
            />
            <textarea
              value={d.body}
              onChange={(e) => updateDecision(i, "body", e.target.value)}
              placeholder="Body"
              rows={3}
              className={fieldInput}
            />
          </div>
        ))}
      </div>

      <Field label="Outcome">
        <textarea
          value={form.outcome}
          onChange={(e) => set("outcome", e.target.value)}
          rows={3}
          className={fieldInput}
        />
      </Field>
      <Field label="Reflection">
        <textarea
          value={form.reflection}
          onChange={(e) => set("reflection", e.target.value)}
          rows={3}
          className={fieldInput}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="External link label (optional)">
          <input
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            className={fieldInput}
            placeholder="heyotis.app"
          />
        </Field>
        <Field label="External link URL (optional)">
          <input
            value={linkHref}
            onChange={(e) => setLinkHref(e.target.value)}
            className={fieldInput}
            placeholder="https://…"
          />
        </Field>
      </div>

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

function CoverField({
  value,
  onUpload,
  onClear,
}: {
  value: string;
  onUpload: (f: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-[color:var(--meta)]">Cover image</p>
      {!value ? (
        <label
          className="relative block cursor-pointer rounded-sm border-2 border-dashed border-[color:var(--rule)] hover:border-[color:var(--ink-soft)] transition-colors"
          style={{ aspectRatio: "4 / 5", maxWidth: 320 }}
        >
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-center p-4">
            <p className="font-mono text-[color:var(--ink-soft)]">Drop or click</p>
          </div>
        </label>
      ) : (
        <div
          className="relative rounded-sm overflow-hidden"
          style={{ aspectRatio: "4 / 5", maxWidth: 320 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <label className="cursor-pointer font-mono uppercase tracking-[0.12em] text-[9px] px-3 py-1.5 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)]">
              Replace
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                }}
              />
            </label>
            <button
              type="button"
              onClick={onClear}
              className="font-mono uppercase tracking-[0.12em] text-[9px] px-3 py-1.5 rounded-full bg-white text-[color:var(--ink)]"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PaletteField({
  palette,
  customColors,
  onChange,
}: {
  palette: CaseStudy["palette"];
  customColors: CaseStudy["customColors"];
  onChange: (
    palette: CaseStudy["palette"],
    customColors: CaseStudy["customColors"],
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
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm font-mono text-sm focus:outline-none focus:border-[color:var(--ink)]"
        />
      </div>
    </label>
  );
}

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
