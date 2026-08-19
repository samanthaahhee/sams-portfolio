/* Migrate the legacy case studies and projects into the new project-page
 * block stream, keeping every image.
 *
 * Run:  npx tsx --env-file=.env.local src/scripts/migrate-legacy-to-blocks.ts [--commit]
 *
 * Without --commit it only prints what it would do. Re-running is safe:
 * a project that already has blocks is skipped, so this never doubles up.
 *
 * Mapping, by how many images a legacy visual holds:
 *   1  -> native        (original size, uncropped; animated GIFs play)
 *   2  -> split         (landscape 50/50), or compare for a before/after
 *                       pair, which is a slider rather than two images
 *   3  -> portrait_trio (three across)
 *   4+ -> one native block each, so nothing is hidden
 * 'video' entries become embed blocks, holding the YouTube link.
 * Captions are dropped, as agreed.
 */
import { sql } from "@vercel/postgres";

type Visual = Record<string, unknown>;

const COMMIT = process.argv.includes("--commit");

function urlsOf(e: Visual): string[] {
  if (typeof e.url === "string" && e.url) return [e.url];
  if (Array.isArray(e.images)) return e.images.filter((u): u is string => typeof u === "string" && !!u);
  const pair = [e.before, e.after].filter((u): u is string => typeof u === "string" && !!u);
  return pair;
}

type PlannedBlock =
  | { layout: string; urls: string[] }
  | { text: { heading: string; body: string } }
  | { embed: string };

function blocksFromVisuals(visuals: Visual[]): PlannedBlock[] {
  const out: PlannedBlock[] = [];
  for (const e of visuals) {
    /* A film lives on YouTube, so it crosses as a link rather than a
       file. Skipping these is what lost dog-park's fundraiser video. */
    if (e.kind === "video") {
      if (typeof e.url === "string" && e.url) out.push({ embed: e.url });
      continue;
    }
    const urls = urlsOf(e);
    if (urls.length === 0) continue;
    /* A legacy 'compare' is a before/after slider, not two images sitting
       side by side — it has its own layout, so keep it. */
    if (e.kind === "compare" && urls.length === 2) out.push({ layout: "compare", urls });
    else if (urls.length === 1) out.push({ layout: "native", urls });
    else if (urls.length === 2) out.push({ layout: "split", urls });
    else if (urls.length === 3) out.push({ layout: "portrait_trio", urls });
    else for (const u of urls) out.push({ layout: "native", urls: [u] });
  }
  return out;
}

/** Spread the copy through the images rather than stacking all the text
 *  at the top — a wall of panels followed by a wall of pictures reads
 *  badly, and reordering 37 blocks by hand afterwards is worse. */
function interleave(images: PlannedBlock[], texts: PlannedBlock[]): PlannedBlock[] {
  if (texts.length === 0) return images;
  if (images.length === 0) return texts;
  const out: PlannedBlock[] = [];
  const every = Math.max(1, Math.round(images.length / (texts.length + 1)));
  let t = 0;
  images.forEach((img, i) => {
    if (i > 0 && i % every === 0 && t < texts.length) out.push(texts[t++]);
    out.push(img);
  });
  while (t < texts.length) out.push(texts[t++]);
  return out;
}

async function insertBlocks(projectId: number, planned: PlannedBlock[]) {
  let order = 0;
  for (const b of planned) {
    if ("embed" in b) {
      await sql`
        INSERT INTO portfolio_blocks (project_id, kind, embed_url, order_index)
        VALUES (${projectId}, 'embed', ${b.embed}, ${order})
      `;
    } else if ("text" in b) {
      await sql`
        INSERT INTO portfolio_blocks (project_id, kind, heading, body, order_index)
        VALUES (${projectId}, 'text', ${b.text.heading}, ${b.text.body}, ${order})
      `;
    } else {
      const { rows } = await sql<{ id: number }>`
        INSERT INTO portfolio_blocks (project_id, kind, layout, order_index)
        VALUES (${projectId}, 'images', ${b.layout}, ${order})
        RETURNING id
      `;
      const blockId = rows[0].id;
      for (let slot = 0; slot < b.urls.length; slot++) {
        const url = b.urls[slot];
        const type = /\.gif(\?|$)/i.test(url) ? "gif" : "image";
        /* A native block has one slot, so extra urls would be frames —
           but the 4+ case already split them into separate blocks, so
           slot === frame 0 here every time. */
        await sql`
          INSERT INTO portfolio_media
            (project_id, surface, type, url, order_index, block_id, block_position, frame_index)
          VALUES (${projectId}, 'project_page', ${type}, ${url}, ${slot}, ${blockId}, ${slot}, 0)
        `;
      }
    }
    order++;
  }
}

