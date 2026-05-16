"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ReorderControls({
  slug,
  kind,
  isFirst,
  isLast,
}: {
  slug: string;
  kind: "project" | "case-study";
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyDir, setBusyDir] = useState<-1 | 1 | null>(null);

  const endpoint =
    kind === "project"
      ? "/api/admin/projects/reorder"
      : "/api/admin/case-studies/reorder";

  async function move(dir: -1 | 1) {
    setBusyDir(dir);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, dir }),
      });
      if (!res.ok) {
        console.error("Reorder failed", await res.text());
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setBusyDir(null);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => move(-1)}
        disabled={isFirst || pending}
        aria-label="Move up"
        className="font-mono text-[12px] w-7 h-7 rounded-full border border-[color:var(--rule)] disabled:opacity-30 hover:border-[color:var(--ink)] transition-colors leading-none"
      >
        {busyDir === -1 ? "…" : "↑"}
      </button>
      <button
        type="button"
        onClick={() => move(+1)}
        disabled={isLast || pending}
        aria-label="Move down"
        className="font-mono text-[12px] w-7 h-7 rounded-full border border-[color:var(--rule)] disabled:opacity-30 hover:border-[color:var(--ink)] transition-colors leading-none"
      >
        {busyDir === +1 ? "…" : "↓"}
      </button>
    </div>
  );
}
