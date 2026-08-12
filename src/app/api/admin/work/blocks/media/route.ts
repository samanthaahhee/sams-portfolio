import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createBlockMedia, deletePortfolioMedia, setMediaCrop } from "@/lib/db-portfolio";

/** Drop an uploaded image into a block slot.
 *  Body: { projectId, blockId, position, url, width?, height?, projectSlug? } */
export async function POST(req: Request) {
  const body = (await req.json()) as {
    projectId?: number;
    blockId?: number;
    position?: number;
    url?: string;
    width?: number | null;
    height?: number | null;
    projectSlug?: string;
  };
  if (!body.projectId || !body.blockId || !body.url) {
    return NextResponse.json({ error: "projectId, blockId and url are required" }, { status: 400 });
  }
  const created = await createBlockMedia({
    projectId: body.projectId,
    blockId: body.blockId,
    position: body.position ?? 0,
    url: body.url,
    width: body.width ?? null,
    height: body.height ?? null,
  });
  revalidatePath("/work");
  if (body.projectSlug) revalidatePath(`/work/${body.projectSlug}`);
  return NextResponse.json(created);
}

/** Move a frame's crop focal point. Body: { id, focalX, focalY, projectSlug? } */
export async function PATCH(req: Request) {
  const body = (await req.json()) as {
    id?: number;
    focalX?: number;
    focalY?: number;
    zoom?: number;
    projectSlug?: string;
  };
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await setMediaCrop(body.id, body.focalX ?? 0.5, body.focalY ?? 0.5, body.zoom ?? 1);
  revalidatePath("/work");
  if (body.projectSlug) revalidatePath(`/work/${body.projectSlug}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  const projectSlug = url.searchParams.get("projectSlug");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await deletePortfolioMedia(id);
  revalidatePath("/work");
  if (projectSlug) revalidatePath(`/work/${projectSlug}`);
  return NextResponse.json({ ok: true });
}
