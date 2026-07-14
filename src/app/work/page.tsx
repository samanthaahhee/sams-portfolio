import { getPortfolioProjects } from "@/lib/db-portfolio";
import { PLACEHOLDER_PROJECTS } from "@/lib/portfolio-placeholders";
import { PortfolioNav } from "@/components/portfolio/portfolio-nav";
import { WorkIndex } from "@/components/portfolio/work-index";

export const metadata = {
  title: "Work — Sam Ahhee",
  description: "Selected projects by Sam Ahhee — brand, product, illustration, and visual communication.",
};

export default async function WorkPage() {
  const dbProjects = await getPortfolioProjects();
  // DB projects take precedence per slug; placeholders fill in any slug
  // that hasn't been migrated to the database yet.
  const dbSlugs = new Set(dbProjects.map((p) => p.slug));
  const projects = [...dbProjects, ...PLACEHOLDER_PROJECTS.filter((p) => !dbSlugs.has(p.slug))].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );

  return (
    <div className="h-screen overflow-hidden bg-white font-portfolio-sans">
      <PortfolioNav active="work" />
      <WorkIndex projects={projects} />
    </div>
  );
}
