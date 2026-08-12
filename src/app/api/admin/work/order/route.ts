import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setPortfolioProjectOrder } from "@/lib/db-portfolio";

/** Bulk reorder projects — index becomes order_index.
 *
 *  Accepts either { ids: number[] } or { slugs: string[] }. The shared
 *  drag list identifies rows by a `slug` field and sends that, which for
 *  projects holds the numeric id as a string; this route used to demand
 *  numbers, so every drag 400'd and silently reverted. */
export async function POST(req: Request) {
  const body = (await req.json()) as { ids?: unknown[]; slugs?: unknown[] };
  const raw = body.ids ?? body.slugs;
  if (!Array.isArray(raw) || raw.length === 0) {
    return NextResponse.json({ error: "Body must be { ids: number[] }" }, { status: 400 });
  }

  const ids = raw.map(Number);
  if (ids.some((n) => !Number.isInteger(n))) {
    return NextResponse.json({ error: "Every id must be a whole number" }, { status: 400 });
  }

  await setPortfolioProjectOrder(ids);
  /* The homepage grid IS this order, so it has to be busted as well. */
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/admin/work");
  revalidatePath("/admin");
  return NextResponse.json({ ok: true, count: ids.length });
}
