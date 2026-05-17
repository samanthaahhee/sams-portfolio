import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@vercel/postgres";
import {
  deleteExperience,
  upsertExperience,
} from "@/lib/db";
import type { ExperienceEntry } from "@/lib/about";

type Body = ExperienceEntry & {
  slug: string;
  _mode: "create" | "edit";
  _originalSlug?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  if (!body.slug || !body.title || !body.company || !body.yearPill) {
    return NextResponse.json(
      { error: "slug, title, company, and yearPill are required" },
      { status: 400 },
    );
  }

  // Append to end on create, preserve position on edit.
  let position = 0;
  if (body._mode === "create") {
    const { rows } = await sql<{ max: number | null }>`
      SELECT MAX(position) as max FROM experience_entries
    `;
    position = (rows[0]?.max ?? -1) + 1;
  } else {
    const { rows } = await sql<{ position: number }>`
      SELECT position FROM experience_entries WHERE slug = ${body.slug}
    `;
    position = rows[0]?.position ?? 0;
  }

  await upsertExperience(
    {
      slug: body.slug,
      title: body.title,
      shortTitle: body.shortTitle || body.title,
      company: body.company,
      yearPill: body.yearPill,
      dates: body.dates ?? "",
      location: body.location ?? "",
      context: body.context ?? "",
      featured: body.featured ?? false,
      description: body.description ?? "",
      bullets: body.bullets ?? [],
      image: body.image ?? { src: "", alt: "" },
    },
    position,
  );

  revalidatePath("/about", "page");
  revalidatePath("/admin/experience", "layout");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug)
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  await deleteExperience(slug);
  revalidatePath("/about", "page");
  revalidatePath("/admin/experience", "layout");
  return NextResponse.json({ ok: true });
}
