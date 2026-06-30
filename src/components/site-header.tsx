import Link from "next/link";
import { getCvUrl } from "@/lib/db";

/**
 * Universal site header — same composition as the landing-hero nav
 * (SAM AHHEE monogram top-left, Work · Experience · Contact top-right)
 * so every page reads with one consistent menu bar.
 *
 * The hero on `/` renders its own copy of this layout (white over a
 * dark gradient). This file is the light-canvas version used on
 * every other page.
 */
export async function SiteHeader(_props: { pageNo?: string } = {}) {
  const cvUrl = await getCvUrl();
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md bg-[color:var(--paper)]/85 border-b border-[color:var(--rule)]"
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
          {/* Source SVG is mid-grey (#D9D9D9); brightness(0) inverts
              the fill to solid ink so it reads on the paper canvas. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero/sam-ahhee-logo.svg"
            alt="Sam Ahhee"
            className="h-10 md:h-12 w-auto"
            style={{ filter: "brightness(0)" }}
          />
        </Link>
        <nav className="flex items-center gap-8 md:gap-12 font-sans font-normal text-sm md:text-base text-[color:var(--ink)]">
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
