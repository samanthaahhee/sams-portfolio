import { getPortfolioProjects } from "@/lib/db-portfolio";
import { PortfolioNav } from "@/components/portfolio/portfolio-nav";
import { WorkIndex } from "@/components/portfolio/work-index";

export const metadata = {
  title: "Work — Sam Ahhee",
  description: "Selected projects by Sam Ahhee — brand, product, illustration, and visual communication.",
};

export default async function WorkPage() {
  const projects = await getPortfolioProjects();
  return (
    <div className="min-h-screen bg-white font-portfolio-sans overflow-hidden">
      <PortfolioNav active="work" />
      <div className="pt-20 md:pt-24 h-screen">
        <WorkIndex projects={projects} />
      </div>
    </div>
  );
}
