import Link from "next/link";
import { getCvUrl } from "@/lib/db";

/**
 * Universal site header — same composition as the landing-hero nav
 * (SAM AHHEE monogram top-left, Work · Experience · Contact top-right)
 * so every page reads with one consistent menu bar.
 *
 * `tone` lets a page tell the header whether it's sitting on a light
 * (paper) or dark canvas, so the monogram and nav text invert
 * accordingly. Default is "light" — the bulk of the site.
 */
export async function SiteHeader({
  tone = "light",
}: {
  tone?: "light" | "dark";
  /** Kept for backwards-compat; ignored. */
  pageNo?: string;
} = {}) {
  const cvUrl = await getCvUrl();
  const isDark = tone === "dark";
  return (
    <header
      className={
        isDark
          ? "sticky top-0 z-50 backdrop-blur-md bg-transparent"
          : "sticky top-0 z-50 backdrop-blur-md bg-[color:var(--paper)]/85 border-b border-[color:var(--rule)]"
      }
    >
      <div
        className="flex items-center justify-between gap-6 px-[var(--spacing-page)] py-4"
        style={{ minHeight: 64 }}
      >
        <Link
          href="/"
          aria-label="Sam Ahhee — home"
          className="hover:opacity-75 transition-opacity"
        >
          {/* Source SVG is mid-grey #D9D9D9. On the paper canvas we
              invert it to solid ink; on a dark canvas we wash it to
              pure white so it stays legible. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero/sam-ahhee-logo.svg"
            alt="Sam Ahhee"
            className="h-10 md:h-12 w-auto"
            style={{
              filter: isDark
                ? "brightness(0) invert(1)"
                : "brightness(0)",
            }}
          />
        </Link>
        <nav
          className={
            "flex items-center gap-8 md:gap-12 font-sans font-normal text-sm md:text-base " +
            (isDark ? "text-white" : "text-[color:var(--ink)]")
          }
        >
          <Link
            href="/#selected-work"
            className="hover:opacity-70 transition-opacity"
          >
            Work
          </Link>
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity"
          >
            Experience
          </a>
          <Link
            href="/contact"
            className="hover:opacity-70 transition-opacity"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
