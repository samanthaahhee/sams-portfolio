import { getAboutSection, getPortfolioProjects } from "@/lib/db-portfolio";
import { AboutForm } from "./_form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomepageAdminPage() {
  const [about, projects] = await Promise.all([getAboutSection(), getPortfolioProjects()]);
  /* The grid is two projects per row, which is what "after N rows" counts. */
  const totalRows = Math.ceil(projects.length / 2);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <p className="font-mono text-[color:var(--meta)] mb-2">Homepage</p>
        <h1 className="font-display text-4xl md:text-5xl" style={{ lineHeight: 0.95 }}>
          About panel
        </h1>
      </header>
      <AboutForm initial={about} totalRows={totalRows} />
    </div>
  );
}
