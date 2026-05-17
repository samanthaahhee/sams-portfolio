"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ExperienceEntry } from "@/lib/about";
import { ImageUploadBox } from "@/app/admin/_components/image-uploads";

type Entry = ExperienceEntry & { slug: string };

type Props = {
  entry?: Entry;
  mode: "create" | "edit";
};

const EMPTY: Entry = {
  slug: "",
  title: "",
  shortTitle: "",
  company: "",
  yearPill: "",
  dates: "",
  location: "",
  context: "",
  featured: false,
  description: "",
  bullets: [],
  image: { src: "", alt: "" },
};

export function ExperienceForm({ entry, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [form, setForm] = useState<Entry>(entry ?? EMPTY);

  const set = <K extends keyof Entry>(k: K, v: Entry[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const addBullet = () => set("bullets", [...form.bullets, ""]);
  const updateBullet = (i: number, v: string) =>
    set(
      "bullets",
      form.bullets.map((b, j) => (j === i ? v : b)),
    );
  const removeBullet = (i: number) =>
    set(
      "bullets",
      form.bullets.filter((_, j) => j !== i),
    );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/experience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        _mode: mode,
        _originalSlug: entry?.slug,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(json.error ?? "Save failed");
      return;
    }
    setSavedAt(new Date());
    if (mode === "create") {
      router.push(`/admin/experience/${form.slug}`);
    } else {
      router.refresh();
    }
  }

  async function remove() {
    if (!entry) return;
    if (
      !confirm(
        `Delete ${entry.title} at ${entry.company}? This cannot be undone.`,
      )
    )
      return;
    const res = await fetch(
      `/api/admin/experience?slug=${encodeURIComponent(entry.slug)}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    router.push("/admin/experience");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Sticky save bar */}
      <div className="sticky top-14 z-10 -mx-6 px-6 py-3 bg-[color:var(--paper)] border-b border-[color:var(--rule)] flex items-center justify-end gap-3 flex-wrap">
        <label className="flex items-center gap-2 mr-auto font-mono text-[color:var(--meta)] text-[10px] uppercase tracking-[0.14em] cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured ?? false}
            onChange={(e) => set("featured", e.target.checked)}
            className="accent-[color:var(--ink)]"
          />
          Featured / current role
        </label>
        {savedAt && (
          <span className="font-mono text-[color:var(--meta)] text-[11px]">
            ✓ Saved at{" "}
            {savedAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
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

      <Field label="Slug (URL-safe key)">
        <input
          required
          value={form.slug}
          onChange={(e) =>
            set(
              "slug",
              e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            )
          }
          className={fieldInput}
          placeholder="e.g. ten-8-city-full-stack-designer"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Title (full job title)">
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={fieldInput}
            placeholder="Full-Stack Designer"
          />
        </Field>
        <Field label="Short title (shown on the timeline)">
          <input
            required
            value={form.shortTitle}
            onChange={(e) => set("shortTitle", e.target.value)}
            className={fieldInput}
            placeholder="Full-Stack Designer"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Company">
          <input
            required
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            className={fieldInput}
            placeholder="Ten 8 City"
          />
        </Field>
        <Field label="Year pill (≤ 10 chars)">
          <input
            required
            value={form.yearPill}
            onChange={(e) => set("yearPill", e.target.value)}
            className={fieldInput}
            placeholder="2025—Now"
          />
        </Field>
      </div>

      <Field label="Dates (long form)">
        <input
          required
          value={form.dates}
          onChange={(e) => set("dates", e.target.value)}
          className={fieldInput}
          placeholder="Sept 2025 — Present"
        />
      </Field>

      <Field label="Location / meta">
        <input
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          className={fieldInput}
          placeholder="Amsterdam · AI products & design"
        />
      </Field>

      <Field label="Context (one short line, optional)">
        <input
          value={form.context}
          onChange={(e) => set("context", e.target.value)}
          className={fieldInput}
          placeholder="Currently building HeyOtis"
        />
      </Field>

      <Field label="Description (paragraph)">
        <textarea
          required
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          className={fieldInput}
        />
      </Field>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[color:var(--meta)]">Bullets</p>
          <button
            type="button"
            onClick={addBullet}
            className="font-mono text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          >
            + Add bullet
          </button>
        </div>
        {form.bullets.length === 0 && (
          <p className="font-mono text-[color:var(--meta)] text-[11px] py-2">
            No bullets yet.
          </p>
        )}
        {form.bullets.map((b, i) => (
          <div
            key={i}
            className="border border-[color:var(--rule)] rounded-sm p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[color:var(--meta)] text-[11px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => removeBullet(i)}
                className="font-mono text-[color:var(--meta)] hover:text-red-700 text-[11px]"
              >
                Remove
              </button>
            </div>
            <textarea
              value={b}
              onChange={(e) => updateBullet(i, e.target.value)}
              rows={2}
              className={fieldInput}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[color:var(--meta)]">Image</p>
        <ImageUploadBox
          label="Role thumbnail (square)"
          helper="Square, 320 × 320 recommended. Shown on the /about timeline. Leave blank to fall back to the placeholder."
          aspect="1 / 1"
          value={form.image?.src ?? ""}
          onChange={(url) =>
            set("image", {
              src: url ?? "",
              alt: form.image?.alt ?? "",
            })
          }
          maxWidth={320}
        />
        <input
          type="text"
          value={form.image?.alt ?? ""}
          onChange={(e) =>
            set("image", { src: form.image?.src ?? "", alt: e.target.value })
          }
          placeholder="Alt text"
          className={fieldInput}
        />
      </div>

      {error && (
        <p className="font-mono text-red-700 bg-red-50 px-3 py-2 rounded">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-[color:var(--rule)] flex-wrap">
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

const fieldInput =
  "w-full px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] transition-colors";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[color:var(--meta)] block">{label}</span>
      {children}
    </label>
  );
}
