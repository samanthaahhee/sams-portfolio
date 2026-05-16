import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { swapProjectPositions, neighborSlug } from "@/lib/db";

export async function POST(req: Request) {
  const { slug, dir } = (await req.json()) as { slug: string; dir: -1 | 1 };
  if (!slug || (dir !== -1 && dir !== 1)) {
    return NextResponse.json({ error: "Missing slug or dir" }, { status: 400 });
  }
  const neighbour = await neighborSlug("projects", slug, dir);
  if (!neighbour) return NextResponse.json({ ok: true, moved: false });
  await swapProjectPositions(slug, neighbour);
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, moved: true });
}
