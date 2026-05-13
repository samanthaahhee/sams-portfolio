/* Database access layer.
 *
 * Public-side reads attempt Postgres first; if the env is not set up
 * (POSTGRES_URL missing) OR the query fails, we fall back to the static
 * TypeScript data files. That keeps the site working before the user
 * provisions a database, then transitions seamlessly once seeded.
 */
import { sql } from "@vercel/postgres";
import {
  projects as staticProjects,
  type Project,
} from "./projects";
import {
  caseStudies as staticCaseStudies,
  type CaseStudy,
  type Palette,
} from "./case-studies";

const dbConfigured = () => Boolean(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL);

/* ── Projects ────────────────────────────────────────────────────── */

type ProjectRow = {
  slug: string;
  brand: string;
  title: string;
  tag: string;                       // legacy
  tags: string[] | string;           // jsonb
  year: string | null;
  palette: string;
  custom_colors: { a: string; b: string; aInk: string; bInk: string } | string | null;
  cover: string;
  description: string;
  gallery: string[] | string;
  href: string | null;
  position: number;
};

function projectFromRow(r: ProjectRow): Project {
  const parse = <T,>(v: T | string): T =>
    typeof v === "string" ? (JSON.parse(v) as T) : v;
  const gallery = parse(r.gallery) as string[];
  let tags = parse(r.tags) as string[];
  if ((!tags || tags.length === 0) && r.tag) tags = [r.tag];
  const customColors = r.custom_colors
    ? (parse(r.custom_colors) as Project["customColors"])
    : undefined;
  return {
    slug: r.slug,
    brand: r.brand,
    title: r.title,
    tags,
    year: r.year ?? undefined,
    palette: r.palette as Project["palette"],
    customColors,
    cover: r.cover,
    description: r.description,
    gallery,
    href: r.href ?? undefined,
  };
}

export async function getProjects(): Promise<Project[]> {
  if (!dbConfigured()) return staticProjects;
  try {
    const { rows } = await sql<ProjectRow>`
      SELECT slug, brand, title, tag, tags, year, palette, custom_colors,
             cover, description, gallery, href, position
      FROM projects
      ORDER BY position ASC, id ASC
    `;
    if (rows.length === 0) return staticProjects;
    return rows.map(projectFromRow);
  } catch (err) {
    console.warn("[db] Falling back to static projects:", err);
    return staticProjects;
  }
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const list = await getProjects();
  return list.find((p) => p.slug === slug);
}

/* ── Case studies ────────────────────────────────────────────────── */

type CaseStudyRow = {
  slug: string;
  no: string;
  title: string;
  client: string;
  year: string;
  role: string[] | string;
  primary_role: string;
  category: string;
  tags: string[] | string;
  summary: string;
  palette: string;
  custom_colors: { a: string; b: string; aInk: string; bInk: string } | string | null;
  cover: string;
  context: string;
  problem: string;
  approach: string;
  decisions: { title: string; body: string }[] | string;
  outcome: string;
  reflection: string;
  link_label: string | null;
  link_href: string | null;
  position: number;
};

function caseStudyFromRow(r: CaseStudyRow): CaseStudy {
  const parse = <T,>(v: T | string): T =>
    typeof v === "string" ? (JSON.parse(v) as T) : v;
  const customColors = r.custom_colors
    ? (parse(r.custom_colors) as CaseStudy["customColors"])
    : undefined;
  return {
    slug: r.slug,
    no: r.no,
    title: r.title,
    client: r.client,
    year: r.year,
    role: parse(r.role) as string[],
    primaryRole: r.primary_role,
    category: r.category,
    tags: parse(r.tags) as string[],
    summary: r.summary,
    palette: r.palette as CaseStudy["palette"],
    customColors,
    cover: r.cover,
    context: r.context,
    problem: r.problem,
    approach: r.approach,
    decisions: parse(r.decisions) as { title: string; body: string }[],
    outcome: r.outcome,
    reflection: r.reflection,
    link:
      r.link_label && r.link_href
        ? { label: r.link_label, href: r.link_href }
        : undefined,
  };
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  if (!dbConfigured()) return staticCaseStudies;
  try {
    const { rows } = await sql<CaseStudyRow>`
      SELECT slug, no, title, client, year, role, primary_role, category,
             tags, summary, palette, custom_colors, cover, context, problem,
             approach, decisions, outcome, reflection, link_label, link_href,
             position
      FROM case_studies
      ORDER BY position ASC, id ASC
    `;
    if (rows.length === 0) return staticCaseStudies;
    return rows.map(caseStudyFromRow);
  } catch (err) {
    console.warn("[db] Falling back to static case studies:", err);
    return staticCaseStudies;
  }
}

