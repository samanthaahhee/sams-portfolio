/* Database access for the 2026 portfolio rebuild (staging/rebuild).
 * Reads from the `portfolio_*` tables only — entirely separate from
 * `db.ts`, which still serves the live legacy site. See
 * schema-portfolio.sql for table shapes. */
import { sql } from "@vercel/postgres";

export type MediaType = "image" | "gif" | "mp4";

export type PortfolioMedia = {
  id: number;
  projectId: number | null;
  surface: "homepage" | "work_grid" | "thinking" | "carousel";
  slotId: string | null;
  type: MediaType;
  url: string;
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
  orderIndex: number;
};

type MediaRow = {
  id: number;
  project_id: number | null;
  surface: string;
  slot_id: string | null;
  type: string;
  url: string;
  width: number | null;
  height: number | null;
  aspect_ratio: string | null;
  order_index: number;
};

function mediaFromRow(r: MediaRow): PortfolioMedia {
  return {
    id: r.id,
    projectId: r.project_id,
    surface: r.surface as PortfolioMedia["surface"],
    slotId: r.slot_id,
    type: r.type as MediaType,
    url: r.url,
    width: r.width,
    height: r.height,
    aspectRatio: r.aspect_ratio,
    orderIndex: r.order_index,
  };
}

/** All media tiles for a given surface ('homepage' | 'work_grid' | 'thinking' | 'carousel'),
 *  ordered for display. Returns [] (never throws) if the table is empty
 *  or the DB isn't reachable, so pages can render an empty-state. */
export async function getPortfolioMedia(
  surface: PortfolioMedia["surface"],
): Promise<PortfolioMedia[]> {
  try {
    const { rows } = await sql<MediaRow>`
      SELECT * FROM portfolio_media
      WHERE surface = ${surface}
      ORDER BY order_index ASC, id ASC
    `;
    return rows.map(mediaFromRow);
  } catch {
    return [];
  }
}

/** Key/value settings bag — homepage copy A/B, contact ambient copy,
 *  email, phone, cv_pdf_url, etc. */
export async function getPortfolioSettings(): Promise<Record<string, string>> {
  try {
    const { rows } = await sql<{ key: string; value: string }>`
      SELECT key, value FROM portfolio_settings
    `;
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
}

export async function setPortfolioSetting(key: string, value: string) {
  await sql`
    INSERT INTO portfolio_settings (key, value, updated_at)
    VALUES (${key}, ${value}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
}

export async function upsertPortfolioMedia(m: Omit<PortfolioMedia, "id"> & { id?: number }) {
  if (m.id) {
    await sql`
      UPDATE portfolio_media SET
        project_id = ${m.projectId}, surface = ${m.surface}, slot_id = ${m.slotId},
        type = ${m.type}, url = ${m.url}, width = ${m.width}, height = ${m.height},
        aspect_ratio = ${m.aspectRatio}, order_index = ${m.orderIndex}
      WHERE id = ${m.id}
    `;
  } else {
    await sql`
      INSERT INTO portfolio_media
        (project_id, surface, slot_id, type, url, width, height, aspect_ratio, order_index)
      VALUES
        (${m.projectId}, ${m.surface}, ${m.slotId}, ${m.type}, ${m.url}, ${m.width}, ${m.height}, ${m.aspectRatio}, ${m.orderIndex})
    `;
  }
}

export async function deletePortfolioMedia(id: number) {
  await sql`DELETE FROM portfolio_media WHERE id = ${id}`;
}
