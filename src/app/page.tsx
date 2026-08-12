import { HomepageHero, type HomeTile } from "@/components/portfolio/homepage-hero";
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
  /* The work grid is the project list: every visible project, in the
     order set in the admin, with its own cover and its own client/title
     pills. Nothing about the grid is hardcoded any more, so renaming,
     reordering or hiding a project moves the homepage with it. */
  const rows = await getPortfolioProjects();
  const source = rows.length > 0 ? rows : PLACEHOLDER_PROJECTS;
  const tiles: HomeTile[] = source.map((p) => ({
    slug: p.slug,
    client: p.client,
    title: p.title,
    /* The tile prefers its own thumbnail, cropped how the admin set it,
       and only falls back to the hero cover when none is chosen. */
    src: p.thumbUrl ?? p.coverUrl ?? undefined,
    focalX: p.thumbUrl ? p.thumbFocalX : p.coverFocalX,
    focalY: p.thumbUrl ? p.thumbFocalY : p.coverFocalY,
    zoom: p.thumbUrl ? p.thumbZoom : p.coverZoom,
  }));

  return (
    <div className="bg-white font-portfolio-sans">
      <HomepageHero tiles={tiles} />
    </div>
  );
}