export async function getCaseStudyBySlug(
  slug: string,
): Promise<CaseStudy | undefined> {
  const list = await getCaseStudies();
  return list.find((c) => c.slug === slug);
}

/* ── Mutations (used by admin only) ──────────────────────────────── */

export async function upsertProject(p: Project, position?: number) {
  const primary = p.tags[0] ?? "";
  const customColorsJson = p.customColors ? JSON.stringify(p.customColors) : null;
  await sql`
    INSERT INTO projects
      (slug, brand, title, tag, tags, year, palette, custom_colors,
       cover, description, gallery, href, position)
    VALUES
      (${p.slug}, ${p.brand}, ${p.title}, ${primary},
       ${JSON.stringify(p.tags)}::jsonb, ${p.year ?? null},
       ${p.palette}, ${customColorsJson}::jsonb,
       ${p.cover}, ${p.description},
       ${JSON.stringify(p.gallery)}::jsonb, ${p.href ?? null},
       ${position ?? 0})
    ON CONFLICT (slug) DO UPDATE SET
      brand=EXCLUDED.brand, title=EXCLUDED.title, tag=EXCLUDED.tag,
      tags=EXCLUDED.tags, year=EXCLUDED.year, palette=EXCLUDED.palette,
      custom_colors=EXCLUDED.custom_colors,
      cover=EXCLUDED.cover, description=EXCLUDED.description,
      gallery=EXCLUDED.gallery, href=EXCLUDED.href, updated_at=NOW()
  `;
}

export async function deleteProject(slug: string) {
  await sql`DELETE FROM projects WHERE slug = ${slug}`;
}

/* ── Case study mutations ────────────────────────────────────────── */

export async function upsertCaseStudy(c: CaseStudy, position?: number) {
  const customColorsJson = c.customColors ? JSON.stringify(c.customColors) : null;
  await sql`
    INSERT INTO case_studies
      (slug, no, title, client, year, role, primary_role, category, tags,
       summary, palette, custom_colors, cover, context, problem, approach,
       decisions, outcome, reflection, link_label, link_href, position)
    VALUES
      (${c.slug}, ${c.no}, ${c.title}, ${c.client}, ${c.year},
       ${JSON.stringify(c.role)}::jsonb, ${c.primaryRole}, ${c.category},
       ${JSON.stringify(c.tags)}::jsonb, ${c.summary}, ${c.palette},
       ${customColorsJson}::jsonb,
       ${c.cover}, ${c.context}, ${c.problem}, ${c.approach},
       ${JSON.stringify(c.decisions)}::jsonb, ${c.outcome}, ${c.reflection},
       ${c.link?.label ?? null}, ${c.link?.href ?? null}, ${position ?? 0})
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
      custom_colors= EXCLUDED.custom_colors,
      cover        = EXCLUDED.cover,
      context      = EXCLUDED.context,
      problem      = EXCLUDED.problem,
      approach     = EXCLUDED.approach,
      decisions    = EXCLUDED.decisions,
      outcome      = EXCLUDED.outcome,
      reflection   = EXCLUDED.reflection,
      link_label   = EXCLUDED.link_label,
      link_href    = EXCLUDED.link_href,
      updated_at   = NOW()
  `;
}

export async function deleteCaseStudy(slug: string) {
  await sql`DELETE FROM case_studies WHERE slug = ${slug}`;
}
