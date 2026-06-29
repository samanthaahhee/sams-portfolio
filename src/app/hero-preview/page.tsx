/**
 * Preview-only landing-hero exploration — kinetic work collage with
 * spotlight cycle, inspired by monopo.london's reel.
 * Live homepage is unchanged.
 */

import { SiteHeader } from "@/components/site-header";
import { HeroCollage, type CollagePiece } from "@/components/hero-collage";
import { getCaseStudies, getProjects } from "@/lib/db";

export const metadata = { title: "Hero preview" };

export default async function HeroPreview() {
  const [caseStudies, projects] = await Promise.all([
    getCaseStudies(),
    getProjects(),
  ]);

  const pieces: CollagePiece[] = [
    ...caseStudies.map((c) => ({
      href: `/work/${c.slug}`,
      src: c.cover,
      title: c.title,
      client: c.client,
    })),
    ...projects.map((p) => ({
      href: `/projects/${p.slug}`,
      src: p.cover,
      title: p.title,
      client: p.brand,
    })),
  ].filter((p) => Boolean(p.src));

  return (
    <div className="bg-[#0e0a08] text-white">
      <SiteHeader pageNo="HP" />
      <HeroCollage pieces={pieces} wordmark="Sam Ahhee" />
      <div className="px-[var(--spacing-page)] py-12 md:py-16 text-center">
        <p className="font-mono text-[color:var(--meta)] text-[10px] uppercase tracking-[0.14em]">
          Preview · not linked publicly. Live homepage is unchanged.
        </p>
      </div>
    </div>
  );
}
