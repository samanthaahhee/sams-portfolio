"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AboutSection } from "@/lib/db-portfolio";

const fieldInput =
  "w-full px-3 py-2 border border-[color:var(--rule)] bg-transparent rounded-sm focus:outline-none focus:border-[color:var(--ink)] transition-colors";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[color:var(--meta)] block">{label}</span>
      {hint && <span className="font-mono text-[10px] text-[color:var(--meta)] block">{hint}</span>}
      {children}
    </label>
  );
}

/** The homepage about panel: its copy, its two rails, and where it sits
 *  in the work grid.
 *
 *  The comma-separated rails keep their RAW text while you type and are
 *  only split on save — parsing per keystroke makes a comma impossible
 *  to type, since the empty entry it briefly creates gets filtered out
 *  and takes the comma with it. */
export function AboutForm({ initial, totalRows }: { initial: AboutSection; totalRows: number }) {
  const router = useRouter();
  const [intro, setIntro] = useState(initial.intro);
  const [fieldsRaw, setFieldsRaw] = useState(initial.fields.join(", "));
  const [servicesRaw, setServicesRaw] = useState(initial.services.join(", "));
  const [email, setEmail] = useState(initial.email);
  const [afterRows, setAfterRows] = useState(initial.afterRows);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const split = (s: string) => s.split(",").map((v) => v.trim()).filter(Boolean);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/homepage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        intro,
        fields: split(fieldsRaw),
        services: split(servicesRaw),
        email,
        afterRows,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Save failed");
      return;
    }
    setSavedAt(new Date());
    router.refresh();
  }

  /* 0 = above every project, totalRows = below them all. */
  const positions = Array.from({ length: totalRows + 1 }, (_, i) => i);

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-end gap-3">
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
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <Field
        label="Position in the work grid"
        hint={`The grid is two projects per row — ${totalRows} rows at the moment.`}
      >
        <select
          value={afterRows}
          onChange={(e) => setAfterRows(Number(e.target.value))}
          className={fieldInput}
        >
          {positions.map((n) => (
            <option key={n} value={n}>
              {n === 0
                ? "Above all projects"
                : n >= totalRows
                  ? "Below all projects"
                  : `After row ${n} (${n * 2} projects)`}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Intro">
        <textarea rows={4} value={intro} onChange={(e) => setIntro(e.target.value)} className={fieldInput} />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Fields (comma-separated)">
          <input value={fieldsRaw} onChange={(e) => setFieldsRaw(e.target.value)} className={fieldInput} />
        </Field>
        <Field label="Services (comma-separated)">
          <input value={servicesRaw} onChange={(e) => setServicesRaw(e.target.value)} className={fieldInput} />
        </Field>
      </div>

      <Field label="Contact email — shown in the panel, copies when clicked">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldInput}
        />
      </Field>

      {error && <p className="font-mono text-red-700 bg-red-50 px-3 py-2 rounded">{error}</p>}

      <p className="font-mono text-[10px] text-[color:var(--meta)]">
        Leaving a field empty restores its built-in default rather than
        showing nothing.
      </p>
    </form>
  );
}
