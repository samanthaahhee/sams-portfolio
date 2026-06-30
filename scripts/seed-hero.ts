/**
 * One-shot: upload the 9 PNGs from ~/Downloads/homepage/ to Vercel
 * Blob and insert matching hero_cards rows. Clears hero_cards first
 * so re-running gives a clean slate.
 *
 *   npx tsx scripts/seed-hero.ts
 */
import { put } from "@vercel/blob";
import { sql } from "@vercel/postgres";
import { config } from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

config({ path: ".env.local" });

const SOURCE_DIR = path.join(os.homedir(), "Downloads", "homepage");

type Item = { file: string; title: string; href: string };
const ITEMS: Item[] = [
  { file: "1.png", title: "Walkrr",                 href: "/projects/walkrr" },
  { file: "2.png", title: "BOS at Expo",            href: "/work/bos-ice-tea" },
  { file: "3.png", title: "BOS Skinny Bostails",    href: "/work/bos-ice-tea" },
  { file: "4.png", title: "BOS Zandvoort activation", href: "/work/bos-ice-tea" },
  { file: "5.png", title: "BOS Green Ice",          href: "/work/bos-ice-tea" },
  { file: "6.png", title: "Smallstitch BBQ Bar",    href: "/projects/small-stitch" },
  { file: "7.png", title: "Win a BMW i3",           href: "/projects/win-a-bmw" },
  { file: "8.png", title: "BOS Bounce Back",        href: "/work/bos-ice-tea" },
  { file: "9.png", title: "HeyOtis",                href: "/projects/heyotis-app" },
];

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN missing — run `vercel env pull`.");
  }

  console.log(`Clearing existing hero_cards…`);
  await sql`DELETE FROM hero_cards`;

  for (let i = 0; i < ITEMS.length; i++) {
    const it = ITEMS[i];
    const buf = await fs.readFile(path.join(SOURCE_DIR, it.file));
    console.log(`  → uploading ${it.file} (${(buf.length / 1024).toFixed(0)} KB)`);
    const blob = await put(
      `hero/${Date.now()}-${path.basename(it.file)}`,
      buf,
      { access: "public", addRandomSuffix: true, contentType: "image/png" },
    );
    await sql`
      INSERT INTO hero_cards
        (image_url, title, href, position)
      VALUES
        (${blob.url}, ${it.title}, ${it.href}, ${i})
    `;
    console.log(`    ✓ ${it.title}  ·  ${it.href}`);
  }

  console.log(`\n✓ Seeded ${ITEMS.length} hero cards.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
