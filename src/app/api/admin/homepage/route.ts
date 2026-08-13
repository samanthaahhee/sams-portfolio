import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setAboutSection, type AboutSection } from "@/lib/db-portfolio";

/** Save the homepage about panel. Body: AboutSection. */
export async function POST(req: Request) {
  const b = (await req.json()) as Partial<AboutSection>;
  await setAboutSection({
    intro: (b.intro ?? "").toString(),
    fields: Array.isArray(b.fields) ? b.fields : [],
    services: Array.isArray(b.services) ? b.services : [],
    linkLabel: (b.linkLabel ?? "").toString(),
    linkHref: (b.linkHref ?? "").toString(),
    afterRows: Math.max(0, Math.round(Number(b.afterRows) || 0)),
  });
  /* The panel lives on the homepage, so that is the page to bust. */
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
