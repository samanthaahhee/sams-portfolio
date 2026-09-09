/**
 * Move the old Temper case-study copy onto the rebuilt project page.
 *
 * The case_studies row still holds everything Sam wrote for the previous
 * page — summary, context, problem, approach, three key decisions and an
 * outcome — while the rebuilt page carries a single overview paragraph
 * and ten image rows with nothing between them. The copy is read from
 * that row rather than pasted in here, so this stays honest to the
 * source and cannot drift from it.
 *
 * The summary becomes the overview panel; the rest become text blocks
 * dropped into the gaps the page already has at order_index 2, 5, 8 and
 * 11, with the outcome after the last row. Nothing about the image rows
 * moves.
 *
 * Idempotent: it clears its own text blocks (matched by heading) before
 * inserting, so re-running restates rather than duplicates.
 *
 *   npx tsx --env-file=.env.local src/scripts/restore-temper-case-study-copy.ts
 *   npx tsx --env-file=.env.local src/scripts/restore-temper-case-study-copy.ts --commit
 */
import { sql } from "@vercel/postgres";

const COMMIT = process.argv.includes("--commit");
const SLUG = "temper";

type Decision = { title: string; body: string };

/** Whitespace the old editor left behind — a doubled space, a trailing
 *  one, a newline dropped mid-sentence. Paragraph breaks are the only
 *  breaks that carry meaning here, so they are the only ones kept. */
function tidy(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

async function main() {
  const { rows: projects } = await sql<{ id: number; overview_body: string | null }>`
    SELECT id, overview_body FROM portfolio_projects WHERE slug = ${SLUG}
  `;
  if (projects.length === 0) return console.log(`No project '${SLUG}'.`);
  const { id: projectId, overview_body: currentOverview } = projects[0];

  const { rows: studies } = await sql<{
    summary: string | null; context: string | null; problem: string | null;
    approach: string | null; outcome: string | null; decisions: string | null;
  }>`
    SELECT summary, context, problem, approach, outcome, decisions::text AS decisions
    FROM case_studies WHERE slug = ${SLUG}
  `;
  if (studies.length === 0) return console.log(`No case_studies row for '${SLUG}'.`);
  const cs = studies[0];

  const decisions: Decision[] = cs.decisions ? JSON.parse(cs.decisions) : [];
  /* Each decision keeps its own sub-heading inline: TextPanel splits the
     body on blank lines, so one paragraph per decision reads as a list
     without needing a block each. */
  const decisionsBody = decisions
    .map((d) => `${tidy(d.title)} — ${tidy(d.body)}`)
    .join("\n\n");

  const blocks: Array<{ order: number; heading: string; body: string }> = [
    { order: 2, heading: "CONTEXT", body: tidy(cs.context ?? "") },
    { order: 5, heading: "THE BRAND PROBLEM", body: tidy(cs.problem ?? "") },
    { order: 8, heading: "APPROACH", body: tidy(cs.approach ?? "") },
    { order: 11, heading: "KEY DECISIONS", body: decisionsBody },
    { order: 14, heading: "OUTCOME", body: tidy(cs.outcome ?? "") },
  ].filter((b) => b.body.length > 0);

  const overview = tidy(cs.summary ?? "");

  console.log("=== OVERVIEW PANEL ===");
  console.log(`was: ${currentOverview?.slice(0, 100) ?? "(empty)"}…`);
  console.log(`now: ${overview}\n`);
  for (const b of blocks) {
    console.log(`=== TEXT BLOCK @ ${b.order} — ${b.heading} ===`);
    console.log(`${b.body}\n`);
  }

  if (!COMMIT) return console.log("Dry run. Re-run with --commit to apply.");

  const headings = blocks.map((b) => b.heading);
  const { rowCount: cleared } = await sql`
    DELETE FROM portfolio_blocks
    WHERE project_id = ${projectId} AND kind = 'text' AND heading = ANY(${headings as unknown as string}::text[])
  `;
  for (const b of blocks) {
    await sql`
      INSERT INTO portfolio_blocks (project_id, kind, heading, body, order_index)
      VALUES (${projectId}, 'text', ${b.heading}, ${b.body}, ${b.order})
    `;
  }
  await sql`
    UPDATE portfolio_projects
    SET overview_body = ${overview}, updated_at = NOW()
    WHERE id = ${projectId}
  `;
  console.log(`Cleared ${cleared ?? 0} old text block(s), inserted ${blocks.length}, overview updated.`);
}

main();
