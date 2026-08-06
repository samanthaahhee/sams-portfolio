import Link from "next/link";
import { ForceLight } from "./_components/force-light";

export const metadata = { title: { default: "Admin", template: "%s · Admin" } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--paper)]">
      <ForceLight />
      <header className="border-b border-[color:var(--rule)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-6">
          <Link href="/admin" className="font-mono text-[color:var(--ink)]">
            Sam Ahhee · Admin
          </Link>
          <nav className="font-mono flex items-center gap-4 text-[color:var(--ink-soft)]">
            <Link href="/admin" className="hover:text-[color:var(--ink)]">
              Dashboard
            </Link>
            {/* One content type now: a project. The legacy Projects /
                Case studies / CV editors are retired. */}
            <Link href="/admin/work" className="hover:text-[color:var(--ink)]">
              Projects
            </Link>
            <Link href="/admin/hero" className="hover:text-[color:var(--ink)]">
              Hero deck
            </Link>
            <Link href="/admin/settings" className="hover:text-[color:var(--ink)]">
              Settings
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
