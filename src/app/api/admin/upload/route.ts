import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put } from "@vercel/blob";

/**
 * Simple server-side upload. The browser POSTs FormData with one file
 * field named "file". We forward it to Vercel Blob and return the
 * public URL.
 *
 * Limit: 4.5 MB per file (Vercel serverless body cap). For larger
 * uploads we could switch back to client-direct uploads, but for normal
 * portfolio imagery this is the simpler, more reliable path.
 */
export async function POST(req: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN env var is not set. Provision Vercel Blob and run 'vercel env pull'.",
      },
      { status: 500 },
    );
  }

  // Auth — this route is exempt from the middleware so we check here.
  const cookieStore = await cookies();
  const session = cookieStore.get("admin-session")?.value;
  if (session !== "ok") {
    return NextResponse.json(
      { error: "Unauthorized — sign in to upload" },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data — expected multipart/form-data" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json(
      {
        error:
          `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Uploads go through a serverless function, ` +
          `which caps the body at 4.5 MB. For a video, shortening the clip or exporting at a lower bitrate is ` +
          `usually enough — a few seconds of muted loop should sit well under it.`,
      },
      { status: 413 },
    );
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const base = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]/gi, "-")
    .toLowerCase()
    .slice(0, 60);
  const pathname = `portfolio/${Date.now()}-${base}.${ext}`;

  try {
    // addRandomSuffix: true so every upload gets a unique URL even if
    // the filename + timestamp collide — otherwise Vercel Blob will
    // overwrite the existing path AND the CDN will keep serving the
    // old cached file under the same URL.
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Blob upload failed";
    console.error("[blob] put() failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
