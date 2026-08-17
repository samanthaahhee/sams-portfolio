/* Database access for the 2026 portfolio rebuild (staging/rebuild).
 * Reads from the `portfolio_*` tables only — entirely separate from
 * `db.ts`, which still serves the live legacy site. See
 * schema-portfolio.sql for table shapes. */
import { sql } from "@vercel/postgres";

export type MediaType = "image" | "gif" | "mp4";

/** What a file is, from its extension — the only signal a URL carries.
 *  Videos and GIFs both have to bypass the warping canvas, which paints
 *  a single frame, so knowing which is which decides how a slot renders. */
export function mediaTypeFor(url: string): MediaType {
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return "mp4";
  if (/\.gif(\?|$)/i.test(url)) return "gif";
  return "image";
}

/** True for anything the canvas cannot draw without freezing it. */
export function isMotionMedia(m?: { type?: MediaType; url?: string } | null) {
  if (!m) return false;
  if (m.type === "gif" || m.type === "mp4") return true;
  return m.url ? mediaTypeFor(m.url) !== "image" : false;
}

export type PortfolioMedia = {
  id: number;
  projectId: number | null;
  surface: "homepage" | "work_grid" | "thinking" | "carousel" | "project_page" | "thumbnail";
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
  /** Order within a slot's looping frame sequence. */
  frameIndex: number;
  /** 0..1 point of the source kept centred when cover-cropping. */
  focalX: number;
  focalY: number;
  /** 1 = plain cover crop; higher magnifies, taking a smaller window. */
  zoom: number;
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
  frame_index?: number;
  focal_x?: number;
  focal_y?: number;
  zoom?: number;
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
    frameIndex: r.frame_index ?? 0,
    focalX: r.focal_x ?? 0.5,
    focalY: r.focal_y ?? 0.5,
    zoom: r.zoom ?? 1,
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
  /** Whether the project page opens on its 2:1 hero banner. The image
   *  stays attached either way, so it can be switched back on. */
  showHero: boolean;
  coverUrl: string | null;
  coverType: MediaType | null;
  /** The homepage tile's own image + crop, independent of the hero.
   *  Null means the tile falls back to the cover. */
  thumbUrl: string | null;
  thumbFocalX: number;
  thumbFocalY: number;
  thumbZoom: number;
  coverFocalX: number;
  coverFocalY: number;
  coverZoom: number;
  deliverables: string[];
  creativeTeam: string[];
  /** Drives every piece of type on this project's page — wordmark,
   *  headings, meta row and body copy. Null falls back to the site red. */
  accentColor: string | null;
  overviewHeading: string | null;
  overviewBody: string | null;
};

/** The project's own columns — cover and thumbnail are joined from media
 *  rows, so they are read-only on the project and never written here. */
export type PortfolioProjectInput = Omit<
  PortfolioProject,
  | "id" | "coverUrl" | "coverType"
  | "thumbUrl" | "thumbFocalX" | "thumbFocalY" | "thumbZoom"
  | "coverFocalX" | "coverFocalY" | "coverZoom"
