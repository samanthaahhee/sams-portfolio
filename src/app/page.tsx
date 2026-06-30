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

  return (
    /* overflow-hidden stops any layout-animation overshoot from scrolling */
    <div className="h-screen overflow-hidden bg-white font-portfolio-sans">
      <PortfolioNav />
      <HomepageBento
        media={media}
        copyA={settings["homepage_copy_a"] || undefined}
        copyB={settings["homepage_copy_b"] || undefined}
      />
    </div>
  );
}
