import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  upsertPortfolioProject,
  deletePortfolioProject,
  type PortfolioProjectInput,
} from "@/lib/db-portfolio";

function revalidateWorkSurfaces(slug?: string) {
  /* The homepage grid is built from these rows — its tiles, their order
     and the client/title pills on them — so renaming a project without
     busting "/" left the front page showing the old labels. */
  revalidatePath("/");
  revalidatePath("/work");
  if (slug) revalidatePath(`/work/${slug}`);
  revalidatePath("/admin/work");
  revalidatePath("/admin");
}

type Body = PortfolioProjectInput & {
  id?: number;
  _mode: "create" | "edit";
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  if (!body.slug || !body.title) {
    return NextResponse.json({ error: "Slug and title are required" }, { status: 400 });
  }

  const id = await upsertPortfolioProject({
    id: body._mode === "edit" ? body.id : undefined,
    slug: body.slug,
    title: body.title,
    discipline: body.discipline ?? "",
    client: body.client ?? "",
    role: body.role ?? "",
    year: body.year ?? "",
    orderIndex: body.orderIndex ?? 0,
    accentColor: body.accentColor ?? null,
    overviewHeading: body.overviewHeading ?? null,
    overviewBody: body.overviewBody ?? null,
    visible: body.visible !== false,
    workGridTemplate: body.workGridTemplate ?? null,
    deliverables: body.deliverables ?? [],
    creativeTeam: body.creativeTeam ?? [],
  });

  revalidateWorkSurfaces(body.slug);
  return NextResponse.json({ ok: true, id });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await deletePortfolioProject(id);
  revalidateWorkSurfaces();
  return NextResponse.json({ ok: true });
}
