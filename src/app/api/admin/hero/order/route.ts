import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setHeroCardsOrder } from "@/lib/db";

export async function POST(req: Request) {
  const { ids } = (await req.json()) as { ids?: number[] };
  if (!Array.isArray(ids) || ids.some((x) => typeof x !== "number")) {
    return NextResponse.json(
      { error: "Body must be { ids: number[] }" },
      { status: 400 },
    );
  }
  await setHeroCardsOrder(ids);
  revalidatePath("/hero-preview", "page");
  revalidatePath("/admin/hero", "layout");
  return NextResponse.json({ ok: true });
}
