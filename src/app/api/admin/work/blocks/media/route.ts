import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createBlockMedia, deletePortfolioMedia } from "@/lib/db-portfolio";

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
  const id = await createBlockMedia({
    projectId: body.projectId,
    blockId: body.blockId,
    position: body.position ?? 0,
    url: body.url,
    width: body.width ?? null,
    height: body.height ?? null,
  });
  revalidatePath("/work");
  if (body.projectSlug) revalidatePath(`/work/${body.projectSlug}`);
  return NextResponse.json({ id });
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
