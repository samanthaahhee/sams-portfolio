import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@vercel/postgres";
import { upsertCaseStudy, deleteCaseStudy } from "@/lib/db";
import type { CaseStudy } from "@/lib/case-studies";

/** Invalidate every public surface that lists or renders case studies. */
function revalidateCaseStudySurfaces(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/work/[slug]", "page");
  if (slug) revalidatePath(`/work/${slug}`);
  revalidatePath("/admin", "layout");
}

type Body = CaseStudy & {
  _mode: "create" | "edit";
  _originalSlug?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  if (
    !body.slug ||
    !body.no ||
    !body.title ||
    !body.client ||
    !body.year ||
    !body.primaryRole ||
    !body.category ||
    !body.tags ||
    body.tags.length === 0 ||
    !body.summary ||
    !body.palette
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Rename: drop old slug if changed during edit
  if (body._mode === "edit" && body._originalSlug && body._originalSlug !== body.slug) {
    await sql`DELETE FROM case_studies WHERE slug = ${body._originalSlug}`;
  }

  // Position — append on create, preserve on edit
  let position = 0;
  if (body._mode === "create") {
    const { rows } = await sql<{ max: number | null }>`
      SELECT MAX(position) as max FROM case_studies
    `;
    position = (rows[0]?.max ?? -1) + 1;
  } else {
    const { rows } = await sql<{ position: number }>`
      SELECT position FROM case_studies WHERE slug = ${body.slug}
    `;
    position = rows[0]?.position ?? 0;
  }

  await upsertCaseStudy(
    {
      slug: body.slug,
      no: body.no,
      title: body.title,
      client: body.client,
      year: body.year,
      role: body.role ?? [],
      primaryRole: body.primaryRole,
      category: body.category,
      tags: body.tags,
      summary: body.summary,
      palette: body.palette,
      customColors: body.customColors,
      cover: body.cover ?? "",
      context: body.context ?? "",
      problem: body.problem ?? "",
      approach: body.approach ?? "",
      decisions: body.decisions ?? [],
      outcome: body.outcome ?? "",
      reflection: body.reflection ?? "",
      gallery: body.gallery,
      comparisons: body.comparisons,
      visuals: body.visuals,
      link: body.link,
      published: body.published !== false,
    },
    position,
  );

  revalidateCaseStudySurfaces(body.slug);
  if (body._originalSlug && body._originalSlug !== body.slug) {
    revalidateCaseStudySurfaces(body._originalSlug);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  await deleteCaseStudy(slug);
  revalidateCaseStudySurfaces(slug);
  return NextResponse.json({ ok: true });
}
