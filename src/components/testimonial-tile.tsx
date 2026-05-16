import type { Testimonial } from "@/lib/about";

/**
 * Testimonial tile. If `quote` is empty, renders a dashed-border
 * placeholder with --pair-b accents so it's obvious in-page that
 * something still needs to be pasted in.
 */
export function TestimonialTile({ t }: { t: Testimonial }) {
  const isPlaceholder = !t.quote.trim();
  return (
    <article
      className={`relative rounded-sm p-6 md:p-8 ${
        isPlaceholder ? "" : "border"
      }`}
      style={{
        borderStyle: isPlaceholder ? "dashed" : "solid",
        borderWidth: "1.5px",
        borderColor: isPlaceholder ? "var(--pair-b)" : "var(--rule)",
      }}
    >
      {/* Decorative open-quote — display weight, low opacity so it
          reads as background mark not body copy. */}
      <span
        aria-hidden
        className="font-display absolute top-2 left-4 select-none"
        style={{
          fontSize: "clamp(3rem, 6vw, 4.5rem)",
          color: "var(--pair-b)",
          opacity: 0.4,
          lineHeight: 1,
          fontWeight: 700,
        }}
      >
        &ldquo;
      </span>

      <blockquote
        className={`relative pt-8 text-base md:text-lg leading-relaxed ${
          isPlaceholder
            ? "italic text-[color:var(--ink-muted)]"
            : "text-[color:var(--ink)]"
        }`}
      >
        {isPlaceholder ? (
          "[Paste LinkedIn recommendation here]"
        ) : (
          t.quote
        )}
      </blockquote>

      <div
        className="mt-6 pt-4"
        style={{ borderTop: "1px solid var(--rule)" }}
      >
        <p className="font-mono text-[color:var(--ink)]">{t.name}</p>
        <p className="font-mono text-[color:var(--meta)]">{t.role}</p>
      </div>
    </article>
  );
}
