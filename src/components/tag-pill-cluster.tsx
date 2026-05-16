"use client";

/**
 * Tag pill cluster — shows the primary tag plus a "+N" badge when
 * there are extra tags. On hover (of the parent `group`), the extras
 * fade in next to the primary and the "+N" fades out.
 *
 * Card components wrap their <Link> in a `group`, so we read from
 * group-hover here.
 */
export function TagPillCluster({
  tags,
  size = "md",
}: {
  tags: string[];
  size?: "md" | "lg";
}) {
  if (!tags || tags.length === 0) return null;
  const [primary, ...extras] = tags;

  const padding = size === "lg" ? "px-3 py-1.5" : "px-2.5 py-1";
  const top = size === "lg" ? "top-3 right-3" : "top-2.5 right-2.5";

  const pillStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.4)",
    color: "var(--ink)",
    backdropFilter: "blur(12px) saturate(140%)",
    WebkitBackdropFilter: "blur(12px) saturate(140%)",
  };

  return (
    <div className={`absolute ${top} flex items-center gap-1.5`}>
      {/* Extras — collapsed by default, expand on group hover */}
      {extras.length > 0 && (
        <div className="hidden group-hover:flex items-center gap-1.5">
          {extras.map((t) => (
            <span
              key={t}
              className={`font-mono ${padding} rounded-full whitespace-nowrap`}
              style={pillStyle}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Primary — always visible */}
      <span
        className={`font-mono ${padding} rounded-full whitespace-nowrap`}
        style={pillStyle}
      >
        {primary}
      </span>

      {/* +N badge — visible when there are extras, hidden on hover */}
      {extras.length > 0 && (
        <span
          className={`font-mono ${padding} rounded-full whitespace-nowrap group-hover:hidden`}
          style={pillStyle}
        >
          +{extras.length}
        </span>
      )}
    </div>
  );
}
