"use client";

/**
 * Small "Back to top" button. Renders inline at the bottom of project
 * and case-study pages, so it appears once the user has finished
 * reading. Smooth-scrolls to the top of the document; reduced-motion
 * users get an instant jump via the global scroll-behavior reset.
 */
export function BackToTop({
  label = "Back to top",
}: {
  label?: string;
}) {
  return (
    <div className="px-[var(--spacing-page)] pb-12 md:pb-16 flex justify-center">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top of page"
        className="group inline-flex items-center gap-2 font-mono uppercase tracking-[0.14em] text-[10px] px-4 py-2.5 rounded-full border transition-colors hover:border-[color:var(--ink)]"
        style={{ borderColor: "var(--rule)", color: "var(--ink-soft)" }}
      >
        <span
          aria-hidden
          className="transition-transform duration-300 group-hover:-translate-y-0.5"
        >
          ↑
        </span>
        <span className="group-hover:text-[color:var(--ink)] transition-colors">
          {label}
        </span>
      </button>
    </div>
  );
}
