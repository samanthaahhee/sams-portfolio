/**
 * Natural-aspect-ratio media block. Renders one or more images / GIFs
 * at their intrinsic aspect ratio (no forced 16:10). Choose `vertical`
 * to stack top-to-bottom, or `horizontal` for a side-by-side row.
 *
 * GIFs animate automatically since we render with a plain <img>.
 */
export function MediaRow({
  images,
  layout,
  caption,
}: {
  images: string[];
  layout: "vertical" | "horizontal";
  caption?: string;
}) {
  const valid = images.filter(Boolean);
  if (valid.length === 0) return null;

  return (
    <figure className="space-y-2">
      <div
        className={
          layout === "horizontal"
            ? "flex flex-col md:flex-row gap-2 md:gap-3 items-start"
            : "flex flex-col gap-2 md:gap-3 items-center"
        }
      >
        {valid.map((src, i) => (
          <div
            key={src + i}
            className={
              layout === "horizontal"
                ? "flex-1 min-w-0 w-full"
                : "w-full"
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              className="block w-full h-auto rounded-sm"
              style={{ maxWidth: "100%" }}
            />
          </div>
        ))}
      </div>
      {caption && (
        <figcaption className="font-mono text-[color:var(--meta)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