> & { id?: number };

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
  show_hero?: boolean | null;
  cover_url: string | null;
  cover_type: string | null;
  thumb_url?: string | null;
  thumb_focal_x?: number | null;
  thumb_focal_y?: number | null;
  thumb_zoom?: number | null;
  cover_focal_x?: number | null;
  cover_focal_y?: number | null;
  cover_zoom?: number | null;
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
    showHero: r.show_hero ?? true,
    coverUrl: r.cover_url,
    coverType: r.cover_type as MediaType | null,
    thumbUrl: r.thumb_url ?? null,
    thumbFocalX: r.thumb_focal_x ?? 0.5,
    thumbFocalY: r.thumb_focal_y ?? 0.5,
    thumbZoom: r.thumb_zoom ?? 1,
    coverFocalX: r.cover_focal_x ?? 0.5,
    coverFocalY: r.cover_focal_y ?? 0.5,
    coverZoom: r.cover_zoom ?? 1,
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
             m.type AS cover_type,
             t.url  AS thumb_url,
             t.focal_x AS thumb_focal_x,
             t.focal_y AS thumb_focal_y,
             t.zoom AS thumb_zoom,
             m.focal_x AS cover_focal_x,
             m.focal_y AS cover_focal_y,
             m.zoom AS cover_zoom
      FROM   portfolio_projects p
      LEFT JOIN LATERAL (
        SELECT url, type, focal_x, focal_y, zoom FROM portfolio_media
        WHERE  project_id = p.id AND surface = 'carousel'
        ORDER  BY order_index ASC, id ASC
        LIMIT  1
      ) m ON true
      LEFT JOIN LATERAL (
        SELECT url, focal_x, focal_y, zoom FROM portfolio_media
        WHERE  project_id = p.id AND surface = 'thumbnail'
        ORDER  BY order_index ASC, id ASC
        LIMIT  1
      ) t ON true
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
             m.type AS cover_type,
             t.url  AS thumb_url,
             t.focal_x AS thumb_focal_x,
             t.focal_y AS thumb_focal_y,
             t.zoom AS thumb_zoom,
             m.focal_x AS cover_focal_x,
             m.focal_y AS cover_focal_y,
             m.zoom AS cover_zoom
      FROM   portfolio_projects p
      LEFT JOIN LATERAL (
        SELECT url, type, focal_x, focal_y, zoom FROM portfolio_media
        WHERE  project_id = p.id AND surface = 'carousel'
        ORDER  BY order_index ASC, id ASC
        LIMIT  1
      ) m ON true
      LEFT JOIN LATERAL (
        SELECT url, focal_x, focal_y, zoom FROM portfolio_media
        WHERE  project_id = p.id AND surface = 'thumbnail'
        ORDER  BY order_index ASC, id ASC
        LIMIT  1
      ) t ON true
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
             m.type AS cover_type,
             t.url  AS thumb_url,
             t.focal_x AS thumb_focal_x,
             t.focal_y AS thumb_focal_y,
             t.zoom AS thumb_zoom,
             m.focal_x AS cover_focal_x,
             m.focal_y AS cover_focal_y,
             m.zoom AS cover_zoom
      FROM   portfolio_projects p
      LEFT JOIN LATERAL (
        SELECT url, type, focal_x, focal_y, zoom FROM portfolio_media
        WHERE  project_id = p.id AND surface = 'carousel'
        ORDER  BY order_index ASC, id ASC
        LIMIT  1
      ) m ON true
      LEFT JOIN LATERAL (
        SELECT url, focal_x, focal_y, zoom FROM portfolio_media
        WHERE  project_id = p.id AND surface = 'thumbnail'
        ORDER  BY order_index ASC, id ASC
        LIMIT  1
      ) t ON true
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
             m.type AS cover_type,
             t.url  AS thumb_url,
             t.focal_x AS thumb_focal_x,
             t.focal_y AS thumb_focal_y,
             t.zoom AS thumb_zoom,
             m.focal_x AS cover_focal_x,
             m.focal_y AS cover_focal_y,
             m.zoom AS cover_zoom
      FROM   portfolio_projects p
      LEFT JOIN LATERAL (
        SELECT url, type, focal_x, focal_y, zoom FROM portfolio_media
        WHERE  project_id = p.id AND surface = 'carousel'
        ORDER  BY order_index ASC, id ASC
        LIMIT  1
      ) m ON true
      LEFT JOIN LATERAL (
        SELECT url, focal_x, focal_y, zoom FROM portfolio_media
        WHERE  project_id = p.id AND surface = 'thumbnail'
        ORDER  BY order_index ASC, id ASC
        LIMIT  1
      ) t ON true
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

