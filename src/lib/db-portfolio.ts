/* Database access for the 2026 portfolio rebuild (staging/rebuild).
 * Reads from the `portfolio_*` tables only — entirely separate from
 * `db.ts`, which still serves the live legacy site. See
 * schema-portfolio.sql for table shapes. */
import { sql } from "@vercel/postgres";

export type MediaType = "image" | "gif" | "mp4";

export type PortfolioMedia = {
  id: number;
  projectId: number | null;
  surface: "homepage" | "work_grid" | "thinking" | "carousel" | "project_page";
  slotId: string | null;
  type: MediaType;
  url: string;
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
  orderIndex: number;
  /** Freeform bento placement (surface='work_grid' only) — null start means
   *  "not yet placed"; the public page falls back to the automatic layout
   *  until every item (or at least one) has a placement. */
  gridColStart: number | null;
  gridColSpan: number;
  gridRowStart: number | null;
  gridRowSpan: number;
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
  grid_col_start: number | null;
  grid_col_span: number;
  grid_row_start: number | null;
  grid_row_span: number;
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
    gridColStart: r.grid_col_start,
    gridColSpan: r.grid_col_span,
    gridRowStart: r.grid_row_start,
    gridRowSpan: r.grid_row_span,
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
  deliverables: string[];
  creativeTeam: string[];
  /** Drives the wordmark, section headings and meta row on this project's
   *  page. Body copy stays charcoal regardless. Null falls back to the
   *  site red. */
  accentColor: string | null;
  overviewHeading: string | null;
  overviewBody: string | null;
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
  deliverables: string[] | string;
  creative_team: string[] | string;
  accent_color: string | null;
  overview_heading: string | null;
  overview_body: string | null;
};

function parseJsonArray(v: string[] | string): string[] {
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v); } catch { return []; }
}

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
    deliverables: parseJsonArray(r.deliverables ?? []),
    creativeTeam: parseJsonArray(r.creative_team ?? []),
    accentColor: r.accent_color ?? null,
    overviewHeading: r.overview_heading ?? null,
    overviewBody: r.overview_body ?? null,
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

