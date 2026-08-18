"use client";

import { upload } from "@vercel/blob/client";

/** Send a file straight to Blob storage and return its public URL.
 *
 *  Direct rather than through /api/admin/upload: that route streams the
 *  file through a serverless function, whose request body is capped at
 *  4.5 MB, which rules out video. This asks the server only for a
 *  short-lived token and then uploads from the browser, so the cap is
 *  the 200 MB set on the token. */
export async function uploadFile(file: File): Promise<string> {
  const blob = await upload(`portfolio/${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/admin/upload/client",
  });
  return blob.url;
}
