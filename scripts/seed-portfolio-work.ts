/* Seed real content for the rebuild's /work/[slug] deep-dive into the
 * portfolio_* tables (projects, work_grid media, thinking sections).
 * Only projects with genuine sourced content go here — walkrr and
 * small-stitch stay as code-level placeholders in portfolio-placeholders.ts
 * since there's no real copy for them yet. Idempotent (delete + re-insert
 * per slug), so it's safe to re-run after editing the content below.
 * Run: npx tsx scripts/seed-portfolio-work.ts */
import { sql } from "@vercel/postgres";
import { config } from "dotenv";
import {
  PLACEHOLDER_PROJECTS,
  PLACEHOLDER_WORK_MEDIA,
  PLACEHOLDER_THINKING,
} from "../src/lib/portfolio-placeholders";

config({ path: ".env.local" });

const SLUGS = ["bos-ice-tea", "temper", "recharge"] as const;

async function seedProject(slug: string) {
  const p = PLACEHOLDER_PROJECTS.find((x) => x.slug === slug);
  if (!p) throw new Error(`No placeholder project for slug "${slug}"`);

  const { rows } = await sql`
    INSERT INTO portfolio_projects
      (slug, title, discipline, client, role, year, order_index, visible, deliverables, creative_team)
    VALUES
      (${p.slug}, ${p.title}, ${p.discipline}, ${p.client}, ${p.role}, ${p.year},
       ${p.orderIndex}, ${p.visible},
       ${JSON.stringify(p.deliverables)}::jsonb, ${JSON.stringify(p.creativeTeam)}::jsonb)
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title, discipline = EXCLUDED.discipline, client = EXCLUDED.client,
      role = EXCLUDED.role, year = EXCLUDED.year, order_index = EXCLUDED.order_index,
      visible = EXCLUDED.visible, deliverables = EXCLUDED.deliverables,
      creative_team = EXCLUDED.creative_team, updated_at = NOW()
    RETURNING id
  `;
  const projectId = rows[0].id as number;

  const media = PLACEHOLDER_WORK_MEDIA[slug] ?? [];
  await sql`DELETE FROM portfolio_media WHERE project_id = ${projectId} AND surface = 'work_grid'`;
  for (const m of media) {
    await sql`
      INSERT INTO portfolio_media
        (project_id, surface, slot_id, type, url, width, height, aspect_ratio, order_index)
      VALUES
        (${projectId}, 'work_grid', NULL, ${m.type}, ${m.url}, ${m.width}, ${m.height}, ${m.aspectRatio}, ${m.orderIndex})
    `;
  }

  const sections = PLACEHOLDER_THINKING[slug] ?? [];
  await sql`DELETE FROM portfolio_thinking_sections WHERE project_id = ${projectId}`;
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    await sql`
      INSERT INTO portfolio_thinking_sections
        (project_id, title, body, image_url, order_index)
      VALUES
        (${projectId}, ${s.title}, ${s.body}, ${s.image ?? null}, ${i})
    `;
  }

  console.log(`  ✓ ${slug} — project #${projectId}, ${media.length} work images, ${sections.length} thinking sections`);
}

async function main() {
  console.log(`Seeding ${SLUGS.length} projects into portfolio_* tables…`);
  for (const slug of SLUGS) await seedProject(slug);
  console.log("\n✓ Done.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
