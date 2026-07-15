import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setPortfolioMediaOrder } from "@/lib/db-portfolio";

/** Bulk reorder media within one project+surface. Body: { ids: number[], projectSlug?: string } */
export async function POST(req: Request) {
  const { ids, projectSlug } = (await req.json()) as { ids?: number[]; projectSlug?: string };
  if (!Array.isArray(ids) || ids.some((n) => typeof n !== "number")) {
    return NextResponse.json({ error: "Body must be { ids: number[] }" }, { status: 400 });
  }
  await setPortfolioMediaOrder(ids);
  revalidatePath("/work");
  if (projectSlug) revalidatePath(`/work/${projectSlug}`);
  return NextResponse.json({ ok: true, count: ids.length });
}
