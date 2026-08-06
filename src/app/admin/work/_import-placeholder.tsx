"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PortfolioProject } from "@/lib/db-portfolio";

/** Projects that only exist as code fixtures have no database row, so
 *  there is nothing for the editor to open. This creates the row from the
 *  fixture's own details, then jumps straight into it. */
export function ImportPlaceholderButton({ project }: { project: PortfolioProject }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _mode: "create",
        slug: project.slug,
        title: project.title,
        discipline: project.discipline,
        client: project.client,
        role: project.role,
        year: project.year,
        orderIndex: project.orderIndex,
        visible: true,
        workGridTemplate: null,
        deliverables: project.deliverables,
        creativeTeam: project.creativeTeam,
        accentColor: null,
        overviewHeading: null,
        overviewBody: null,
      }),
    });
    const json = (await res.json()) as { id?: number; error?: string };
    setBusy(false);
    if (!res.ok || !json.id) {
      setError(json.error ?? "Could not create");
      return;
    }
    router.push(`/admin/work/${json.id}`);
  }

  return (
    <span className="flex items-center gap-3 shrink-0">
      {error && <span className="font-mono text-[10px] text-red-700">{error}</span>}
      <button
        type="button"
        onClick={create}
        disabled={busy}
        className="font-mono uppercase tracking-[0.14em] text-[10px] px-3 py-1.5 rounded-full disabled:opacity-50"
        style={{ background: "var(--ink)", color: "var(--paper)" }}
      >
        {busy ? "Adding…" : "Add to database"}
      </button>
    </span>
  );
}
