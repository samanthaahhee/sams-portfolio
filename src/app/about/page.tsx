import { getPortfolioJobs, getPortfolioInterests } from "@/lib/db-portfolio";
import { PortfolioNav } from "@/components/portfolio/portfolio-nav";
import { AboutPage as AboutPageComponent } from "@/components/portfolio/about-page";

export const metadata = {
  title: "About me — Sam Ahhee",
  description: "Sam Ahhee — multidisciplinary designer, Cape Town → Amsterdam. 13+ years across brand, product, illustration, and visual communication.",
};

export default async function AboutPage() {
  const [jobs, interests] = await Promise.all([
    getPortfolioJobs(),
    getPortfolioInterests(),
  ]);
  return (
    <div className="font-portfolio-sans">
      <PortfolioNav active="about" />
      <AboutPageComponent jobs={jobs} interests={interests} />
    </div>
  );
}
