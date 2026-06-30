import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  deleteHeroCard,
  insertHeroCard,
  updateHeroCard,
} from "@/lib/db";

type Body = {
  id?: number;
  imageUrl: string;
  title: string;
  href: string;
  client?: string | null;
  accentColor?: string | null;
  bgColor?: string | null;
  /** ["#start","#mid","#end"] or null/empty to clear. */
  bgGradient?: string[] | null;
};

function normalize(b: Body) {
  const grad = Array.isArray(b.bgGradient)
    ? b.bgGradient.map((s) => (typeof s === "string" ? s.trim() : ""))
    : null;
  // Only persist if every stop is a non-empty string (avoids ["","",""] junk).
  const cleanGrad =
    grad && grad.length >= 2 && grad.every((s) => s.length > 0)
      ? grad
      : null;
  return {
    imageUrl: b.imageUrl,
    title: b.title,
    href: b.href || "#",
    client: b.client?.trim() ? b.client.trim() : null,
    accentColor: b.accentColor?.trim() ? b.accentColor.trim() : null,
    bgColor: b.bgColor?.trim() ? b.bgColor.trim() : null,
    bgGradient: cleanGrad,
  };
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  if (!body.imageUrl || !body.title) {
    return NextResponse.json(
      { error: "imageUrl and title are required" },
      { status: 400 },
    );
  }

  if (body.id) {
    await updateHeroCard(body.id, normalize(body));
  } else {
    const id = await insertHeroCard(normalize(body));
    revalidatePath("/hero-preview", "page");
    revalidatePath("/admin/hero", "layout");
    return NextResponse.json({ ok: true, id });
  }

  revalidatePath("/hero-preview", "page");
  revalidatePath("/admin/hero", "layout");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await deleteHeroCard(id);
  revalidatePath("/hero-preview", "page");
  revalidatePath("/admin/hero", "layout");
  return NextResponse.json({ ok: true });
}
