import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@vercel/postgres";
import { upsertProject, deleteProject } from "@/lib/db";
import type { Project } from "@/lib/projects";

/** Invalidate every public surface that lists or renders projects. */
function revalidateProjectSurfaces(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/projects/[slug]", "page");
  if (slug) revalidatePath(`/projects/${slug}`);
  revalidatePath("/admin", "layout");
}

type Body = Project & {
  _mode: "create" | "edit";
  _originalSlug?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  if (
    !body.slug ||
    !body.brand ||
    !body.title ||
    !body.tags ||
    body.tags.length === 0 ||
    !body.palette ||
    !body.description
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Rename: delete old slug if changed during edit
  if (body._mode === "edit" && body._originalSlug && body._originalSlug !== body.slug) {
    await sql`DELETE FROM projects WHERE slug = ${body._originalSlug}`;
  }

  // Determine position — append on create, preserve on edit
  let position = 0;
  if (body._mode === "create") {
    const { rows } = await sql<{ max: number | null }>`
      SELECT MAX(position) as max FROM projects
    `;
    position = (rows[0]?.max ?? -1) + 1;
  } else {
    const { rows } = await sql<{ position: number }>`
      SELECT position FROM projects WHERE slug = ${body.slug}
    `;
    position = rows[0]?.position ?? 0;
  }

  await upsertProject(
    {
      slug: body.slug,
      brand: body.brand,
      title: body.title,
      tags: body.tags,
      year: body.year,
      palette: body.palette,
      customColors: body.customColors,
      cover: body.cover,
      description: body.description,
      gallery: body.gallery ?? [],
      comparisons: body.comparisons,
      visuals: body.visuals,
      href: body.href,
      published: body.published !== false,
      no: body.no,
      client: body.client,
      role: body.role,
      primaryRole: body.primaryRole,
      category: body.category,
      summary: body.summary,
      context: body.context,
      problem: body.problem,
      approach: body.approach,
      decisions: body.decisions,
      outcome: body.outcome,
      reflection: body.reflection,
      link: body.link,
    },
    position,
  );

  revalidateProjectSurfaces(body.slug);
  if (body._originalSlug && body._originalSlug !== body.slug) {
    revalidateProjectSurfaces(body._originalSlug);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  await deleteProject(slug);
  revalidateProjectSurfaces(slug);
  return NextResponse.json({ ok: true });
}
