/* Convert every GIF on the site to MP4 and repoint the media rows at it.
 *
 * Run:  npx tsx --env-file=.env.local src/scripts/gifs-to-video.ts [--commit]
 *
 * GIF is a terrible container for motion — it cannot inter-frame compress,
 * so a few seconds of screen recording costs megabytes that H.264 does in
 * kilobytes. The site already renders an mp4 row as a silent looping
 * <video>, identical in every layout, so swapping the file is the whole
 * job.
 *
 * Needs ffmpeg on PATH, and BLOB_READ_WRITE_TOKEN to upload. Without
 * --commit it converts and reports, writing nothing and uploading
 * nothing.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sql } from "@vercel/postgres";

const COMMIT = process.argv.includes("--commit");
/* 28 is the sweet spot for UI recordings: no visible artefacting, and a
   fraction of the bytes. Lower is cleaner, higher is smaller. */
const CRF = Number(process.env.CRF ?? 28);

const mb = (n: number) => (n / 1024 / 1024).toFixed(2) + " MB";

async function main() {
  const { rows } = await sql<{ id: number; url: string; slug: string }>`
    SELECT m.id, m.url, p.slug
    FROM portfolio_media m
    JOIN portfolio_projects p ON p.id = m.project_id
    WHERE m.type = 'gif'
    ORDER BY p.slug, m.id
  `;
  if (rows.length === 0) {
    console.log("No GIFs left to convert.");
    return;
  }

  const dir = mkdtempSync(join(tmpdir(), "gif2mp4-"));
  let before = 0;
  let after = 0;
  const converted: { id: number; slug: string; file: string; name: string }[] = [];

  for (const row of rows) {
    const name = (row.url.split("/").pop() ?? "clip.gif").replace(/\.gif$/i, "");
    const gif = join(dir, `${row.id}.gif`);
    const mp4 = join(dir, `${row.id}.mp4`);
    const res = await fetch(row.url);
    if (!res.ok) {
      console.log(`  ${row.slug}: could not fetch ${name}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(gif, buf);

    execFileSync("ffmpeg", [
      "-y", "-i", gif,
      "-movflags", "+faststart",
      "-pix_fmt", "yuv420p",
      // H.264 needs even dimensions
      "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "-c:v", "libx264", "-crf", String(CRF), "-preset", "slow",
      "-an", mp4,
      "-loglevel", "error",
    ]);

    const gs = statSync(gif).size;
    const ms = statSync(mp4).size;
    before += gs;
    after += ms;
    converted.push({ id: row.id, slug: row.slug, file: mp4, name });
    console.log(
      `  ${row.slug.padEnd(14)} ${mb(gs).padStart(9)} -> ${mb(ms).padStart(9)}  ${Math.round(100 - (ms / gs) * 100)}% smaller`,
    );
  }

  console.log(`\nTOTAL  ${mb(before)} -> ${mb(after)}  (${Math.round(100 - (after / before) * 100)}% smaller)`);

  if (!COMMIT) {
    console.log("\nDry run — nothing uploaded or changed. Pass --commit to swap them in.");
    return;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("\nBLOB_READ_WRITE_TOKEN is not set, so the converted files cannot be uploaded.");
    process.exit(1);
  }

  const { put } = await import("@vercel/blob");
  for (const c of converted) {
    const blob = await put(`portfolio/${c.name}.mp4`, readFileSync(c.file), {
      access: "public",
      addRandomSuffix: true,
      contentType: "video/mp4",
    });
    await sql`UPDATE portfolio_media SET url = ${blob.url}, type = 'mp4' WHERE id = ${c.id}`;
    console.log(`  swapped ${c.slug} -> ${blob.url.split("/").pop()}`);
  }
  console.log("\nDone. The GIF files stay in storage; only the rows now point at the MP4s.");
}

main().catch((e) => {
  console.error("CONVERSION FAILED:", e.message);
  process.exit(1);
});
