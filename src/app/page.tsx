import { PortfolioNav } from "@/components/portfolio/portfolio-nav";
import { HomepageHero } from "@/components/portfolio/homepage-hero";

export const metadata = {
  title: "Sam Ahhee — Visual Communication Designer",
  description:
    "Sam Ahhee Schneider — multidisciplinary designer working across brand, product, illustration, and visual communication. Based in Amsterdam.",
};

export default function Home() {
  return (
    <div className="bg-white font-portfolio-sans">
      <PortfolioNav />
      <HomepageHero />
    </div>
  );
}
