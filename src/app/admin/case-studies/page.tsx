import Link from "next/link";
import { getCaseStudies } from "@/lib/db";

export default async function CaseStudiesList() {
  const studies = await getCaseStudies();
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[color:var(--meta)] mb-2">Selected Work</p>
          <h1 className="font-display text-4xl md:text-5xl" style={{ lineHeight: 0.95 }}>
            Case studies
          </h1>
        </div>
        <Link
          href="/admin/case-studies/new"
          className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px]"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          + New case study
        </Link>
      </div>
      <ul className="border-t border-[color:var(--rule)]">
        {studies.map((c) => (
          <li
            key={c.slug}
            className="border-b border-[color:var(--rule)] py-3 flex items-baseline justify-between gap-4"
          >
            <Link
              href={`/admin/case-studies/${c.slug}`}
              className="flex items-baseline gap-4 hover:opacity-70"
            >
              <span className="font-mono text-[color:var(--meta)] w-12">No. {c.no}</span>
              <span>{c.title}</span>
            </Link>
            <span className="font-mono text-[color:var(--meta)]">{c.client}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
