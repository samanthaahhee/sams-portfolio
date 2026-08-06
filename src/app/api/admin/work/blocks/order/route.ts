import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setBlockOrder } from "@/lib/db-portfolio";

/** Reorder a project's blocks. Body: { projectId, ids: number[], projectSlug? } */
export async function POST(req: Request) {
  const { projectId, ids, projectSlug } = (await req.json()) as {
    projectId?: number;
    ids?: number[];
    projectSlug?: string;
  };
  if (!projectId || !Array.isArray(ids) || ids.some((n) => typeof n !== "number")) {
    return NextResponse.json({ error: "Body must be { projectId, ids: number[] }" }, { status: 400 });
  }
  await setBlockOrder(projectId, ids);
  revalidatePath("/work");
  if (projectSlug) revalidatePath(`/work/${projectSlug}`);
  return NextResponse.json({ ok: true, count: ids.length });
}
