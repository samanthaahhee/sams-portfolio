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

/* ── Projects ────────────────────────────────────────────────────── */

export type PortfolioProject = {
  id: number;
  slug: string;
  title: string;
  discipline: string;
  client: string;
  role: string;
  year: string;
  orderIndex: number;
  visible: boolean;
  workGridTemplate: string | null;
  coverUrl: string | null;
  coverType: MediaType | null;
};

type ProjectRow = {
  id: number;
  slug: string;
  title: string;
  discipline: string;
  client: string;
  role: string;
  year: string;
  order_index: number;
  visible: boolean;
  work_grid_template: string | null;
  cover_url: string | null;
  cover_type: string | null;
};

function projectFromRow(r: ProjectRow): PortfolioProject {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    discipline: r.discipline,
    client: r.client,
    role: r.role,
    year: r.year,
    orderIndex: r.order_index,
    visible: r.visible,
    workGridTemplate: r.work_grid_template,
    coverUrl: r.cover_url,
    coverType: r.cover_type as MediaType | null,
  };
}

/** All visible projects ordered for the work index, with their first
 *  carousel media joined as a cover image. */
export async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  try {
    const { rows } = await sql<ProjectRow>`
      SELECT p.*,
             m.url  AS cover_url,
             m.type AS cover_type
      FROM   portfolio_projects p
      LEFT JOIN LATERAL (
        SELECT url, type FROM portfolio_media
        WHERE  project_id = p.id AND surface = 'carousel'
        ORDER  BY order_index ASC, id ASC
        LIMIT  1
      ) m ON true
      WHERE  p.visible = true
      ORDER  BY p.order_index ASC, p.id ASC
    `;
    return rows.map(projectFromRow);
  } catch {
    return [];
  }
}

export async function getPortfolioProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  try {
    const { rows } = await sql<ProjectRow>`
      SELECT p.*,
             m.url  AS cover_url,
             m.type AS cover_type
      FROM   portfolio_projects p
      LEFT JOIN LATERAL (
        SELECT url, type FROM portfolio_media
        WHERE  project_id = p.id AND surface = 'carousel'
        ORDER  BY order_index ASC, id ASC
        LIMIT  1
      ) m ON true
      WHERE  p.slug = ${slug}
      LIMIT  1
    `;
    return rows[0] ? projectFromRow(rows[0]) : null;
  } catch {
    return null;
  }
}

/** All media for one project + surface, ordered for display. */
export async function getProjectMedia(
  projectId: number,
  surface: PortfolioMedia["surface"],
): Promise<PortfolioMedia[]> {
  try {
    const { rows } = await sql<MediaRow>`
      SELECT * FROM portfolio_media
      WHERE  project_id = ${projectId} AND surface = ${surface}
      ORDER  BY order_index ASC, id ASC
    `;
    return rows.map(mediaFromRow);
  } catch {
    return [];
  }
}

export async function upsertPortfolioProject(p: Omit<PortfolioProject, "id" | "coverUrl" | "coverType"> & { id?: number }) {
  if (p.id) {
    await sql`
      UPDATE portfolio_projects SET
        slug = ${p.slug}, title = ${p.title}, discipline = ${p.discipline},
        client = ${p.client}, role = ${p.role}, year = ${p.year},
        order_index = ${p.orderIndex}, visible = ${p.visible},
        work_grid_template = ${p.workGridTemplate}, updated_at = NOW()
      WHERE id = ${p.id}
    `;
  } else {
    await sql`
      INSERT INTO portfolio_projects
        (slug, title, discipline, client, role, year, order_index, visible, work_grid_template)
      VALUES
        (${p.slug}, ${p.title}, ${p.discipline}, ${p.client}, ${p.role}, ${p.year},
         ${p.orderIndex}, ${p.visible}, ${p.workGridTemplate})
    `;
  }
}

