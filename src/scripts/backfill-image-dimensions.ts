/* Fill in width/height for media rows that have none.
 *
 * Run:  npx tsx --env-file=.env.local src/scripts/backfill-image-dimensions.ts [--commit]
 *
 * The migration had no dimensions to record, so most images carry null.
 * That costs three things: the editor says "size unknown", original-size
 * rows must measure in the browser before the warping canvas can take
 * over (a visible flash), and any layout that needs a picture's true
 * proportions — the before/after slider — has to guess.
 *
 * Only the file header is needed, so this reads the first bytes rather
 * than downloading whole images.
 */
import { sql } from "@vercel/postgres";

type Size = { width: number; height: number };

/** Parse dimensions out of a PNG / GIF / JPEG / WEBP header. */
function readSize(buf: Buffer): Size | null {
  // PNG: IHDR is always at byte 16
  if (buf.length > 24 && buf.toString("ascii", 1, 4) === "PNG") {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // GIF: logical screen descriptor, little-endian, at byte 6
  if (buf.length > 10 && buf.toString("ascii", 0, 3) === "GIF") {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }
  // WEBP (VP8X / VP8L / VP8 )
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const fmt = buf.toString("ascii", 12, 16);
    if (fmt === "VP8X") {
      return {
        width: 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16)),
        height: 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16)),
      };
    }
    if (fmt === "VP8 ") {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
  }
  // JPEG: walk the segments to a start-of-frame marker
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = buf[i + 1];
      // SOF0..SOF15, skipping the four that are not frame headers
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc, 0xd8].includes(marker)) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

async function sizeOf(url: string): Promise<Size | null> {
  const absolute = url.startsWith("http") ? url : null;
  if (!absolute) return null; // same-origin paths are files in /public
  try {
    /* Ask for the first 64KB only — enough for any header, and it keeps
       a hundred-odd images to a few seconds. */
    const res = await fetch(absolute, { headers: { Range: "bytes=0-65535" } });
    if (!res.ok && res.status !== 206) return null;
    return readSize(Buffer.from(await res.arrayBuffer()));
  } catch {
    return null;
  }
}

async function main() {
  const commit = process.argv.includes("--commit");
  const { rows } = await sql<{ id: number; url: string }>`
    SELECT id, url FROM portfolio_media
    WHERE (width IS NULL OR height IS NULL) AND url <> ''
    ORDER BY id
  `;
  console.log(`${rows.length} rows without dimensions`);

  let done = 0;
  let failed = 0;
  /* Batched so a hundred images do not open a hundred sockets at once. */
  for (let i = 0; i < rows.length; i += 8) {
    const batch = rows.slice(i, i + 8);
    const sizes = await Promise.all(batch.map((r) => sizeOf(r.url)));
    for (let j = 0; j < batch.length; j++) {
      const size = sizes[j];
      if (!size || !size.width || !size.height) {
        failed++;
        continue;
      }
      if (commit) {
        await sql`
          UPDATE portfolio_media
          SET width = ${size.width}, height = ${size.height},
              aspect_ratio = ${`${size.width}:${size.height}`}
          WHERE id = ${batch[j].id}
        `;
      }
      done++;
    }
  }
  console.log(commit ? `updated ${done}, could not read ${failed}` : `would update ${done}, could not read ${failed}`);
  if (!commit) console.log("(dry run — pass --commit to write)");
}

main().catch((e) => {
  console.error("BACKFILL FAILED:", e.message);
  process.exit(1);
});
