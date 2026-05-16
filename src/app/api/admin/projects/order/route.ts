import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setOrder } from "@/lib/db";

/** Bulk reorder. Body: { slugs: string[] } — index becomes new position. */
export async function POST(req: Request) {
  const { slugs } = (await req.json()) as { slugs?: string[] };
  if (!Array.isArray(slugs) || slugs.some((s) => typeof s !== "string")) {
    return NextResponse.json(
      { error: "Body must be { slugs: string[] }" },
      { status: 400 },
    );
  }
  await setOrder("projects", slugs);
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, count: slugs.length });
}
