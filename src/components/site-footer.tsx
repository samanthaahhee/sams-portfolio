import Link from "next/link";
import { CopyEmailButton } from "./copy-email-button";

const EMAIL = "samantha.ahhee@gmail.com";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-[color:var(--rule)] bg-[color:var(--paper)]">
      <div className="px-[var(--spacing-page)] py-12 grid grid-cols-1 md:grid-cols-2 gap-12 md:items-end">
        {/* ── Far left — Elsewhere links ───────────────────────────── */}
        <div className="space-y-3 max-w-xs">
          <p className="font-mono text-[color:var(--meta)]">Elsewhere</p>
          <ul className="space-y-1 text-[color:var(--ink-soft)]">
            <li>
              <Link
                href="/contact"
                className="hover:text-[color:var(--ink)] transition-colors"
              >
                Email
              </Link>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/"
                className="hover:text-[color:var(--ink)] transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn ↗
              </a>
            </li>
            <li>
              <a
                href="https://www.behance.net/"
                className="hover:text-[color:var(--ink)] transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                Behance ↗
              </a>
            </li>
            <li>
              <a
                href="https://smallstitch.club"
                className="hover:text-[color:var(--ink)] transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                Small Stitch ↗
              </a>
            </li>
          </ul>
        </div>

        {/* ── Far right — contact + location + copyright ──────────── */}
        <div className="md:text-right space-y-3 text-[color:var(--ink-soft)]">
          <CopyEmailButton email={EMAIL} />
          <p>Based in Amsterdam.</p>
          <p className="font-mono text-[color:var(--meta)] pt-3">
            © 2026. Sam Ahhee Schneider. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
