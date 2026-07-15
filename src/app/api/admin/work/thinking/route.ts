import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { upsertThinkingSection, deleteThinkingSection, type PortfolioThinkingSection } from "@/lib/db-portfolio";

type Body = Omit<PortfolioThinkingSection, "id"> & { id?: number; projectSlug?: string };

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  if (!body.projectId || !body.title) {
    return NextResponse.json({ error: "projectId and title are required" }, { status: 400 });
  }

  await upsertThinkingSection({
    id: body.id,
    projectId: body.projectId,
    title: body.title,
    body: body.body ?? "",
    imageUrl: body.imageUrl ?? null,
    orderIndex: body.orderIndex ?? 0,
  });

  revalidatePath("/work");
  if (body.projectSlug) revalidatePath(`/work/${body.projectSlug}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  const projectSlug = url.searchParams.get("projectSlug") ?? undefined;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await deleteThinkingSection(id);
  revalidatePath("/work");
  if (projectSlug) revalidatePath(`/work/${projectSlug}`);
  return NextResponse.json({ ok: true });
}
