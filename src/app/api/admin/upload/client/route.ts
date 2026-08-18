import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

/**
 * Hands the browser a short-lived token so it can upload straight to Blob
 * storage.
 *
 * The other upload route streams the file through a serverless function,
 * which caps its request body at 4.5 MB — fine for stills, useless for
 * video. Going direct skips the function entirely, so the only limit is
 * the one set below.
 *
 * Exempt from the admin middleware (it matches /api/admin/upload), so the
 * session is checked here.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not set on the server." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        /* Checked per token request, not once per session: a token is
           what actually authorises a write. */
        const session = (await cookies()).get("admin-session")?.value;
        if (session !== "ok") throw new Error("Unauthorized — sign in to upload");
        return {
          allowedContentTypes: [
            "image/png",
            "image/jpeg",
            "image/gif",
            "image/webp",
            "image/avif",
            "image/svg+xml",
            "video/mp4",
            "video/webm",
            "video/quicktime",
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 200 * 1024 * 1024,
        };
      },
      /* Required by the helper. Nothing to do: the browser already has
         the URL and saves it through the normal media routes. Vercel
         cannot call this on localhost anyway. */
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
