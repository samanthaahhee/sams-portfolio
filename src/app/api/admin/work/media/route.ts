import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { upsertPortfolioMedia, deletePortfolioMedia, type PortfolioMedia } from "@/lib/db-portfolio";

type Body = Omit<PortfolioMedia, "id"> & { id?: number; projectSlug?: string };

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  if (!body.url || !body.projectId || !body.surface) {
    return NextResponse.json({ error: "projectId, surface, and url are required" }, { status: 400 });
  }

  await upsertPortfolioMedia({
    id: body.id,
    projectId: body.projectId,
    surface: body.surface,
    slotId: body.slotId ?? null,
    type: body.type ?? "image",
    url: body.url,
    width: body.width ?? null,
    height: body.height ?? null,
    aspectRatio: body.aspectRatio ?? null,
    orderIndex: body.orderIndex ?? 0,
    gridColStart: body.gridColStart ?? null,
    gridColSpan: body.gridColSpan ?? 1,
    gridRowStart: body.gridRowStart ?? null,
    gridRowSpan: body.gridRowSpan ?? 1,
    frameIndex: body.frameIndex ?? 0,
    focalX: body.focalX ?? 0.5,
    focalY: body.focalY ?? 0.5,
    zoom: body.zoom ?? 1,
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
  await deletePortfolioMedia(id);
  revalidatePath("/work");
  if (projectSlug) revalidatePath(`/work/${projectSlug}`);
  return NextResponse.json({ ok: true });
}
