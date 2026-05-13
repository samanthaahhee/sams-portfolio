/* Populate Postgres with the current static project + case study data.
 * Idempotent — uses ON CONFLICT (slug) DO UPDATE so re-running is safe.
 * Run: npm run db:seed */
import { sql } from "@vercel/postgres";
import { config } from "dotenv";
import { projects } from "../src/lib/projects";
import { caseStudies } from "../src/lib/case-studies";

config({ path: ".env.local" });

async function seedProjects() {
  console.log(`\nSeeding ${projects.length} projects…`);
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const primary = p.tags[0] ?? "";
    await sql`
      INSERT INTO projects
        (slug, brand, title, tag, tags, year, palette, cover, description, gallery, href, position)
      VALUES
        (${p.slug}, ${p.brand}, ${p.title}, ${primary},
         ${JSON.stringify(p.tags)}::jsonb, ${p.year ?? null},
         ${p.palette}, ${p.cover}, ${p.description},
         ${JSON.stringify(p.gallery)}::jsonb, ${p.href ?? null}, ${i})
      ON CONFLICT (slug) DO UPDATE SET
        brand       = EXCLUDED.brand,
        title       = EXCLUDED.title,
        tag         = EXCLUDED.tag,
        tags        = EXCLUDED.tags,
        year        = EXCLUDED.year,
        palette     = EXCLUDED.palette,
        cover       = EXCLUDED.cover,
        description = EXCLUDED.description,
        gallery     = EXCLUDED.gallery,
        href        = EXCLUDED.href,
        position    = EXCLUDED.position,
        updated_at  = NOW()
    `;
    console.log(`  ✓ ${p.slug}`);
  }
}

async function seedCaseStudies() {
  console.log(`\nSeeding ${caseStudies.length} case studies…`);
  for (let i = 0; i < caseStudies.length; i++) {
    const c = caseStudies[i];
    await sql`
      INSERT INTO case_studies
        (slug, no, title, client, year, role, primary_role, category, tags,
         summary, palette, cover, context, problem, approach, decisions,
         outcome, reflection, link_label, link_href, position)
      VALUES
        (${c.slug}, ${c.no}, ${c.title}, ${c.client}, ${c.year},
         ${JSON.stringify(c.role)}::jsonb, ${c.primaryRole}, ${c.category},
         ${JSON.stringify(c.tags)}::jsonb, ${c.summary}, ${c.palette}, ${c.cover},
         ${c.context}, ${c.problem}, ${c.approach},
         ${JSON.stringify(c.decisions)}::jsonb, ${c.outcome}, ${c.reflection},
         ${c.link?.label ?? null}, ${c.link?.href ?? null}, ${i})
      ON CONFLICT (slug) DO UPDATE SET
        no           = EXCLUDED.no,
        title        = EXCLUDED.title,
        client       = EXCLUDED.client,
        year         = EXCLUDED.year,
        role         = EXCLUDED.role,
        primary_role = EXCLUDED.primary_role,
        category     = EXCLUDED.category,
        tags         = EXCLUDED.tags,
        summary      = EXCLUDED.summary,
        palette      = EXCLUDED.palette,
        cover        = EXCLUDED.cover,
        context      = EXCLUDED.context,
        problem      = EXCLUDED.problem,
        approach     = EXCLUDED.approach,
        decisions    = EXCLUDED.decisions,
        outcome      = EXCLUDED.outcome,
        reflection   = EXCLUDED.reflection,
        link_label   = EXCLUDED.link_label,
        link_href    = EXCLUDED.link_href,
        position     = EXCLUDED.position,
        updated_at   = NOW()
    `;
    console.log(`  ✓ ${c.slug}`);
  }
}

async function main() {
  await seedProjects();
  await seedCaseStudies();
  console.log("\n✓ Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
