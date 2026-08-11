import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createBlock, updateBlock, deleteBlock, type BlockLayout } from "@/lib/db-portfolio";

const LAYOUTS: BlockLayout[] = [
  "single",
  "portrait_landscape",
  "landscape_portrait",
  "split",
  "portrait_trio",
  "portrait_portrait",
  "compare",
  "stack",
  "native",
];

function bust(slug?: string | null) {
  revalidatePath("/work");
  if (slug) revalidatePath(`/work/${slug}`);
}

/** Create a block. Body: { projectId, kind: 'images'|'text', layout?, projectSlug? } */
export async function POST(req: Request) {
  const body = (await req.json()) as {
    projectId?: number;
    kind?: "images" | "text";
    layout?: BlockLayout;
    projectSlug?: string;
  };
  if (!body.projectId || (body.kind !== "images" && body.kind !== "text")) {
    return NextResponse.json({ error: "projectId and kind ('images'|'text') are required" }, { status: 400 });
  }
  const layout = body.kind === "images" ? (LAYOUTS.includes(body.layout as BlockLayout) ? body.layout! : "single") : null;
  const id = await createBlock(body.projectId, body.kind, layout);
  bust(body.projectSlug);
  return NextResponse.json({ id });
}

/** Patch a block's layout or copy. Body: { id, layout?, heading?, body?, projectSlug? } */
export async function PATCH(req: Request) {
  const payload = (await req.json()) as {
    id?: number;
    layout?: BlockLayout;
    heading?: string | null;
    body?: string | null;
    projectSlug?: string;
  };
  if (!payload.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await updateBlock(payload.id, {
    layout: LAYOUTS.includes(payload.layout as BlockLayout) ? payload.layout : undefined,
    heading: payload.heading ?? null,
    body: payload.body ?? null,
  });
  bust(payload.projectSlug);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await deleteBlock(id);
  bust(url.searchParams.get("projectSlug"));
  return NextResponse.json({ ok: true });
}