export async function deletePortfolioProject(id: number) {
  await sql`DELETE FROM portfolio_projects WHERE id = ${id}`;
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

/* ── Jobs / timeline ─────────────────────────────────────────────── */

export type PortfolioRecommendation = {
  id: number;
  body: string;
  author: string;
  date: string;
  relationship: string;
};

export type PortfolioJob = {
  id: number;
  company: string;
  title: string;
  dateRange: string;
  descriptor: string;
  role: string;
  clients: string[];
  scope: string[];
  tools: string[];
  periodLabel: string;
  orderIndex: number;
  recommendation: PortfolioRecommendation | null;
};

type JobRow = {
  id: number;
  company: string;
  title: string;
  date_range: string;
  descriptor: string;
  role: string;
  clients: string[] | string;
  scope: string[] | string;
  tools: string[] | string;
  period_label: string;
  order_index: number;
  rec_id: number | null;
  rec_body: string | null;
  rec_author: string | null;
  rec_date: string | null;
  rec_relationship: string | null;
};

function parseJsonArray(v: string[] | string): string[] {
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v); } catch { return []; }
}

function jobFromRow(r: JobRow): PortfolioJob {
  return {
    id: r.id,
    company: r.company,
    title: r.title,
    dateRange: r.date_range,
    descriptor: r.descriptor,
    role: r.role,
    clients: parseJsonArray(r.clients),
    scope: parseJsonArray(r.scope),
    tools: parseJsonArray(r.tools),
    periodLabel: r.period_label,
    orderIndex: r.order_index,
    recommendation: r.rec_id
      ? { id: r.rec_id, body: r.rec_body!, author: r.rec_author!, date: r.rec_date!, relationship: r.rec_relationship! }
      : null,
  };
}

export async function getPortfolioJobs(): Promise<PortfolioJob[]> {
  try {
    const { rows } = await sql<JobRow>`
      SELECT j.*,
             r.id           AS rec_id,
             r.body         AS rec_body,
             r.author       AS rec_author,
             r.date         AS rec_date,
             r.relationship AS rec_relationship
      FROM   portfolio_jobs j
      LEFT JOIN portfolio_recommendations r ON r.job_id = j.id
      ORDER  BY j.order_index ASC, j.id ASC
    `;
    return rows.map(jobFromRow);
  } catch {
    return [];
  }
}

/* ── Interests ───────────────────────────────────────────────────── */

export type PortfolioInterest = {
  id: number;
  groupLabel: string;
  items: string[];
  side: "left" | "right";
  position: number;
};

type InterestRow = {
  id: number;
  group_label: string;
  items: string[] | string;
  side: string;
  position: number;
};

export async function getPortfolioInterests(): Promise<PortfolioInterest[]> {
  try {
    const { rows } = await sql<InterestRow>`
      SELECT * FROM portfolio_interests ORDER BY position ASC, id ASC
    `;
    return rows.map((r) => ({
      id: r.id,
      groupLabel: r.group_label,
      items: parseJsonArray(r.items),
      side: r.side as "left" | "right",
      position: r.position,
    }));
  } catch {
    return [];
  }
}

/* ── Contact strips ──────────────────────────────────────────────── */

export type ContactStripType = "email" | "cv-download" | "phone" | "quote" | "message";

export type PortfolioContactStrip = {
  id: number;
  label: string;
  type: ContactStripType;
  content: string;
  orderIndex: number;
};

export async function getPortfolioContactStrips(): Promise<PortfolioContactStrip[]> {
  try {
    const { rows } = await sql<{
      id: number; label: string; type: string; content: string; order_index: number;
    }>`SELECT * FROM portfolio_contact_strips ORDER BY order_index ASC, id ASC`;
    return rows.map((r) => ({
      id: r.id,
      label: r.label,
      type: r.type as ContactStripType,
      content: r.content,
      orderIndex: r.order_index,
    }));
  } catch {
    return [];
  }
}