export async function upsertPortfolioProject(p: PortfolioProjectInput): Promise<number> {
  const deliverables = JSON.stringify(p.deliverables ?? []);
  const creativeTeam = JSON.stringify(p.creativeTeam ?? []);
  if (p.id) {
    await sql`
      UPDATE portfolio_projects SET
        slug = ${p.slug}, title = ${p.title}, discipline = ${p.discipline},
        client = ${p.client}, role = ${p.role}, year = ${p.year},
        order_index = ${p.orderIndex}, visible = ${p.visible},
        work_grid_template = ${p.workGridTemplate},
        show_hero = ${p.showHero},
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
       show_hero, deliverables, creative_team, accent_color, overview_heading, overview_body)
    VALUES
      (${p.slug}, ${p.title}, ${p.discipline}, ${p.client}, ${p.role}, ${p.year},
       ${p.orderIndex}, ${p.visible}, ${p.workGridTemplate}, ${p.showHero},
       ${deliverables}::jsonb, ${creativeTeam}::jsonb,
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

export type BlockLayout =
  | "single"
  | "portrait_landscape"
  | "landscape_portrait"
  | "split"
  | "portrait_trio"
  /** Three across at the images' own proportions. */
  | "trio"
  | "portrait_portrait"
  /** Two images behind a draggable before/after divider. */
  | "compare"
  /** Layered images that cycle, as on the legacy BOS page. */
  | "stack"
  /** One image at its own aspect ratio, uncropped. Animated GIFs play. */
  | "native";

export type PortfolioBlock =
  | {
      kind: "images";
      id: number;
      projectId: number;
      orderIndex: number;
      layout: BlockLayout;
      /** One entry per slot; each is that slot's looping frame sequence.
       *  A still image is simply a sequence of one. */
      slots: PortfolioMedia[][];
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
        ORDER  BY block_position ASC, frame_index ASC, id ASC
      `,
    ]);

    /* block -> slot index -> frames, in frame order. */
    const byBlock = new Map<number, PortfolioMedia[][]>();
    for (const m of mediaRows) {
      if (m.block_id === null) continue;
      const slots = byBlock.get(m.block_id) ?? [];
      const slot = m.block_position ?? 0;
      (slots[slot] ??= []).push(mediaFromRow(m));
      byBlock.set(m.block_id, slots);
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
            slots: byBlock.get(b.id) ?? [],
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

export type LibraryImage = {
  url: string;
  width: number | null;
  height: number | null;
  /** Which table it came from — shown as a caption so an image can be
   *  placed in context when several look alike. */
  source: string;
};

/** Every image anywhere in the database, deduplicated by URL.
 *
 *  Deliberately not limited to portfolio_media: most of Sam's uploads
 *  predate these tables and still live on the legacy project and case
 *  study rows. Only portfolio_media stores dimensions; the rest come
 *  back null, which is fine — the page reads natural size off the image
 *  itself. */
async function getDatabaseImages(): Promise<LibraryImage[]> {
  try {
    const { rows } = await sql<{ url: string; width: number | null; height: number | null; source: string }>`
      WITH visuals AS (
        SELECT jsonb_array_elements(visuals) AS e, 'Case study' AS src FROM case_studies
        UNION ALL
        SELECT jsonb_array_elements(visuals), 'Project' FROM projects
      ),
      all_images AS (
        SELECT url, width, height, 'Work grid'  AS source, 1 AS pref FROM portfolio_media
        UNION ALL
        SELECT cover, NULL, NULL, 'Project cover', 2 FROM projects
        UNION ALL
        SELECT cover, NULL, NULL, 'Case study', 3 FROM case_studies
        UNION ALL
        SELECT image_url, NULL, NULL, 'Thinking', 4 FROM portfolio_thinking_sections
        UNION ALL
        SELECT image_url, NULL, NULL, 'Hero card', 5 FROM hero_cards
        UNION ALL
        SELECT image_src, NULL, NULL, 'Experience', 6 FROM experience_entries
        /* The visuals JSON is not one shape: 'image'/'video' carry a url,
           'media'/'grid'/'stack' carry an images[] of plain strings, and
           'compare' carries before + after. Reading only ->>'src' found
           none of them, which is why the library looked so short. */
        UNION ALL
        SELECT e->>'url', NULL, NULL, src, 7 FROM visuals WHERE e ? 'url'
        UNION ALL
        SELECT jsonb_array_elements_text(e->'images'), NULL, NULL, src, 7
        FROM visuals WHERE e ? 'images'
        UNION ALL
        SELECT e->>'before', NULL, NULL, src, 7 FROM visuals WHERE e ? 'before'
        UNION ALL
        SELECT e->>'after', NULL, NULL, src, 7 FROM visuals WHERE e ? 'after'
      )
      SELECT DISTINCT ON (url) url, width, height, source
      FROM   all_images
      WHERE  url IS NOT NULL AND url <> ''
      ORDER  BY url, pref ASC
    `;
    return rows;
  } catch {
    return [];
  }
}

const MEDIA_EXT = /\.(png|jpe?g|gif|webp|avif|svg|mp4|webm|mov|m4v)$/i;

/** Everything in Blob storage, which is the real library — the database
 *  only knows about files something happens to reference, so anything
 *  uploaded for a page that was later edited or deleted is invisible to
 *  it. Needs BLOB_READ_WRITE_TOKEN; without it this returns nothing and
 *  the picker falls back to the database-only list. */
async function getStorageImages(): Promise<LibraryImage[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  try {
    const { list } = await import("@vercel/blob");
    const out: LibraryImage[] = [];
    let cursor: string | undefined;
    /* Paginate, but stop at a sane ceiling — the picker is a grid, not
       an archive browser. */
    for (let page = 0; page < 10; page++) {
      const res = await list({ cursor, limit: 1000 });
      for (const b of res.blobs) {
        if (!MEDIA_EXT.test(b.pathname)) continue;
        out.push({ url: b.url, width: null, height: null, source: "Storage" });
      }
      if (!res.hasMore || !res.cursor) break;
      cursor = res.cursor;
    }
    return out;
  } catch {
    return [];
  }
}

/** The picker's library: every image in Blob storage plus anything the
 *  database references, deduplicated by URL. Database entries win, since
 *  they carry a meaningful source label and real dimensions. */
export async function getMediaLibrary(): Promise<LibraryImage[]> {
  const [dbImages, storageImages] = await Promise.all([getDatabaseImages(), getStorageImages()]);
  const byUrl = new Map<string, LibraryImage>();
  for (const img of storageImages) byUrl.set(img.url, img);
  for (const img of dbImages) byUrl.set(img.url, img);
  return Array.from(byUrl.values());
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
}): Promise<{ id: number; frameIndex: number }> {
  /* Appends to the slot's sequence rather than assuming one image per
     slot — that is what makes a slot able to loop like a GIF. */
  /* Record GIFs as such: a native row plays them as a real <img>, and
     "type" is the only thing that says so. */
  const type = mediaTypeFor(m.url);
  const { rows } = await sql<{ id: number; frame_index: number }>`
    INSERT INTO portfolio_media
      (project_id, surface, type, url, width, height, aspect_ratio, order_index,
       block_id, block_position, frame_index)
    VALUES
      (${m.projectId}, 'project_page', ${type}, ${m.url}, ${m.width}, ${m.height},
       ${m.width && m.height ? `${m.width}:${m.height}` : null}, ${m.position},
       ${m.blockId}, ${m.position},
       COALESCE((SELECT MAX(frame_index) + 1 FROM portfolio_media
                 WHERE block_id = ${m.blockId} AND block_position = ${m.position}), 0))
    RETURNING id, frame_index
  `;
  return { id: rows[0].id, frameIndex: rows[0].frame_index };
}

