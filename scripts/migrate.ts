/* Apply schema.sql to the Postgres database referenced by env vars.
 * Run: npm run db:migrate (after vercel env pull). */
import { sql } from "@vercel/postgres";
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const schemaPath = path.join(process.cwd(), "src/lib/schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  // Strip line comments first, then split on semicolons
  const cleaned = schema
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = cleaned
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    const first = stmt.split("\n").find((l) => l.trim())?.slice(0, 80) ?? stmt.slice(0, 80);
    console.log(`→ ${first}`);
    await sql.query(stmt);
  }
  console.log(`\n✓ Migration complete — ${statements.length} statements run.`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
