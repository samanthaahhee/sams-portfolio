import Link from "next/link";

export const metadata = { title: { default: "Admin", template: "%s · Admin" } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--paper)]">
      <header className="border-b border-[color:var(--rule)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-6">
          <Link href="/admin" className="font-mono text-[color:var(--ink)]">
            Sam Ahhee · Admin
          </Link>
          <nav className="font-mono flex items-center gap-4 text-[color:var(--ink-soft)]">
            <Link href="/admin" className="hover:text-[color:var(--ink)]">
              Dashboard
            </Link>
            {/* Legacy sections stay muted; the rebuild's section is tinted
                red so it is obvious which generation you are editing. */}
            <Link href="/admin/projects" className="hover:text-[color:var(--ink)]">
              Projects <span className="text-[10px] opacity-60">(old)</span>
            </Link>
            <Link href="/admin/case-studies" className="hover:text-[color:var(--ink)]">
              Case studies <span className="text-[10px] opacity-60">(old)</span>
            </Link>
            <Link href="/admin/work" style={{ color: "#FF2E31" }} className="hover:opacity-70">
              Work <span className="text-[10px]">(new site)</span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="font-mono text-[color:var(--meta)] hover:text-[color:var(--ink)]"
          >
            View site ↗
          </Link>
          <form method="POST" action="/api/admin/logout">
            <button
              type="submit"
              className="font-mono text-[color:var(--meta)] hover:text-[color:var(--ink)]"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
