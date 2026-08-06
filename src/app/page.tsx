import { HomepageHero } from "@/components/portfolio/homepage-hero";
import { getPortfolioProjects } from "@/lib/db-portfolio";
import { PLACEHOLDER_PROJECTS } from "@/lib/portfolio-placeholders";

export const metadata = {
  title: "Sam Ahhee — Visual Communication Designer",
  description:
    "Sam Ahhee Schneider — multidisciplinary designer working across brand, product, illustration, and visual communication. Based in Amsterdam.",
};

/* No nav on the homepage — the reference leads with the meta row and
   wordmark alone. The other routes still render PortfolioNav. */
export default async function Home() {
  /* Tile pills read client + title straight from the project rows, so
     renaming a project in the admin moves its pills too rather than
     leaving the homepage saying something the project page contradicts.
     Fixtures fill in for projects with no row yet. */
  const rows = await getPortfolioProjects();
  const bySlug = new Map(rows.map((p) => [p.slug, p]));
  for (const p of PLACEHOLDER_PROJECTS) if (!bySlug.has(p.slug)) bySlug.set(p.slug, p);
  const labels = Object.fromEntries(
    Array.from(bySlug.values()).map((p) => [p.slug, { client: p.client, title: p.title }]),
  );

  return (
    <div className="bg-white font-portfolio-sans">
      <HomepageHero labels={labels} />
    </div>
  );
}
