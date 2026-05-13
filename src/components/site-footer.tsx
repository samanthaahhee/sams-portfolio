import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-[color:var(--rule)] bg-[color:var(--paper)]">
      <div className="px-[var(--spacing-page)] py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <p className="font-mono text-[color:var(--meta)]">Colophon</p>
          <p className="text-[color:var(--ink-soft)] max-w-xs leading-relaxed">
            Set in Plus Jakarta Sans and Sometype Mono. Designed and built by
            Sam Ahhee in Sydney.
          </p>
        </div>
        <div className="space-y-3">
          <p className="font-mono text-[color:var(--meta)]">Elsewhere</p>
          <ul className="space-y-1 text-[color:var(--ink-soft)]">
            <li>
              <Link href="/contact" className="hover:text-[color:var(--ink)] transition-colors">
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
        <div className="space-y-3 md:text-right">
          <p className="font-mono text-[color:var(--meta)]">Volume 01 · MMXXVI</p>
          <p className="text-[color:var(--ink-soft)] text-sm leading-relaxed">
            © Sam Ahhee, all rights reserved.
            <br />
            No machines were harmed in the making of this site.
          </p>
        </div>
      </div>
    </footer>
  );
}
