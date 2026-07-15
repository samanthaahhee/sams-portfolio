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
            <Link href="/admin/projects" className="hover:text-[color:var(--ink)]">
              Projects
            </Link>
            <Link href="/admin/case-studies" className="hover:text-[color:var(--ink)]">
              Case studies
            </Link>
            <Link href="/admin/work" className="hover:text-[color:var(--ink)]">
              Work (rebuild)
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
