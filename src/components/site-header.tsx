import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({ pageNo = "00" }: { pageNo?: string }) {
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
          Sam Ahhee · Visual Communications
        </Link>
        <nav className="font-mono flex items-center gap-6 text-[color:var(--ink-soft)]">
          <Link href="/" className="hover:text-[color:var(--ink)] transition-colors">
            Work
          </Link>
          <Link href="/contact" className="hover:text-[color:var(--ink)] transition-colors">
            Contact
          </Link>
        </nav>
        <div className="flex items-center justify-end gap-6">
          <span className="font-mono text-[color:var(--meta)] hidden sm:inline">
            No. {pageNo} / 2026
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
