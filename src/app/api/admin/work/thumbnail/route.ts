import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setProjectThumbnail } from "@/lib/db-portfolio";

/** Set (or clear) the homepage thumbnail and its crop.
 *  Body: { projectId, url | null, focalX?, focalY?, projectSlug? } */
export async function POST(req: Request) {
  const body = (await req.json()) as {
    projectId?: number;
    url?: string | null;
    focalX?: number;
    focalY?: number;
    projectSlug?: string;
  };
  if (!body.projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }
  await setProjectThumbnail(body.projectId, body.url ?? null, body.focalX ?? 0.5, body.focalY ?? 0.5);
  /* The grid lives on the homepage, so that is the page to bust. */
  revalidatePath("/");
  revalidatePath("/work");
  if (body.projectSlug) revalidatePath(`/work/${body.projectSlug}`);
  return NextResponse.json({ ok: true });
}
