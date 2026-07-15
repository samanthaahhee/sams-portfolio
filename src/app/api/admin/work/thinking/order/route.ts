import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setThinkingSectionOrder } from "@/lib/db-portfolio";

export async function POST(req: Request) {
  const { ids, projectSlug } = (await req.json()) as { ids?: number[]; projectSlug?: string };
  if (!Array.isArray(ids) || ids.some((n) => typeof n !== "number")) {
    return NextResponse.json({ error: "Body must be { ids: number[] }" }, { status: 400 });
  }
  await setThinkingSectionOrder(ids);
  revalidatePath("/work");
  if (projectSlug) revalidatePath(`/work/${projectSlug}`);
  return NextResponse.json({ ok: true, count: ids.length });
}