export async function getPortfolioProjectById(id: number): Promise<PortfolioProject | null> {
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
      WHERE  p.id = ${id}
      LIMIT  1
    `;
    return rows[0] ? projectFromRow(rows[0]) : null;
  } catch {
    return null;
  }
}

/** Every project regardless of visibility — for the admin list. */
export async function getAllPortfolioProjects(): Promise<PortfolioProject[]> {
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
      ORDER  BY p.order_index ASC, p.id ASC
    `;
    return rows.map(projectFromRow);
  } catch {
    return [];
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

export async function upsertPortfolioProject(
  p: Omit<PortfolioProject, "id" | "coverUrl" | "coverType"> & { id?: number },
): Promise<number> {
  const deliverables = JSON.stringify(p.deliverables ?? []);
  const creativeTeam = JSON.stringify(p.creativeTeam ?? []);
  if (p.id) {
    await sql`
      UPDATE portfolio_projects SET
        slug = ${p.slug}, title = ${p.title}, discipline = ${p.discipline},
        client = ${p.client}, role = ${p.role}, year = ${p.year},
        order_index = ${p.orderIndex}, visible = ${p.visible},
        work_grid_template = ${p.workGridTemplate},
        deliverables = ${deliverables}::jsonb, creative_team = ${creativeTeam}::jsonb,
        accent_color = ${p.accentColor ?? null},
        overview_heading = ${p.overviewHeading ?? null},
        overview_body = ${p.overviewBody ?? null},
        updated_at = NOW()
      WHERE id = ${p.id}
    `;
    return p.id;
  }
  const { rows } = await sql<{ id: number }>`
    INSERT INTO portfolio_projects
      (slug, title, discipline, client, role, year, order_index, visible, work_grid_template,
       deliverables, creative_team, accent_color, overview_heading, overview_body)
    VALUES
      (${p.slug}, ${p.title}, ${p.discipline}, ${p.client}, ${p.role}, ${p.year},
       ${p.orderIndex}, ${p.visible}, ${p.workGridTemplate}, ${deliverables}::jsonb, ${creativeTeam}::jsonb,
       ${p.accentColor ?? null}, ${p.overviewHeading ?? null}, ${p.overviewBody ?? null})
    RETURNING id
  `;
  return rows[0].id;
}

export async function deletePortfolioProject(id: number) {
  await sql`DELETE FROM portfolio_projects WHERE id = ${id}`;
}

/** Bulk reorder — index becomes the new order_index. Used by the admin's
 *  drag-and-drop list for projects, work-grid media, and thinking sections. */
export async function setPortfolioProjectOrder(ids: number[]) {
  for (let i = 0; i < ids.length; i++) {
    await sql`UPDATE portfolio_projects SET order_index = ${i}, updated_at = NOW() WHERE id = ${ids[i]}`;
  }
}

export async function setPortfolioMediaOrder(ids: number[]) {
  for (let i = 0; i < ids.length; i++) {
    await sql`UPDATE portfolio_media SET order_index = ${i} WHERE id = ${ids[i]}`;
  }
}

export async function setThinkingSectionOrder(ids: number[]) {
  for (let i = 0; i < ids.length; i++) {
    await sql`UPDATE portfolio_thinking_sections SET order_index = ${i}, updated_at = NOW() WHERE id = ${ids[i]}`;
  }
}

/* ── Thinking sections ───────────────────────────────────────────── */

export type PortfolioThinkingSection = {
  id: number;
  projectId: number;
  title: string;
  body: string;
  imageUrl: string | null;
  orderIndex: number;
};

type ThinkingSectionRow = {
  id: number;
  project_id: number;
  title: string;
  body: string;
  image_url: string | null;
  order_index: number;
};

function thinkingSectionFromRow(r: ThinkingSectionRow): PortfolioThinkingSection {
  return {
    id: r.id,
    projectId: r.project_id,
    title: r.title,
    body: r.body,
    imageUrl: r.image_url,
    orderIndex: r.order_index,
  };
}

/** Ordered "Thinking" narrative sections for one project. */
export async function getThinkingSections(projectId: number): Promise<PortfolioThinkingSection[]> {
  try {
    const { rows } = await sql<ThinkingSectionRow>`
      SELECT * FROM portfolio_thinking_sections
      WHERE  project_id = ${projectId}
      ORDER  BY order_index ASC, id ASC
    `;
    return rows.map(thinkingSectionFromRow);
  } catch {
    return [];
  }
}

export async function upsertThinkingSection(s: Omit<PortfolioThinkingSection, "id"> & { id?: number }) {
  if (s.id) {
    await sql`
      UPDATE portfolio_thinking_sections SET
        project_id = ${s.projectId}, title = ${s.title}, body = ${s.body},
        image_url = ${s.imageUrl}, order_index = ${s.orderIndex}, updated_at = NOW()
      WHERE id = ${s.id}
    `;
  } else {
    await sql`
      INSERT INTO portfolio_thinking_sections
        (project_id, title, body, image_url, order_index)
      VALUES
        (${s.projectId}, ${s.title}, ${s.body}, ${s.imageUrl}, ${s.orderIndex})
    `;
  }
}

export async function deleteThinkingSection(id: number) {
  await sql`DELETE FROM portfolio_thinking_sections WHERE id = ${id}`;
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
        aspect_ratio = ${m.aspectRatio}, order_index = ${m.orderIndex},
        grid_col_start = ${m.gridColStart}, grid_col_span = ${m.gridColSpan},
        grid_row_start = ${m.gridRowStart}, grid_row_span = ${m.gridRowSpan}
      WHERE id = ${m.id}
    `;
  } else {
    await sql`
      INSERT INTO portfolio_media
        (project_id, surface, slot_id, type, url, width, height, aspect_ratio, order_index,
         grid_col_start, grid_col_span, grid_row_start, grid_row_span)
      VALUES
        (${m.projectId}, ${m.surface}, ${m.slotId}, ${m.type}, ${m.url}, ${m.width}, ${m.height}, ${m.aspectRatio}, ${m.orderIndex},
         ${m.gridColStart}, ${m.gridColSpan}, ${m.gridRowStart}, ${m.gridRowSpan})
    `;
  }
}

/** Batch-save the freeform grid builder's placements in one round trip. */
export async function saveGridPlacements(
  placements: { id: number; gridColStart: number | null; gridColSpan: number; gridRowStart: number | null; gridRowSpan: number }[],
) {
  for (const p of placements) {
    await sql`
      UPDATE portfolio_media SET
        grid_col_start = ${p.gridColStart}, grid_col_span = ${p.gridColSpan},
        grid_row_start = ${p.gridRowStart}, grid_row_span = ${p.gridRowSpan}
      WHERE id = ${p.id}
    `;
  }
}

export async function deletePortfolioMedia(id: number) {
  await sql`DELETE FROM portfolio_media WHERE id = ${id}`;
}

/** Set (or clear) just the freeform grid canvas size for a project, without
 *  touching its other fields. `null` reverts the public page to the
 *  automatic trio+banner layout. */
export async function setWorkGridTemplate(projectId: number, template: { columns: number; rows: number } | null) {
  await sql`
    UPDATE portfolio_projects SET
      work_grid_template = ${template ? JSON.stringify(template) : null}, updated_at = NOW()
    WHERE id = ${projectId}
  `;
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

/* ── Project page blocks ─────────────────────────────────────────────
   An ordered stream mixing image rows and copy, so paragraphs can sit
   anywhere between rows. `kind` discriminates the union.            */

export type BlockLayout = "single" | "portrait_landscape" | "split";

export type PortfolioBlock =
  | {
      kind: "images";
      id: number;
      projectId: number;
      orderIndex: number;
      layout: BlockLayout;
      media: PortfolioMedia[];
    }
  | {
      kind: "text";
      id: number;
      projectId: number;
      orderIndex: number;
      heading: string | null;
      body: string | null;
    };

type BlockRow = {
  id: number;
  project_id: number;
  order_index: number;
  kind: "images" | "text";
  layout: BlockLayout | null;
  heading: string | null;
  body: string | null;
};

/** Blocks for a project, each image block carrying its media in order. */
export async function getProjectBlocks(projectId: number): Promise<PortfolioBlock[]> {
  try {
    const [{ rows: blockRows }, { rows: mediaRows }] = await Promise.all([
      sql<BlockRow>`
        SELECT id, project_id, order_index, kind, layout, heading, body
        FROM   portfolio_blocks
        WHERE  project_id = ${projectId}
        ORDER  BY order_index ASC, id ASC
      `,
      sql<MediaRow & { block_id: number | null; block_position: number }>`
        SELECT * FROM portfolio_media
        WHERE  block_id IS NOT NULL AND project_id = ${projectId}
        ORDER  BY block_position ASC, id ASC
      `,
    ]);

    const byBlock = new Map<number, PortfolioMedia[]>();
    for (const m of mediaRows) {
      if (m.block_id === null) continue;
      const list = byBlock.get(m.block_id) ?? [];
      list.push(mediaFromRow(m));
      byBlock.set(m.block_id, list);
    }

    return blockRows.map((b) =>
      b.kind === "text"
        ? {
            kind: "text" as const,
            id: b.id,
            projectId: b.project_id,
            orderIndex: b.order_index,
            heading: b.heading,
            body: b.body,
          }
        : {
            kind: "images" as const,
            id: b.id,
            projectId: b.project_id,
            orderIndex: b.order_index,
            layout: b.layout ?? "single",
            media: byBlock.get(b.id) ?? [],
          },
    );
  } catch {
    return [];
  }
}

export async function createBlock(
  projectId: number,
  kind: "images" | "text",
  layout: BlockLayout | null = null,
): Promise<number> {
  const { rows } = await sql<{ id: number }>`
    INSERT INTO portfolio_blocks (project_id, kind, layout, order_index)
    VALUES (
      ${projectId}, ${kind}, ${layout},
      COALESCE((SELECT MAX(order_index) + 1 FROM portfolio_blocks WHERE project_id = ${projectId}), 0)
    )
    RETURNING id
  `;
  return rows[0].id;
}

export async function updateBlock(
  id: number,
  patch: { layout?: BlockLayout | null; heading?: string | null; body?: string | null },
) {
  await sql`
    UPDATE portfolio_blocks SET
      layout  = COALESCE(${patch.layout ?? null}, layout),
      heading = ${patch.heading ?? null},
      body    = ${patch.body ?? null},
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function deleteBlock(id: number) {
  await sql`DELETE FROM portfolio_blocks WHERE id = ${id}`;
}

/** Persist a new block order from the admin's drag-and-drop. */
export async function setBlockOrder(projectId: number, idsInOrder: number[]) {
  for (let i = 0; i < idsInOrder.length; i++) {
    await sql`
      UPDATE portfolio_blocks SET order_index = ${i}, updated_at = NOW()
      WHERE id = ${idsInOrder[i]} AND project_id = ${projectId}
    `;
  }
}

/** Insert an image straight into a block slot, returning its media id.
 *  Block media lives on the 'project_page' surface so it never turns up in
 *  the legacy work-grid or thinking queries. */
export async function createBlockMedia(m: {
  projectId: number;
  blockId: number;
  position: number;
  url: string;
  width: number | null;
  height: number | null;
}): Promise<number> {
  const { rows } = await sql<{ id: number }>`
    INSERT INTO portfolio_media
      (project_id, surface, type, url, width, height, aspect_ratio, order_index, block_id, block_position)
    VALUES
      (${m.projectId}, 'project_page', 'image', ${m.url}, ${m.width}, ${m.height},
       ${m.width && m.height ? `${m.width}:${m.height}` : null}, ${m.position}, ${m.blockId}, ${m.position})
    RETURNING id
  `;
  return rows[0].id;
}

/** Attach media to a block (or detach with blockId = null). */
export async function setMediaBlock(mediaId: number, blockId: number | null, position = 0) {
  await sql`
    UPDATE portfolio_media
    SET block_id = ${blockId}, block_position = ${position}
    WHERE id = ${mediaId}
  `;
}
