import { getPortfolioMedia, getPortfolioSettings } from "@/lib/db-portfolio";
import { PortfolioNav } from "@/components/portfolio/portfolio-nav";
import { HomepageBento } from "@/components/portfolio/homepage-bento";

export const metadata = {
  title: "Sam Ahhee — Visual Communication Designer",
  description:
    "Sam Ahhee Schneider — multidisciplinary designer working across brand, product, illustration, and visual communication. Based in Amsterdam.",
};

export default async function Home() {
  const [media, settings] = await Promise.all([
    getPortfolioMedia("homepage"),
    getPortfolioSettings(),
  ]);

  const copyA = settings["homepage_copy_a"] || undefined;
  const copyB = settings["homepage_copy_b"] || undefined;

  return (
    <div className="min-h-screen bg-white font-portfolio-sans">
      <PortfolioNav />
      {/* Nav height offset */}
      <div className="pt-20 md:pt-24">
        <HomepageBento media={media} copyA={copyA} copyB={copyB} />
      </div>
    </div>
  );
}
