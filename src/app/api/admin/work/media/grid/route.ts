import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { saveGridPlacements, setWorkGridTemplate } from "@/lib/db-portfolio";

type Placement = { id: number; gridColStart: number | null; gridColSpan: number; gridRowStart: number | null; gridRowSpan: number };

type Body = {
  projectId: number;
  projectSlug?: string;
  columns: number;
  rows: number;
  placements: Placement[];
};

/** Saves the freeform bento builder in one call: the project's canvas
 *  size (work_grid_template) plus every media item's grid placement. */
export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  if (!body.projectId || !body.columns || !body.rows || !Array.isArray(body.placements)) {
    return NextResponse.json(
      { error: "projectId, columns, rows, and placements[] are required" },
      { status: 400 },
    );
  }

  await setWorkGridTemplate(body.projectId, { columns: body.columns, rows: body.rows });
  await saveGridPlacements(body.placements);

  revalidatePath("/work");
  if (body.projectSlug) revalidatePath(`/work/${body.projectSlug}`);
  return NextResponse.json({ ok: true });
}
