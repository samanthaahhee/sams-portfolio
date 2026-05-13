import Link from "next/link";
import { getProjects } from "@/lib/db";

export default async function ProjectsList() {
  const projects = await getProjects();
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[color:var(--meta)] mb-2">Archive</p>
          <h1 className="font-display text-4xl md:text-5xl" style={{ lineHeight: 0.95 }}>
            Projects
          </h1>
        </div>
        <Link
          href="/admin/projects/new"
          className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px]"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          + New project
        </Link>
      </div>
      <ul className="border-t border-[color:var(--rule)]">
        {projects.map((p) => (
          <li
            key={p.slug}
            className="border-b border-[color:var(--rule)] py-3 flex items-baseline justify-between gap-4"
          >
            <Link
              href={`/admin/projects/${p.slug}`}
              className="flex items-baseline gap-4 hover:opacity-70"
            >
              <span className="font-mono text-[color:var(--meta)] w-32">{p.brand}</span>
              <span>{p.title}</span>
            </Link>
            <span className="font-mono text-[color:var(--meta)]">{p.tags.join(" · ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
