import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { getCvUrl } from "@/lib/db";

export async function SiteHeader({ pageNo = "00" }: { pageNo?: string }) {
  const cvUrl = await getCvUrl();
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[color:var(--paper)]/80 border-b border-[color:var(--rule)]">
      <div
        className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-[var(--spacing-page)] py-4"
        style={{ minHeight: 56 }}
      >
        <Link
          href="/"
          className="hidden md:inline font-mono text-[color:var(--meta)] hover:text-[color:var(--ink)] transition-colors"
        >
          My portfolio
        </Link>
        <nav className="font-mono flex items-center gap-6 text-[color:var(--ink-soft)]">
          <Link
            href="/"
            className="hover:text-[color:var(--ink)] transition-colors"
          >
            Work
          </Link>
          {/* Experience → direct PDF download via the anchor's `download`
              attribute. Browsers that respect it auto-download the file
              instead of opening it in a viewer. */}
          <a
            href={cvUrl}
            download="Sam-ahhee-Schneider-CV.pdf"
            className="inline-flex items-center gap-1.5 hover:text-[color:var(--ink)] transition-colors"
          >
            Experience
            <DownloadIcon />
          </a>
          <Link
            href="/contact"
            className="hover:text-[color:var(--ink)] transition-colors"
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center justify-end gap-6">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
