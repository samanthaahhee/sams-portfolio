import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSiteSetting, setSiteSetting, DEFAULT_CV_URL } from "@/lib/db";
import { revalidatePath } from "next/cache";

/** Whitelist of keys the admin UI is allowed to read/write. Adding a
 *  new editable setting? Add its key here. */
const ALLOWED_KEYS = new Set(["cv_url"]);

async function assertAuthed() {
  const c = await cookies();
  if (c.get("admin-session")?.value !== "ok") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const unauth = await assertAuthed();
  if (unauth) return unauth;

  const cv_url = await getSiteSetting("cv_url", "");
  return NextResponse.json({
    cv_url,
    defaults: { cv_url: DEFAULT_CV_URL },
  });
}

export async function PATCH(req: Request) {
  const unauth = await assertAuthed();
  if (unauth) return unauth;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!ALLOWED_KEYS.has(k)) continue;
    if (typeof v !== "string") {
      return NextResponse.json(
        { error: `Value for "${k}" must be a string` },
        { status: 400 },
      );
    }
    updates[k] = v.trim();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No recognised settings keys in payload" },
      { status: 400 },
    );
  }

  for (const [k, v] of Object.entries(updates)) {
    await setSiteSetting(k, v);
  }

  // The header reads cv_url, so bust caches for every public route.
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, updated: updates });
}
