/**
 * Put dog-park's fundraiser film back at the top of its page.
 *
 * The legacy project carried it as a 'video' entry in its visuals array;
 * the block migration only understood pictures, so the film was dropped
 * and never noticed. The migration handles video now, but that does not
 * help a project already migrated — this restores the one row lost.
 *
 * Idempotent: it does nothing if the project already has an embed.
 *
 *   npx tsx --env-file=.env.local src/scripts/restore-dog-park-video.ts
 *   npx tsx --env-file=.env.local src/scripts/restore-dog-park-video.ts --commit
 */
import { sql } from "@vercel/postgres";

const COMMIT = process.argv.includes("--commit");
const SLUG = "dog-park";

async function main() {
  const { rows: projects } = await sql<{ id: number }>`
    SELECT id FROM portfolio_projects WHERE slug = ${SLUG}
  `;
  if (projects.length === 0) return console.log(`No project '${SLUG}'.`);
  const projectId = projects[0].id;

  const { rows: existing } = await sql<{ id: number }>`
    SELECT id FROM portfolio_blocks WHERE project_id = ${projectId} AND kind = 'embed'
  `;
  if (existing.length > 0) return console.log("Already has an embed block — nothing to do.");

  /* The link is still on the legacy row, so it is read rather than
     hard-coded here. */
  const { rows: legacy } = await sql<{ visuals: string }>`
    SELECT visuals::text AS visuals FROM projects WHERE slug = ${SLUG}
  `;
  if (legacy.length === 0) return console.log("No legacy row to read the link from.");
  const visuals = JSON.parse(legacy[0].visuals) as { kind?: string; url?: string; caption?: string }[];
  const video = visuals.find((v) => v.kind === "video" && v.url);
  if (!video?.url) return console.log("No video entry on the legacy row.");

  console.log(`${COMMIT ? "Inserting" : "Would insert"} ${video.url} at the top of ${SLUG}.`);
  if (!COMMIT) return console.log("\nDry run. Re-run with --commit to apply.");

  /* It opened the legacy page, so it opens this one: everything already
     there shifts down by one. */
  await sql`
    UPDATE portfolio_blocks SET order_index = order_index + 1 WHERE project_id = ${projectId}
  `;
  await sql`
    INSERT INTO portfolio_blocks (project_id, kind, embed_url, heading, order_index)
    VALUES (${projectId}, 'embed', ${video.url}, ${video.caption || null}, 0)
  `;
  console.log("Done.");
}

main();
