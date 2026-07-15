import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setPortfolioProjectOrder } from "@/lib/db-portfolio";

/** Bulk reorder projects. Body: { ids: number[] } — index becomes order_index. */
export async function POST(req: Request) {
  const { ids } = (await req.json()) as { ids?: number[] };
  if (!Array.isArray(ids) || ids.some((n) => typeof n !== "number")) {
    return NextResponse.json({ error: "Body must be { ids: number[] }" }, { status: 400 });
  }
  await setPortfolioProjectOrder(ids);
  revalidatePath("/work");
  revalidatePath("/admin/work");
  return NextResponse.json({ ok: true, count: ids.length });
}
