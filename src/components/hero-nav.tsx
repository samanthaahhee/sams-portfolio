/**
 * Shared header used on the landing hero and the /about-me page —
 * title block on the left, primary nav on the right. Tone-aware so
 * it adapts to the page's background (dark hero vs light about
 * canvas).
 */

import Link from "next/link";

export function HeroNav({
  tone = "dark",
}: {
  /** "dark" = white type for use over a dark hero. "light" = ink
   *  type for use on paper backgrounds. */
  tone?: "dark" | "light";
}) {
  const titleClass =
    tone === "dark" ? "text-white" : "text-[color:var(--ink)]";
  const subtitleClass =
    tone === "dark" ? "text-white/75" : "text-[color:var(--meta)]";

  return (
    <div
      className={`flex items-start justify-between gap-6 ${titleClass}`}
    >
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <p
          className="font-display font-bold tracking-[-0.02em] leading-none"
          style={{ fontSize: "clamp(1.5rem, 2.2vw, 2rem)" }}
        >
          Sam Ahhee
        </p>
        <p className={`mt-1.5 text-xs md:text-sm ${subtitleClass}`}>
          Visual Comms Designer
        </p>
      </Link>

      <nav className="flex items-center gap-6 md:gap-10 font-display font-normal text-sm md:text-base">
        <Link
          href="/#selected-work"
          className="hover:opacity-70 transition-opacity"
        >
          Work
        </Link>
        <a
          href="/files/Sam-ahhee-Schneider-CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
        >
          Experience
        </a>
        <Link
          href="/about-me"
          className="hover:opacity-70 transition-opacity"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="hover:opacity-70 transition-opacity"
        >
          Contact
        </Link>
      </nav>
    </div>
  );
}
