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
  comparisons: Project["comparisons"] | string | null;
  visuals: VisualItem[] | string | null;
  href: string | null;
  position: number;
  published: boolean;
  no: string | null;
  client: string | null;
  role: string[] | string | null;
  primary_role: string | null;
  category: string | null;
  summary: string | null;
  context: string | null;
  problem: string | null;
  approach: string | null;
  decisions: { title: string; body: string }[] | string | null;
  outcome: string | null;
  reflection: string | null;
  link_label: string | null;
  link_href: string | null;
};

/** Normalise gallery: old data may be a string[] of URLs; new data is
 *  an array of { url, caption? } objects. */
function normalizeGallery(raw: unknown): { url: string; caption?: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return { url: item };
      if (item && typeof item === "object" && "url" in item) {
        return item as { url: string; caption?: string };
      }
      return null;
    })
    .filter((x): x is { url: string; caption?: string } => x !== null);
}

type VisualItem =
  | { kind: "image"; url: string; caption?: string }
  | { kind: "compare"; before: string; after: string; caption?: string }
  | { kind: "grid"; images: string[]; caption?: string }
  | { kind: "stack"; images: string[]; caption?: string }
  | {
      kind: "media";
      images: string[];
      layout: "vertical" | "horizontal";
      caption?: string;
    }
  | { kind: "video"; url: string; caption?: string };

/** Build a unified visuals array from possibly-legacy data:
 *  - If `visuals` is populated, parse and use it directly.
 *  - Otherwise merge gallery (as image items) + comparisons (as
 *    compare items) so the public pages keep rendering older rows. */
function buildVisuals(
  rawVisuals: unknown,
  gallery: { url: string; caption?: string }[],
  comparisons: { before: string; after: string; caption?: string }[] | undefined,
): VisualItem[] {
  const arr = Array.isArray(rawVisuals) ? rawVisuals : [];
  const parsed = arr
    .filter(
      (x): x is VisualItem =>
        Boolean(x) &&
        typeof x === "object" &&
        "kind" in (x as object) &&
        ["image", "compare", "grid", "stack", "media", "video"].includes(
          (x as { kind: string }).kind,
        ),
    )
    .map((x) => x as VisualItem);

  if (parsed.length > 0) return parsed;

  // Legacy merge — gallery items first, then comparisons.
  const fromGallery: VisualItem[] = gallery.map((g) => ({
    kind: "image",
    url: g.url,
    caption: g.caption,
  }));
  const fromCompare: VisualItem[] = (comparisons ?? []).map((c) => ({
    kind: "compare",
    before: c.before,
    after: c.after,
    caption: c.caption,
  }));
  return [...fromGallery, ...fromCompare];
}

function projectFromRow(r: ProjectRow): Project {
  const parse = <T,>(v: T | string): T =>
    typeof v === "string" ? (JSON.parse(v) as T) : v;
  const gallery = normalizeGallery(parse(r.gallery));
  let tags = parse(r.tags) as string[];
  if ((!tags || tags.length === 0) && r.tag) tags = [r.tag];
  const customColors = r.custom_colors
    ? (parse(r.custom_colors) as Project["customColors"])
    : undefined;
  const comparisons = r.comparisons
    ? (parse(r.comparisons) as Project["comparisons"])
    : undefined;
  const visuals = buildVisuals(parse(r.visuals), gallery, comparisons);
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
    comparisons: comparisons && comparisons.length > 0 ? comparisons : undefined,
    visuals: visuals.length > 0 ? visuals : undefined,
    href: r.href ?? undefined,
    published: r.published ?? true,
    no: r.no ?? undefined,
    client: r.client ?? undefined,
    role: r.role
      ? Array.isArray(r.role)
        ? r.role
        : (JSON.parse(r.role) as string[])
      : undefined,
    primaryRole: r.primary_role ?? undefined,
    category: r.category ?? undefined,
    summary: r.summary ?? undefined,
    context: r.context ?? undefined,
    problem: r.problem ?? undefined,
    approach: r.approach ?? undefined,
    decisions: r.decisions
      ? (Array.isArray(r.decisions)
          ? r.decisions
          : (JSON.parse(r.decisions) as { title: string; body: string }[]))
      : undefined,
    outcome: r.outcome ?? undefined,
    reflection: r.reflection ?? undefined,
    link:
      r.link_label && r.link_href
        ? { label: r.link_label, href: r.link_href }
        : undefined,
  };
}

