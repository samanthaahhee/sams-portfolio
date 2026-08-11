"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PortfolioProject, PortfolioProjectInput, PortfolioBlock, LibraryImage } from "@/lib/db-portfolio";
import { BlocksEditor } from "./_blocks-editor";
import { PagePreview } from "./_page-preview";
import { CoverField } from "./_cover-field";

type Props = {
  project?: PortfolioProject;
  /** Every image already uploaded, offered as a pick-from library. */
  library?: LibraryImage[];
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

export function WorkProjectForm({ project, library, blocks, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const [form, setForm] = useState<PortfolioProjectInput>(
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

  /* The comma-separated fields keep their RAW text while you type and are
     only parsed on save. Splitting on every keystroke made them
     impossible to type in: the moment you pressed "," the value became
     ["Sam", ""], the empty entry was filtered out, and the comma you had
     just typed was rewritten away — likewise any trailing space. */
  const [deliverablesRaw, setDeliverablesRaw] = useState((project?.deliverables ?? []).join(", "));
  const [creativeTeamRaw, setCreativeTeamRaw] = useState((project?.creativeTeam ?? []).join(", "));

  const splitList = (s: string) =>
    s.split(",").map((v) => v.trim()).filter(Boolean);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      deliverables: splitList(deliverablesRaw),
      creativeTeam: splitList(creativeTeamRaw),
      id: project?.id,
      _mode: mode,
    };
    const res = await fetch("/api/admin/work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

        {project && (
          <>
            <CoverField
              projectId={project.id}
              projectSlug={form.slug}
              initialUrl={project.thumbUrl}
              initialFocalX={project.thumbFocalX}
              initialFocalY={project.thumbFocalY}
              library={library ?? []}
              endpoint="/api/admin/work/thumbnail"
              label="Homepage thumbnail"
              hint="Drag on the image to set its crop. Leave empty to use the hero image."
              croppable
              clearable
            />
            <CoverField
              projectId={project.id}
              projectSlug={form.slug}
              initialUrl={project.coverUrl}
              library={library ?? []}
              label="Hero image (top of the project page)"
            />
          </>
        )}

        <Field label="Slug (URL path — /work/…)">
          <input
            required
            value={form.slug}
            onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            className={fieldInput}
            placeholder="e.g. walkrr"
          />
        </Field>

        {/* Client + Title are the pair shown as "CLIENT | TITLE" on the
            project page and as the two pills on the homepage. */}
        <Field label="Title (shown after the client, e.g. Brand Expansion)">
          <input required value={form.title} onChange={(e) => set("title", e.target.value)} className={fieldInput} />
        </Field>

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
            value={deliverablesRaw}
            onChange={(e) => setDeliverablesRaw(e.target.value)}
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

        <Field label="Overview header (all caps on the page)">
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
            value={creativeTeamRaw}
            onChange={(e) => setCreativeTeamRaw(e.target.value)}
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
          Save the project first, then compose the page from image rows and paragraphs.
        </p>
      ) : (
        <>
          <BlocksEditor
            projectId={project.id}
            projectSlug={form.slug}
            initialBlocks={blocks ?? []}
            library={library ?? []}
          />
          <PagePreview slug={project.slug} />
        </>
      )}
    </div>
  );
}