/** Set the project's cover — the image the homepage tile and the project
 *  page's hero both use. Stored as its single 'carousel' media row, which
 *  is where getPortfolioProjects joins the cover from. */
export async function setProjectCover(
  projectId: number,
  url: string | null,
  width: number | null,
  height: number | null,
  focalX = 0.5,
  focalY = 0.5,
  zoom = 1,
) {
  await replaceSingleMedia(projectId, "carousel", url, focalX, focalY, zoom, width, height);
}

/** Set the homepage thumbnail and its crop. Passing a null url clears it,
 *  so the tile goes back to using the cover. */
export async function setProjectThumbnail(
  projectId: number,
  url: string | null,
  focalX = 0.5,
  focalY = 0.5,
  zoom = 1,
) {
  await replaceSingleMedia(projectId, "thumbnail", url, focalX, focalY, zoom);
}

/** Shared by the two single-image surfaces: replace the row, keeping its
 *  crop. Passing a null url just clears it. */
async function replaceSingleMedia(
  projectId: number,
  surface: "thumbnail" | "carousel",
  url: string | null,
  focalX: number,
  focalY: number,
  zoom: number,
  width: number | null = null,
  height: number | null = null,
) {
  const clamp = (v: number) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0.5));
  const z = Math.max(1, Math.min(4, Number.isFinite(zoom) ? zoom : 1));
  await sql`DELETE FROM portfolio_media WHERE project_id = ${projectId} AND surface = ${surface}`;
  if (!url) return;
  const type = mediaTypeFor(url);
  await sql`
    INSERT INTO portfolio_media
      (project_id, surface, type, url, width, height, order_index, focal_x, focal_y, zoom)
    VALUES (${projectId}, ${surface}, ${type}, ${url}, ${width}, ${height}, 0,
            ${clamp(focalX)}, ${clamp(focalY)}, ${z})
  `;
}