/** All projects including drafts — for admin views. */
export async function getAllProjects(): Promise<Project[]> {
  if (!dbConfigured()) return staticProjects;
  try {
    const { rows } = await sql<ProjectRow>`
      SELECT slug, brand, title, tag, tags, year, palette, custom_colors,
             cover, description, gallery, comparisons, visuals, href, position,
             published, no, client, role, primary_role, category, summary,
             context, problem, approach, decisions, outcome, reflection,
             link_label, link_href
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

/** Published projects only — for public-facing pages. */
export async function getProjects(): Promise<Project[]> {
  const all = await getAllProjects();
  return all.filter((p) => p.published !== false);
}

/** Admin lookup — returns drafts too. */
export async function getProjectAdmin(
  slug: string,
): Promise<Project | undefined> {
  const list = await getAllProjects();
  return list.find((p) => p.slug === slug);
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
  gallery: string[] | string;
  comparisons: CaseStudy["comparisons"] | string | null;
  visuals: VisualItem[] | string | null;
  link_label: string | null;
  link_href: string | null;
  position: number;
  published: boolean;
};

function caseStudyFromRow(r: CaseStudyRow): CaseStudy {
  const parse = <T,>(v: T | string): T =>
    typeof v === "string" ? (JSON.parse(v) as T) : v;
  const customColors = r.custom_colors
    ? (parse(r.custom_colors) as CaseStudy["customColors"])
    : undefined;
  const gallery = normalizeGallery(parse(r.gallery));
  const comparisons = r.comparisons
    ? (parse(r.comparisons) as CaseStudy["comparisons"])
    : undefined;
  const visuals = buildVisuals(parse(r.visuals), gallery, comparisons);
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
    gallery: gallery.length > 0 ? gallery : undefined,
    comparisons: comparisons && comparisons.length > 0 ? comparisons : undefined,
    visuals: visuals.length > 0 ? visuals : undefined,
    link:
      r.link_label && r.link_href
        ? { label: r.link_label, href: r.link_href }
        : undefined,
    published: r.published ?? true,
  };
}

/** All case studies including drafts — for admin views. */
export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  if (!dbConfigured()) return staticCaseStudies;
  try {
    const { rows } = await sql<CaseStudyRow>`
      SELECT slug, no, title, client, year, role, primary_role, category,
             tags, summary, palette, custom_colors, cover, context, problem,
             approach, decisions, outcome, reflection, gallery, comparisons,
             visuals, link_label, link_href, position, published
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

/** Published case studies only — for public-facing pages. */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  const all = await getAllCaseStudies();
  return all.filter((c) => c.published !== false);
}

/** Admin lookup — returns drafts too. */
export async function getCaseStudyBySlugAdmin(
  slug: string,
): Promise<CaseStudy | undefined> {
  const list = await getAllCaseStudies();
  return list.find((c) => c.slug === slug);
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
  const comparisonsJson = JSON.stringify(p.comparisons ?? []);
  const visualsJson = JSON.stringify(p.visuals ?? []);
  const published = p.published !== false;
  const roleJson = JSON.stringify(p.role ?? []);
  const decisionsJson = JSON.stringify(p.decisions ?? []);
  await sql`
    INSERT INTO projects
      (slug, brand, title, tag, tags, year, palette, custom_colors,
       cover, description, gallery, comparisons, visuals, href, position,
       published, no, client, role, primary_role, category, summary,
       context, problem, approach, decisions, outcome, reflection,
       link_label, link_href)
    VALUES
      (${p.slug}, ${p.brand}, ${p.title}, ${primary},
       ${JSON.stringify(p.tags)}::jsonb, ${p.year ?? null},
       ${p.palette}, ${customColorsJson}::jsonb,
       ${p.cover}, ${p.description},
       ${JSON.stringify(p.gallery)}::jsonb,
       ${comparisonsJson}::jsonb,
       ${visualsJson}::jsonb,
       ${p.href ?? null}, ${position ?? 0},
       ${published},
       ${p.no ?? null}, ${p.client ?? null},
       ${roleJson}::jsonb, ${p.primaryRole ?? null}, ${p.category ?? null},
       ${p.summary ?? null}, ${p.context ?? null}, ${p.problem ?? null},
       ${p.approach ?? null}, ${decisionsJson}::jsonb,
       ${p.outcome ?? null}, ${p.reflection ?? null},
       ${p.link?.label ?? null}, ${p.link?.href ?? null})
    ON CONFLICT (slug) DO UPDATE SET
      brand=EXCLUDED.brand, title=EXCLUDED.title, tag=EXCLUDED.tag,
      tags=EXCLUDED.tags, year=EXCLUDED.year, palette=EXCLUDED.palette,
      custom_colors=EXCLUDED.custom_colors,
      cover=EXCLUDED.cover, description=EXCLUDED.description,
      gallery=EXCLUDED.gallery, comparisons=EXCLUDED.comparisons,
      visuals=EXCLUDED.visuals,
      href=EXCLUDED.href, published=EXCLUDED.published,
      no=EXCLUDED.no, client=EXCLUDED.client, role=EXCLUDED.role,
      primary_role=EXCLUDED.primary_role, category=EXCLUDED.category,
      summary=EXCLUDED.summary, context=EXCLUDED.context,
      problem=EXCLUDED.problem, approach=EXCLUDED.approach,
      decisions=EXCLUDED.decisions, outcome=EXCLUDED.outcome,
      reflection=EXCLUDED.reflection, link_label=EXCLUDED.link_label,
      link_href=EXCLUDED.link_href,
      updated_at=NOW()
  `;
}

export async function deleteProject(slug: string) {
  await sql`DELETE FROM projects WHERE slug = ${slug}`;
}

/* ── Case study mutations ────────────────────────────────────────── */

export async function upsertCaseStudy(c: CaseStudy, position?: number) {
  const customColorsJson = c.customColors ? JSON.stringify(c.customColors) : null;
  const galleryJson = JSON.stringify(c.gallery ?? []);
  const comparisonsJson = JSON.stringify(c.comparisons ?? []);
  const visualsJson = JSON.stringify(c.visuals ?? []);
  const published = c.published !== false;
  await sql`
    INSERT INTO case_studies
      (slug, no, title, client, year, role, primary_role, category, tags,
       summary, palette, custom_colors, cover, context, problem, approach,
       decisions, outcome, reflection, gallery, comparisons, visuals,
       link_label, link_href, position, published)
    VALUES
      (${c.slug}, ${c.no}, ${c.title}, ${c.client}, ${c.year},
       ${JSON.stringify(c.role)}::jsonb, ${c.primaryRole}, ${c.category},
       ${JSON.stringify(c.tags)}::jsonb, ${c.summary}, ${c.palette},
       ${customColorsJson}::jsonb,
       ${c.cover}, ${c.context}, ${c.problem}, ${c.approach},
       ${JSON.stringify(c.decisions)}::jsonb, ${c.outcome}, ${c.reflection},
       ${galleryJson}::jsonb, ${comparisonsJson}::jsonb,
       ${visualsJson}::jsonb,
       ${c.link?.label ?? null}, ${c.link?.href ?? null}, ${position ?? 0},
       ${published})
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
      gallery      = EXCLUDED.gallery,
      comparisons  = EXCLUDED.comparisons,
      visuals      = EXCLUDED.visuals,
      link_label   = EXCLUDED.link_label,
      link_href    = EXCLUDED.link_href,
      published    = EXCLUDED.published,
      updated_at   = NOW()
  `;
}

export async function deleteCaseStudy(slug: string) {
  await sql`DELETE FROM case_studies WHERE slug = ${slug}`;
}

/* ── Reorder ─────────────────────────────────────────────────────── */

/** Swap the `position` of two rows in the same table — used by the
 *  admin ↑ ↓ reorder buttons. */
/** Bulk-set positions for a kind based on an ordered slugs array.
 *  Index in the array becomes the new `position` value. Items not in
 *  the array are left untouched (e.g. drafts excluded from the
 *  published reorder list). */
export async function setOrder(
  kind: "projects" | "case_studies",
  slugs: string[],
) {
  for (let i = 0; i < slugs.length; i++) {
    if (kind === "projects") {
      await sql`UPDATE projects SET position = ${i}, updated_at = NOW()
                WHERE slug = ${slugs[i]}`;
    } else {
      await sql`UPDATE case_studies SET position = ${i}, updated_at = NOW()
                WHERE slug = ${slugs[i]}`;
    }
  }
}

export async function swapProjectPositions(slugA: string, slugB: string) {
  const { rows } = await sql<{ slug: string; position: number }>`
    SELECT slug, position FROM projects WHERE slug IN (${slugA}, ${slugB})
  `;
  const a = rows.find((r) => r.slug === slugA);
  const b = rows.find((r) => r.slug === slugB);
  if (!a || !b) return;
  await sql`UPDATE projects SET position = ${b.position}, updated_at = NOW() WHERE slug = ${slugA}`;
  await sql`UPDATE projects SET position = ${a.position}, updated_at = NOW() WHERE slug = ${slugB}`;
}

export async function swapCaseStudyPositions(slugA: string, slugB: string) {
  const { rows } = await sql<{ slug: string; position: number }>`
    SELECT slug, position FROM case_studies WHERE slug IN (${slugA}, ${slugB})
  `;
  const a = rows.find((r) => r.slug === slugA);
  const b = rows.find((r) => r.slug === slugB);
  if (!a || !b) return;
  await sql`UPDATE case_studies SET position = ${b.position}, updated_at = NOW() WHERE slug = ${slugA}`;
  await sql`UPDATE case_studies SET position = ${a.position}, updated_at = NOW() WHERE slug = ${slugB}`;
}

/* ── Experience entries (CV / /about timeline) ──────────────────── */

import type { ExperienceEntry } from "./about";

type ExperienceRow = {
  slug: string;
  title: string;
  short_title: string;
  company: string;
  year_pill: string;
  dates: string;
  location: string;
  context: string;
  featured: boolean;
  description: string;
  bullets: string[] | string;
  image_src: string;
  image_alt: string;
  position: number;
};

function experienceFromRow(r: ExperienceRow): ExperienceEntry & { slug: string } {
  const bullets = Array.isArray(r.bullets)
    ? r.bullets
    : (JSON.parse(r.bullets) as string[]);
  return {
    slug: r.slug,
    title: r.title,
    shortTitle: r.short_title,
    company: r.company,
    yearPill: r.year_pill,
    dates: r.dates,
    location: r.location,
    context: r.context,
    featured: r.featured,
    description: r.description,
    bullets,
    image: { src: r.image_src, alt: r.image_alt },
  };
}

/** Read all experience entries in display order (current role first). */
export async function getExperience(): Promise<
  (ExperienceEntry & { slug: string })[]
> {
  if (!dbConfigured()) return [];
  try {
    const { rows } = await sql<ExperienceRow>`
      SELECT slug, title, short_title, company, year_pill, dates, location,
             context, featured, description, bullets, image_src, image_alt,
             position
      FROM experience_entries
      ORDER BY position ASC, id ASC
    `;
    return rows.map(experienceFromRow);
  } catch (err) {
    console.warn("[db] getExperience failed:", err);
    return [];
  }
}

export async function getExperienceBySlug(
  slug: string,
): Promise<(ExperienceEntry & { slug: string }) | undefined> {
  const all = await getExperience();
  return all.find((e) => e.slug === slug);
}

/** Upsert a single experience entry — admin form target. */
export async function upsertExperience(
  e: ExperienceEntry & { slug: string },
  position?: number,
) {
  await sql`
    INSERT INTO experience_entries
      (slug, title, short_title, company, year_pill, dates, location, context,
       featured, description, bullets, image_src, image_alt, position)
    VALUES
      (${e.slug}, ${e.title}, ${e.shortTitle}, ${e.company}, ${e.yearPill},
       ${e.dates}, ${e.location ?? ""}, ${e.context ?? ""},
       ${e.featured ?? false}, ${e.description},
       ${JSON.stringify(e.bullets ?? [])}::jsonb,
       ${e.image?.src ?? ""}, ${e.image?.alt ?? ""},
       ${position ?? 0})
    ON CONFLICT (slug) DO UPDATE SET
      title       = EXCLUDED.title,
      short_title = EXCLUDED.short_title,
      company     = EXCLUDED.company,
      year_pill   = EXCLUDED.year_pill,
      dates       = EXCLUDED.dates,
      location    = EXCLUDED.location,
      context     = EXCLUDED.context,
      featured    = EXCLUDED.featured,
      description = EXCLUDED.description,
      bullets     = EXCLUDED.bullets,
      image_src   = EXCLUDED.image_src,
      image_alt   = EXCLUDED.image_alt,
      updated_at  = NOW()
  `;
}

export async function deleteExperience(slug: string) {
  await sql`DELETE FROM experience_entries WHERE slug = ${slug}`;
}

/** Bulk reorder — accepts an ordered slugs list, sets `position` to
 *  each slug's index. Out-of-list rows are left untouched. */
export async function setExperienceOrder(slugs: string[]) {
  for (let i = 0; i < slugs.length; i++) {
    await sql`UPDATE experience_entries
              SET position = ${i}, updated_at = NOW()
              WHERE slug = ${slugs[i]}`;
  }
}

/* ── Site settings — generic key/value, editable from admin ───────── */

export const DEFAULT_CV_URL = "/files/Sam-ahhee-Schneider-CV.pdf";

/** Read a site setting. Falls back to the provided default when the DB
 *  isn't configured, the table doesn't exist yet, or the key is unset. */
export async function getSiteSetting(
  key: string,
  fallback = "",
): Promise<string> {
  if (!dbConfigured()) return fallback;
  try {
    const { rows } = await sql<{ value: string }>`
      SELECT value FROM site_settings WHERE key = ${key} LIMIT 1
    `;
    const v = rows[0]?.value?.trim();
    return v && v.length > 0 ? v : fallback;
  } catch {
    return fallback;
  }
}

export async function setSiteSetting(key: string, value: string) {
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${key}, ${value}, NOW())
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_at = NOW()
  `;
}

/** Convenience — the CV download URL shown in the site header. If the
 *  stored value is a Vercel Blob URL, append `?download=…` so the
 *  browser forces a download (cross-origin `download=` attribute alone
 *  is ignored). Same-origin URLs are returned unchanged so the static
 *  `/files/…` default still works. */
export async function getCvUrl(): Promise<string> {
  const raw = await getSiteSetting("cv_url", DEFAULT_CV_URL);
  if (/blob\.vercel-storage\.com/.test(raw) && !/[?&]download=/.test(raw)) {
    const sep = raw.includes("?") ? "&" : "?";
    return `${raw}${sep}download=Sam-ahhee-Schneider-CV.pdf`;
  }
  return raw;
}

/** Find the slug immediately above or below a given slug in the
 *  ordered list. Returns null if at the edge.
 *
 *  Uses the full (admin) list — drafts included — so the indices match
 *  the admin reorder UI, not the public-facing filtered list. */
export async function neighborSlug(
  kind: "projects" | "case_studies",
  slug: string,
  dir: -1 | 1,
): Promise<string | null> {
  const ordered =
    kind === "projects"
      ? (await getAllProjects()).map((p) => p.slug)
      : (await getAllCaseStudies()).map((c) => c.slug);
  const idx = ordered.indexOf(slug);
  if (idx === -1) return null;
  const j = idx + dir;
  if (j < 0 || j >= ordered.length) return null;
  return ordered[j];
}
