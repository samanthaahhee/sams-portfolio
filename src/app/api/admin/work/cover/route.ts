import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setProjectCover } from "@/lib/db-portfolio";

/** Set a project's cover image — the homepage thumbnail and page hero.
 *  Body: { projectId, url, width?, height?, projectSlug? } */
export async function POST(req: Request) {
  const body = (await req.json()) as {
    projectId?: number;
    url?: string | null;
    width?: number | null;
    height?: number | null;
    focalX?: number;
    focalY?: number;
    zoom?: number;
    projectSlug?: string;
  };
  if (!body.projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }
  await setProjectCover(
    body.projectId,
    body.url ?? null,
    body.width ?? null,
    body.height ?? null,
    body.focalX ?? 0.5,
    body.focalY ?? 0.5,
    body.zoom ?? 1,
  );
  /* The homepage grid reads covers, so it has to be busted too. */
  revalidatePath("/");
  revalidatePath("/work");
  if (body.projectSlug) revalidatePath(`/work/${body.projectSlug}`);
  return NextResponse.json({ ok: true });
}
