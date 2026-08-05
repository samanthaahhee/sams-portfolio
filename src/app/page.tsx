import { HomepageHero } from "@/components/portfolio/homepage-hero";

export const metadata = {
  title: "Sam Ahhee — Visual Communication Designer",
  description:
    "Sam Ahhee Schneider — multidisciplinary designer working across brand, product, illustration, and visual communication. Based in Amsterdam.",
};

/* No nav on the homepage — the reference leads with the meta row and
   wordmark alone. The other routes still render PortfolioNav. */
export default function Home() {
  return (
    <div className="bg-white font-portfolio-sans">
      <HomepageHero />
    </div>
  );
}
