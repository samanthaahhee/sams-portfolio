import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAboutSection, setAboutSection, type AboutSection } from "@/lib/db-portfolio";

/** Save the homepage about panel.
 *
 *  Merges rather than replaces: the grid only ever sends the position it
 *  just dragged the panel to, and sending a partial body should not blank
 *  the copy it did not mention. */
export async function POST(req: Request) {
  const b = (await req.json()) as Partial<AboutSection>;
  const current = await getAboutSection();
  await setAboutSection({
    intro: b.intro ?? current.intro,
    fields: Array.isArray(b.fields) ? b.fields : current.fields,
    services: Array.isArray(b.services) ? b.services : current.services,
    linkLabel: b.linkLabel ?? current.linkLabel,
    linkHref: b.linkHref ?? current.linkHref,
    afterRows:
      b.afterRows === undefined
        ? current.afterRows
        : Math.max(0, Math.round(Number(b.afterRows) || 0)),
  });
  /* The panel lives on the homepage, and the admin grid mirrors it. */
  revalidatePath("/");
  revalidatePath("/admin/work");
  revalidatePath("/admin/homepage");
  return NextResponse.json({ ok: true });
}
