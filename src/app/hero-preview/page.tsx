/**
 * Preview-only landing-hero exploration inspired by Monopo London.
 * Lava-lamp blobs (SVG goo metaballs) + magnifying-glass cursor
 * live in HeroBlobs. The live homepage is unchanged.
 */

import { SiteHeader } from "@/components/site-header";
import { HeroBlobs } from "@/components/hero-blobs";

export const metadata = { title: "Hero preview" };

export default function HeroPreview() {
  return (
    <div className="bg-[#1f0f0c] text-white">
      <SiteHeader pageNo="HP" />
      <HeroBlobs />
      <div className="px-[var(--spacing-page)] py-12 md:py-16 text-center">
        <p className="font-mono text-[color:var(--meta)] text-[10px] uppercase tracking-[0.14em]">
          Preview · not linked publicly. Live homepage is unchanged.
        </p>
      </div>
    </div>
  );
}
