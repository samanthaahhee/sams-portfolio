"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PortfolioProject, PortfolioMedia, PortfolioThinkingSection, PortfolioBlock } from "@/lib/db-portfolio";
import { ImageUploadBox } from "@/app/admin/_components/image-uploads";
import { GridBuilder } from "./_grid-builder";
import { BlocksEditor } from "./_blocks-editor";

type Props = {
  project?: PortfolioProject;
  media?: PortfolioMedia[];
  thinkingSections?: PortfolioThinkingSection[];
  blocks?: PortfolioBlock[];
  mode: "create" | "edit";
};

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

function VisibleToggle({ visible, onChange }: { visible: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2 mr-auto">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={visible === v}
          className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full border transition-colors"
          style={{
            background: visible === v ? "var(--ink)" : "transparent",
            color: visible === v ? "var(--paper)" : "var(--ink-soft)",
            borderColor: visible === v ? "var(--ink)" : "var(--rule)",
          }}
        >
          {v ? "Visible" : "Hidden"}
        </button>
      ))}
    </div>
  );
}

export function WorkProjectForm({ project, media, thinkingSections, blocks, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const [form, setForm] = useState<Omit<PortfolioProject, "id" | "coverUrl" | "coverType"> & { id?: number }>(
    project ?? {
      slug: "",
      accentColor: null,
      overviewHeading: null,
      overviewBody: null,
      title: "",
      discipline: "",
      client: "",
      role: "",
      year: "",
      orderIndex: 0,
      visible: true,
      workGridTemplate: null,
      deliverables: [],
      creativeTeam: [],
    },
  );

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: project?.id, _mode: mode }),
    });
    setSaving(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Save failed");
      return;
    }
    const json = (await res.json()) as { id: number };
    setSavedAt(new Date());
    if (mode === "create") {
      router.push(`/admin/work/${json.id}`);
    } else {
      router.refresh();
    }
  }

  async function remove() {
    if (!project) return;
    if (!confirm(`Delete ${project.title}? This removes its images and thinking sections too. Cannot be undone.`)) return;
    const res = await fetch(`/api/admin/work?id=${project.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    router.push("/admin/work");
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <form onSubmit={submit} className="space-y-6">
        <div className="sticky top-14 z-10 -mx-6 px-6 py-3 bg-[color:var(--paper)] border-b border-[color:var(--rule)] flex items-center justify-end gap-3 flex-wrap">
          <VisibleToggle visible={form.visible} onChange={(v) => set("visible", v)} />
          {savedAt && (
            <span className="font-mono text-[color:var(--meta)] text-[11px]">
              ✓ Saved at {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

        <Field label="Slug (URL path — /work/…)">
          <input
            required
            value={form.slug}
            onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            className={fieldInput}
            placeholder="e.g. walkrr"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Title">
            <input required value={form.title} onChange={(e) => set("title", e.target.value)} className={fieldInput} />
          </Field>
          <Field label="Discipline">
            <input
              value={form.discipline}
              onChange={(e) => set("discipline", e.target.value)}
              className={fieldInput}
              placeholder="Brand Design"
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Client">
            <input value={form.client} onChange={(e) => set("client", e.target.value)} className={fieldInput} />
          </Field>
          <Field label="Role">
            <input value={form.role} onChange={(e) => set("role", e.target.value)} className={fieldInput} />
          </Field>
          <Field label="Year">
            <input value={form.year} onChange={(e) => set("year", e.target.value)} className={fieldInput} />
          </Field>
        </div>

        <Field label="Deliverables (comma-separated)">
          <input
            value={form.deliverables.join(", ")}
            onChange={(e) => set("deliverables", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            className={fieldInput}
            placeholder="Activation stands, Store front, Campaign Assets"
          />
        </Field>

        {/* One colour drives the wordmark, the headings and the meta rows on
            this project's page; body copy stays charcoal. */}
        <Field label="Accent colour (project page — wordmark, headers, meta)">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.accentColor || "#FF2E31"}
              onChange={(e) => set("accentColor", e.target.value)}
              className="h-10 w-14 rounded-sm border border-[color:var(--rule)] bg-transparent"
            />
            <input
              value={form.accentColor ?? ""}
              onChange={(e) => set("accentColor", e.target.value || null)}
              placeholder="#FF2E31 (blank = site red)"
              className={fieldInput}
            />
          </div>
        </Field>

        <Field label="Overview header">
          <input
            value={form.overviewHeading ?? ""}
            onChange={(e) => set("overviewHeading", e.target.value || null)}
            className={fieldInput}
            placeholder="Header"
          />
        </Field>

        <Field label="Overview copy">
          <textarea
            value={form.overviewBody ?? ""}
            onChange={(e) => set("overviewBody", e.target.value || null)}
            rows={5}
            className={fieldInput}
            placeholder="Leave a blank line between paragraphs"
          />
        </Field>

        <Field label="Creative team (comma-separated)">
          <input
            value={form.creativeTeam.join(", ")}
            onChange={(e) => set("creativeTeam", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            className={fieldInput}
            placeholder="Sam Ahhee, Creative Director"
          />
        </Field>

        {error && <p className="font-mono text-red-700 bg-red-50 px-3 py-2 rounded">{error}</p>}

        <div className="flex items-center gap-3 pt-4 border-t border-[color:var(--rule)] flex-wrap">
          <VisibleToggle visible={form.visible} onChange={(v) => set("visible", v)} />
          <button
            type="submit"
            disabled={saving}
            className="font-mono uppercase tracking-[0.14em] px-5 py-2.5 rounded-full text-[10px] disabled:opacity-50"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Create"}
          </button>
          {mode === "edit" && (
            <button type="button" onClick={remove} className="font-mono text-[color:var(--meta)] hover:text-red-700">
              Delete project
            </button>
          )}
        </div>
      </form>

      {mode === "create" || !project ? (
        <p className="font-mono text-[color:var(--meta)] text-[11px] pt-6 border-t border-[color:var(--rule)]">
          Save the project first to add work-grid images, build a custom bento layout, and write Thinking sections.
        </p>
      ) : (
        <>
          <BlocksEditor projectId={project.id} projectSlug={form.slug} initialBlocks={blocks ?? []} />
          <WorkMediaSection projectId={project.id} projectSlug={form.slug} initialMedia={media ?? []} initialTemplate={form.workGridTemplate} />
          <ThinkingSection projectId={project.id} projectSlug={form.slug} initialSections={thinkingSections ?? []} />
        </>
      )}
    </div>
  );
}

/* ── Work-grid media: upload + reorder + freeform grid builder ────── */

function readImageDims(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions"));
    };
    img.src = url;
  });
}

function uploadToBlob(file: File, onProgress?: (p: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file);
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) onProgress((e.loaded / e.total) * 100);
    });
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText) as { url?: string; error?: string };
          if (json.url) resolve(json.url);
          else reject(new Error(json.error ?? "No URL in response"));
        } catch {
          reject(new Error("Invalid JSON response from upload"));
        }
      } else {
        reject(new Error(`Upload failed (HTTP ${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(fd);
  });
}

function WorkMediaSection({
  projectId,
  projectSlug,
  initialMedia,
  initialTemplate,
}: {
  projectId: number;
  projectSlug: string;
  initialMedia: PortfolioMedia[];
  initialTemplate: string | null;
}) {
  const [items, setItems] = useState(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function uploadMany(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    setError(null);
    let done = 0;
    try {
      for (const file of list) {
        const [url, dims] = await Promise.all([
          uploadToBlob(file, (p) => setProgress(Math.round(((done + p / 100) / list.length) * 100))),
          readImageDims(file),
        ]);
        const res = await fetch("/api/admin/work/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            projectSlug,
            surface: "work_grid",
            type: "image",
            url,
            width: dims.width,
            height: dims.height,
            aspectRatio: `${dims.width}:${dims.height}`,
            orderIndex: items.length + done,
            gridColStart: null,
            gridColSpan: 1,
            gridRowStart: null,
            gridRowSpan: 1,
          }),
        });
        const json = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok) throw new Error(json.error ?? "Save failed");
        done += 1;
        setItems((prev) => [
          ...prev,
          {
            id: Date.now() + done, // placeholder id until router.refresh() syncs the real one
            projectId,
            surface: "work_grid",
            slotId: null,
            type: "image",
            url,
            width: dims.width,
            height: dims.height,
            aspectRatio: `${dims.width}:${dims.height}`,
            orderIndex: items.length + done,
            gridColStart: null,
            gridColSpan: 1,
            gridRowStart: null,
            gridRowSpan: 1,
          },
        ]);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function remove(id: number) {
    if (!confirm("Remove this image?")) return;
    setItems((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/admin/work/media?id=${id}&projectSlug=${encodeURIComponent(projectSlug)}`, { method: "DELETE" });
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    await fetch("/api/admin/work/media/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((m) => m.id), projectSlug }),
    });
  }

  return (
    <div className="space-y-6 pt-6 border-t border-[color:var(--rule)]">
      <div>
        <p className="font-mono text-[color:var(--meta)] mb-1">Work-grid images</p>
        <p className="font-mono text-[color:var(--meta)] text-[10px]">
          Shown on the deep-dive page&rsquo;s &ldquo;The Work&rdquo; tab. Reorder with ↑ ↓ — first three
          become the automatic trio unless you build a custom layout below.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((m, i) => (
          <div key={m.id} className="flex items-center gap-3 border border-[color:var(--rule)] rounded-sm p-3">
            <div className="relative rounded-sm overflow-hidden flex-shrink-0" style={{ width: 120, height: 75 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <p className="font-mono text-[10px] text-[color:var(--meta)] flex-1 truncate">
              {m.width}×{m.height}
            </p>
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="font-mono text-[12px] w-7 h-7 rounded-full border border-[color:var(--rule)] disabled:opacity-30 hover:border-[color:var(--ink)]"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, +1)}
              disabled={i === items.length - 1}
              className="font-mono text-[12px] w-7 h-7 rounded-full border border-[color:var(--rule)] disabled:opacity-30 hover:border-[color:var(--ink)]"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => remove(m.id)}
              className="font-mono text-[9px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-red-700 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

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
            e.target.value = "";
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 gap-1">
          <p className="font-mono text-[color:var(--ink-soft)]">
            {uploading ? `Uploading ${progress}%…` : "+ Add image(s)"}
          </p>
          {uploading && (
            <div className="w-3/4 h-1 bg-[color:var(--rule)] rounded-full overflow-hidden mt-1">
              <div className="h-full bg-[color:var(--ink)] transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </label>

      {error && <p className="text-xs text-red-700 font-mono bg-red-50 px-2 py-1 rounded">{error}</p>}

      {items.length > 0 && (
        <GridBuilder
          projectId={projectId}
          projectSlug={projectSlug}
          media={items}
          initialTemplate={initialTemplate}
        />
      )}
    </div>
  );
}

/* ── Thinking sections ─────────────────────────────────────────────── */

function ThinkingSection({
  projectId,
  projectSlug,
  initialSections,
}: {
  projectId: number;
  projectSlug: string;
  initialSections: PortfolioThinkingSection[];
}) {
  const [sections, setSections] = useState(initialSections);

  function addLocal() {
    setSections((prev) => [
      ...prev,
      { id: -(Date.now()), projectId, title: "", body: "", imageUrl: null, orderIndex: prev.length },
    ]);
  }

  async function save(s: PortfolioThinkingSection) {
    const res = await fetch("/api/admin/work/thinking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...s, id: s.id > 0 ? s.id : undefined, projectSlug }),
    });
    const json = (await res.json()) as { ok?: boolean };
    if (json.ok) {
      // Nothing to sync locally — id stays temporary until next page load,
      // which is fine since the row is already correctly persisted.
    }
  }

  async function remove(id: number) {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (id > 0) {
      await fetch(`/api/admin/work/thinking?id=${id}&projectSlug=${encodeURIComponent(projectSlug)}`, {
        method: "DELETE",
      });
    }
  }

  function update(id: number, patch: Partial<PortfolioThinkingSection>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    setSections(next);
    const ids = next.map((s) => s.id).filter((id) => id > 0);
    if (ids.length) {
      await fetch("/api/admin/work/thinking/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, projectSlug }),
      });
    }
  }

  return (
    <div className="space-y-6 pt-6 border-t border-[color:var(--rule)]">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[color:var(--meta)] mb-1">Thinking sections</p>
          <p className="font-mono text-[color:var(--meta)] text-[10px]">
            Header + body copy for &ldquo;The Thinking&rdquo; tab, each with an optional image.
            Saved per-section — no separate submit needed.
          </p>
        </div>
        <button type="button" onClick={addLocal} className="font-mono text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]">
          + Add section
        </button>
      </div>

      {sections.map((s, i) => (
        <div key={s.id} className="border border-[color:var(--rule)] rounded-sm p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[color:var(--meta)]">
              Section {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="font-mono text-[12px] w-7 h-7 rounded-full border border-[color:var(--rule)] disabled:opacity-30 hover:border-[color:var(--ink)]"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, +1)}
                disabled={i === sections.length - 1}
                className="font-mono text-[12px] w-7 h-7 rounded-full border border-[color:var(--rule)] disabled:opacity-30 hover:border-[color:var(--ink)]"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(s.id)}
                className="font-mono text-[9px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-red-700 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
          <input
            value={s.title}
            onChange={(e) => update(s.id, { title: e.target.value })}
            onBlur={() => save(sections.find((x) => x.id === s.id)!)}
            placeholder="Title — e.g. Context"
            className={fieldInput}
          />
          <textarea
            value={s.body}
            onChange={(e) => update(s.id, { body: e.target.value })}
            onBlur={() => save(sections.find((x) => x.id === s.id)!)}
            placeholder="Body copy"
            rows={4}
            className={fieldInput}
          />
          <ImageUploadBox
            label="Supporting image (optional)"
            aspect="16 / 10"
            value={s.imageUrl ?? ""}
            onChange={(url) => {
              update(s.id, { imageUrl: url });
              save({ ...s, imageUrl: url });
            }}
            maxWidth={320}
          />
        </div>
      ))}
    </div>
  );
}
