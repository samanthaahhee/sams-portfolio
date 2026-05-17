/**
 * YouTube embed — accepts any common YouTube URL form and renders a
 * privacy-enhanced (`youtube-nocookie.com`) 16:9 iframe.
 *
 * Recognised formats:
 *   - https://www.youtube.com/watch?v=ID
 *   - https://youtu.be/ID
 *   - https://www.youtube.com/embed/ID
 *   - https://www.youtube.com/shorts/ID
 *
 * Falls back to rendering nothing if the URL can't be parsed.
 */
export function YouTubeEmbed({
  url,
  caption,
}: {
  url: string;
  caption?: string;
}) {
  const id = extractYouTubeId(url);
  if (!id) return null;
  const src = `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
  return (
    <figure className="space-y-2">
      <div
        className="relative overflow-hidden rounded-sm"
        style={{ aspectRatio: "16 / 9", background: "transparent" }}
      >
        <iframe
          src={src}
          title={caption ?? "YouTube video"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
      {caption && (
        <figcaption className="font-mono text-[color:var(--meta)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Extract a YouTube video ID from any of the common URL shapes.
 *  Returns null if nothing matches — used both for rendering and for
 *  validation feedback in the admin editor. */
export function extractYouTubeId(input: string): string | null {
  const url = input.trim();
  if (!url) return null;

  // Bare 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

  try {
    const u = new URL(
      url.startsWith("http") ? url : `https://${url}`,
    );
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      // watch?v=ID
      const v = u.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      // /embed/ID  /shorts/ID  /v/ID
      const parts = u.pathname.split("/").filter(Boolean);
      const i = parts.findIndex((p) =>
        ["embed", "shorts", "v"].includes(p),
      );
      if (i >= 0 && parts[i + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[i + 1])) {
        return parts[i + 1];
      }
    }
  } catch {
    // fall through
  }
  return null;
}