/** Move the crop — focal point 0..1, zoom 1..4. */
export async function setMediaCrop(id: number, focalX: number, focalY: number, zoom = 1) {
  const clamp = (v: number) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0.5));
  const z = Math.max(1, Math.min(4, Number.isFinite(zoom) ? zoom : 1));
  await sql`
    UPDATE portfolio_media
    SET focal_x = ${clamp(focalX)}, focal_y = ${clamp(focalY)}, zoom = ${z}
    WHERE id = ${id}
  `;
}

/** Attach media to a block (or detach with blockId = null). */
export async function setMediaBlock(mediaId: number, blockId: number | null, position = 0) {
  await sql`
    UPDATE portfolio_media
    SET block_id = ${blockId}, block_position = ${position}
    WHERE id = ${mediaId}
  `;
}

/* ── Homepage about section ──────────────────────────────────────────
   Copy and placement for the panel that sits inside the work grid. It
   lives in portfolio_settings rather than a table of its own — it is one
   record, not a list. */

export type AboutSection = {
  intro: string;
  fields: string[];
  services: string[];
  linkLabel: string;
  linkHref: string;
  /** How many two-up work rows come before the panel. */
  afterRows: number;
};

export const ABOUT_DEFAULTS: AboutSection = {
  intro:
    "Hey I’m Sam, a South African Visual Comms Designer living in Amsterdam. I enjoy helping start-ups and scale-ups create memorable brand experiences.",
  fields: ["Fintech", "FMCG", "Retail", "Consumer Tech"],
  services: [
    "Art Direction",
    "Packaging",
    "Creative Strategy",
    "Brand Design",
    "Activation Design",
    "Brand Experience",
    "Illustration",
  ],
  linkLabel: "Lets work together →",
  linkHref: "/contact",
  afterRows: 2,
};

const splitList = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

/** The about panel's saved copy, falling back to the shipped defaults for
 *  anything never set — so the homepage reads correctly on a fresh
 *  database and an empty field means "use the default", not "blank". */
export async function getAboutSection(): Promise<AboutSection> {
  const s = await getPortfolioSettings();
  return {
    intro: s.about_intro?.trim() || ABOUT_DEFAULTS.intro,
    fields: s.about_fields ? splitList(s.about_fields) : ABOUT_DEFAULTS.fields,
    services: s.about_services ? splitList(s.about_services) : ABOUT_DEFAULTS.services,
    linkLabel: s.about_link_label?.trim() || ABOUT_DEFAULTS.linkLabel,
    linkHref: s.about_link_href?.trim() || ABOUT_DEFAULTS.linkHref,
    afterRows: Number.isFinite(Number(s.about_after_rows))
      ? Math.max(0, Math.round(Number(s.about_after_rows)))
      : ABOUT_DEFAULTS.afterRows,
  };
}

export async function setAboutSection(a: AboutSection) {
  await Promise.all([
    setPortfolioSetting("about_intro", a.intro),
    setPortfolioSetting("about_fields", a.fields.join(", ")),
    setPortfolioSetting("about_services", a.services.join(", ")),
    setPortfolioSetting("about_link_label", a.linkLabel),
    setPortfolioSetting("about_link_href", a.linkHref),
    setPortfolioSetting("about_after_rows", String(a.afterRows)),
  ]);
}
