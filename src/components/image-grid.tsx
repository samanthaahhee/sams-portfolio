/**
 * 3-up image grid for the unified visuals stream. Each cell is a
 * square; supports GIFs natively because we use a plain <img>.
 */
export function ImageGrid({
  images,
  caption,
}: {
  images: string[];
  caption?: string;
}) {
  const visible = images.filter(Boolean).slice(0, 3);
  if (visible.length === 0) return null;
  return (
    <figure className="space-y-2">
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {visible.map((src, i) => (
          <div
            key={src + i}
            className="relative overflow-hidden rounded-sm"
            style={{
              aspectRatio: "1 / 1",
              background: "var(--pair-a)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
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
