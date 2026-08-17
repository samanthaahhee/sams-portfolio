"use client";

/** Pixel dimensions of a file the visitor just picked.
 *
 *  Videos do not load through Image(); they report videoWidth only once
 *  metadata arrives, so they need their own path. */
export function readMediaDims(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const done = (width: number, height: number) => {
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    const fail = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the file's dimensions"));
    };
    /* A video reports its size on loadedmetadata, not via Image(). */
    if (file.type.startsWith("video/")) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => done(v.videoWidth, v.videoHeight);
      v.onerror = fail;
      v.src = url;
      return;
    }
    const img = new Image();
    img.onload = () => done(img.naturalWidth, img.naturalHeight);
    img.onerror = fail;
    img.src = url;
  });
}
