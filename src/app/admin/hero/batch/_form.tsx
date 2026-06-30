"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  file: File;
  /** ms-precise key, stable across re-renders. */
  id: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  uploadedUrl?: string;
  cardId?: number;
};

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
          reject(new Error("Invalid JSON"));
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

function filenameToTitle(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function BatchUploadForm() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  function addFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const next: Row[] = list.map((f) => ({
      file: f,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: "pending",
      progress: 0,
    }));
    setRows((prev) => [...prev, ...next]);
    setDone(false);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function uploadAll() {
    if (rows.length === 0 || running) return;
    setRunning(true);
    setDone(false);

    // Parallel upload, sequential DB insert (so positions are stable).
    await Promise.all(
      rows
        .filter((r) => r.status !== "done")
        .map(async (r) => {
          setRows((prev) =>
            prev.map((x) =>
              x.id === r.id ? { ...x, status: "uploading", progress: 0 } : x,
            ),
          );
          try {
            const url = await uploadToBlob(r.file, (p) => {
              setRows((prev) =>
                prev.map((x) =>
                  x.id === r.id ? { ...x, progress: Math.round(p) } : x,
                ),
              );
            });
            setRows((prev) =>
              prev.map((x) =>
                x.id === r.id ? { ...x, uploadedUrl: url, progress: 100 } : x,
              ),
            );
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Upload failed";
            setRows((prev) =>
              prev.map((x) =>
                x.id === r.id ? { ...x, status: "error", error: msg } : x,
              ),
            );
          }
        }),
    );

    // Insert hero_cards sequentially so the position column reflects the
    // order the user dropped them in.
    const snapshot = rows;
    for (const r of snapshot) {
      if (r.status === "error") continue;
      const current = rows.find((x) => x.id === r.id);
      const url = current?.uploadedUrl;
      if (!url) continue;
      try {
        const res = await fetch("/api/admin/hero", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: url,
            title: filenameToTitle(r.file.name),
            href: "#",
          }),
        });
        const j = (await res.json()) as { id?: number; error?: string };
        if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
        setRows((prev) =>
          prev.map((x) =>
            x.id === r.id ? { ...x, status: "done", cardId: j.id } : x,
          ),
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Create failed";
        setRows((prev) =>
          prev.map((x) =>
            x.id === r.id ? { ...x, status: "error", error: msg } : x,
          ),
        );
      }
    }

    setRunning(false);
    setDone(true);
    router.refresh();
  }

  const total = rows.length;
  const successCount = rows.filter((r) => r.status === "done").length;
  const errorCount = rows.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <label
        className="relative block cursor-pointer rounded-sm border-2 border-dashed border-[color:var(--rule)] hover:border-[color:var(--ink-soft)] p-10 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="font-mono text-[color:var(--ink-soft)]">
          Drop images here or click to select
        </p>
        <p className="font-mono text-[10px] text-[color:var(--meta)] mt-2">
          PNG/JPG · ≤ 4 MB each · pick any number
        </p>
      </label>

      {/* Queue */}
      {rows.length > 0 && (
        <ul className="border-t border-[color:var(--rule)]">
          {rows.map((r) => (
            <li
              key={r.id}
              className="border-b border-[color:var(--rule)] py-3 flex items-center gap-4"
            >
              {/* Thumb */}
              <div
                className="relative shrink-0 rounded-sm overflow-hidden bg-[color:var(--paper-soft)]"
                style={{ width: 72, height: 54 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    r.uploadedUrl ?? URL.createObjectURL(r.file)
                  }
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <p className="truncate font-mono text-sm">{r.file.name}</p>
                <p className="font-mono text-[10px] text-[color:var(--meta)] mt-0.5">
                  {r.status === "pending" && "Pending"}
                  {r.status === "uploading" && `Uploading ${r.progress}%…`}
                  {r.status === "done" && "Done · card created"}
                  {r.status === "error" && (
                    <span className="text-red-700">Error · {r.error}</span>
                  )}
                </p>
                {r.status === "uploading" && (
                  <div className="mt-1 h-0.5 bg-[color:var(--rule)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[color:var(--ink)] transition-all"
                      style={{ width: `${r.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              {!running && r.status !== "done" && (
                <button
                  type="button"
                  onClick={() => removeRow(r.id)}
                  className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border border-[color:var(--rule)] hover:border-red-700 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap pt-2">
        <button
          type="button"
          onClick={uploadAll}
          disabled={total === 0 || running}
          className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px] disabled:opacity-50"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          {running
            ? "Uploading…"
            : done
              ? "Upload more"
              : `Upload ${total || ""} & create cards`.trim()}
        </button>
        {done && (
          <a
            href="/admin/hero"
            className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px] border border-[color:var(--rule)] hover:border-[color:var(--ink)]"
          >
            Back to deck — edit titles + links
          </a>
        )}
        {total > 0 && !running && (
          <span className="font-mono text-[10px] text-[color:var(--meta)] ml-auto">
            {successCount} done · {errorCount} errors · {total} total
          </span>
        )}
      </div>
    </div>
  );
}
