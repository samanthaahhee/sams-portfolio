export const metadata = { title: "Admin · Login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const from = sp.from ?? "/admin";

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[color:var(--paper)]">
      <form
        method="POST"
        action={`/api/admin/login?from=${encodeURIComponent(from)}`}
        className="w-full max-w-sm space-y-6"
      >
        <div>
          <p className="font-mono text-[color:var(--meta)] mb-2">Sam Ahhee · Admin</p>
          <h1 className="font-display text-3xl md:text-4xl" style={{ lineHeight: 0.95 }}>
            Sign in
          </h1>
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="font-mono text-[color:var(--meta)] block">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoFocus
            required
            className="w-full px-4 py-3 border border-[color:var(--rule)] bg-transparent text-[color:var(--ink)] rounded-sm focus:outline-none focus:border-[color:var(--ink)] transition-colors"
          />
        </div>
        <button
          type="submit"
          className="w-full font-mono uppercase tracking-[0.14em] px-5 py-3 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
            fontSize: "11px",
          }}
        >
          Sign in →
        </button>
      </form>
    </main>
  );
}