async function main() {
  const summary: string[] = [];

  /* ── The three case studies ───────────────────────────────────────
     Their portfolio_projects rows already exist, matched on slug. */
  const caseStudies = await sql<{ slug: string; visuals: Visual[] }>`
    SELECT slug, visuals FROM case_studies
  `;
  for (const cs of caseStudies.rows) {
    const proj = await sql<{ id: number }>`SELECT id FROM portfolio_projects WHERE slug = ${cs.slug}`;
    if (proj.rows.length === 0) {
      summary.push(`SKIP ${cs.slug}: no portfolio_projects row`);
      continue;
    }
    const projectId = proj.rows[0].id;
    const existing = await sql<{ n: number }>`SELECT count(*)::int n FROM portfolio_blocks WHERE project_id = ${projectId}`;
    if (existing.rows[0].n > 0) {
      summary.push(`SKIP ${cs.slug}: already has ${existing.rows[0].n} blocks`);
      continue;
    }
    const images = blocksFromVisuals(cs.visuals ?? []);
    const think = await sql<{ title: string; body: string }>`
      SELECT title, body FROM portfolio_thinking_sections
      WHERE project_id = ${projectId} ORDER BY order_index ASC, id ASC
    `;
    const texts: PlannedBlock[] = think.rows
      .filter((t) => (t.body ?? "").trim().length > 0)
      .map((t) => ({ text: { heading: t.title ?? "", body: t.body } }));
    const planned = interleave(images, texts);
    summary.push(`${cs.slug}: ${images.length} image blocks + ${texts.length} text blocks`);
    if (COMMIT) await insertBlocks(projectId, planned);
  }

  /* ── The ten legacy projects ──────────────────────────────────────
     These have no portfolio_projects row, so create one first. */
  const projects = await sql<{
    slug: string; brand: string | null; title: string | null; year: string | null;
    client: string | null; role: string | null; cover: string | null;
    summary: string | null; context: string | null; problem: string | null;
    approach: string | null; outcome: string | null; reflection: string | null;
    visuals: Visual[]; position: number | null;
  }>`SELECT * FROM projects ORDER BY position ASC NULLS LAST, id ASC`;

  let order = 100;
  for (const p of projects.rows) {
    let proj = await sql<{ id: number }>`SELECT id FROM portfolio_projects WHERE slug = ${p.slug}`;
    if (proj.rows.length === 0) {
      if (!COMMIT) {
        summary.push(`${p.slug}: would create project row + ${blocksFromVisuals(p.visuals ?? []).length} blocks`);
        continue;
      }
      proj = await sql<{ id: number }>`
        INSERT INTO portfolio_projects
          (slug, title, discipline, client, role, year, order_index, visible,
           deliverables, creative_team)
        VALUES (${p.slug}, ${p.title?.trim() || p.brand || p.slug}, '',
                ${p.client || p.brand || ""}, ${p.role || ""}, ${p.year || ""},
                ${order}, false, '[]'::jsonb, '[]'::jsonb)
        RETURNING id
      `;
      order++;
    }
    const projectId = proj.rows[0].id;
    const existing = await sql<{ n: number }>`SELECT count(*)::int n FROM portfolio_blocks WHERE project_id = ${projectId}`;
    if (existing.rows[0].n > 0) {
      summary.push(`SKIP ${p.slug}: already has ${existing.rows[0].n} blocks`);
      continue;
    }

    const images = blocksFromVisuals(p.visuals ?? []);
    const texts: PlannedBlock[] = ([
      ["Context", p.context],
      ["Problem", p.problem],
      ["Approach", p.approach],
      ["Outcome", p.outcome],
      ["Reflection", p.reflection],
    ] as const)
      .filter(([, body]) => (body ?? "").trim().length > 0)
      .map(([heading, body]) => ({ text: { heading, body: body as string } }));

    summary.push(`${p.slug}: ${images.length} image blocks + ${texts.length} text blocks`);
    if (COMMIT) {
      if ((p.summary ?? "").trim()) {
        await sql`UPDATE portfolio_projects SET overview_body = ${p.summary} WHERE id = ${projectId}`;
      }
      /* The new page takes its hero from a 'carousel' media row. */
      if (p.cover) {
        const has = await sql<{ n: number }>`
          SELECT count(*)::int n FROM portfolio_media WHERE project_id = ${projectId} AND surface = 'carousel'`;
        if (has.rows[0].n === 0) {
          await sql`
            INSERT INTO portfolio_media (project_id, surface, type, url, order_index)
            VALUES (${projectId}, 'carousel', 'image', ${p.cover}, 0)
          `;
        }
      }
      await insertBlocks(projectId, interleave(images, texts));
    }
  }

  console.log(COMMIT ? "── MIGRATED ──" : "── DRY RUN (pass --commit to write) ──");
  for (const line of summary) console.log("  " + line);
}

main().catch((e) => {
  console.error("MIGRATION FAILED:", e.message);
  process.exit(1);
});
