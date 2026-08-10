import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setProjectCover } from "@/lib/db-portfolio";

/** Set a project's cover image — the homepage thumbnail and page hero.
 *  Body: { projectId, url, width?, height?, projectSlug? } */
export async function POST(req: Request) {
  const body = (await req.json()) as {
    projectId?: number;
    url?: string;
    width?: number | null;
    height?: number | null;
    projectSlug?: string;
  };
  if (!body.projectId || !body.url) {
    return NextResponse.json({ error: "projectId and url are required" }, { status: 400 });
  }
  await setProjectCover(body.projectId, body.url, body.width ?? null, body.height ?? null);
  /* The homepage grid reads covers, so it has to be busted too. */
  revalidatePath("/");
  revalidatePath("/work");
  if (body.projectSlug) revalidatePath(`/work/${body.projectSlug}`);
  return NextResponse.json({ ok: true });
}
