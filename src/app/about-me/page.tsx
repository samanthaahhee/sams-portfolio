import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PosterCollage } from "@/components/poster-collage";
import { FloatingConfetti } from "@/components/floating-confetti";
import { ContactButton } from "@/components/contact-button";
import { MobileConfettiButton } from "@/components/mobile-confetti-button";

export const metadata = {
  title: "About me",
  description:
    "Sam Ahhee — multidisciplinary designer, Cape Town → Amsterdam.",
};

export default function AboutMePage() {
  return (
    <div data-pair="butter-slate" className="text-[color:var(--ink)]">
      <SiteHeader pageNo="A" />

      <main className="relative">
        {/* ── Top — meta label + huge heading + portrait ─────────── */}
        <section className="relative px-[var(--spacing-page)] pt-12 md:pt-20 pb-12 md:pb-16">
          {/* Subtle halftone wash like the original homepage masthead */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 bottom-0 halftone opacity-[0.10] pointer-events-none"
            style={{ ["--dot" as string]: "var(--pair-b)" }}
          />

          <div className="relative grid grid-cols-12 gap-4 items-start">
            <div className="col-span-12 md:col-span-7">
              <p className="font-mono text-[color:var(--meta)] text-[10px] uppercase tracking-[0.14em] mb-6 md:mb-10">
                About me
              </p>
              <h1
                className="font-display"
                style={{
                  fontSize: "clamp(3.5rem, 10vw, 9rem)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.02em",
                }}
              >
                Sam
                <br />
                Ahhee.
              </h1>
            </div>

            <div className="hidden md:flex md:col-span-5 md:col-start-8 justify-end items-start">
              <div className="relative w-[60%]">
                <PosterCollage />
                <FloatingConfetti />
              </div>
            </div>
          </div>
        </section>

        {/* ── Long-form bio ─────────────────────────────────────── */}
        <section className="relative px-[var(--spacing-page)] pt-4 md:pt-10 pb-24 md:pb-32">
          <div className="grid grid-cols-12 gap-4">
            <div
              className="col-span-12 md:col-span-8 md:col-start-2 space-y-5 md:space-y-6"
              style={{ color: "var(--ink-soft)" }}
            >
              <p className="text-base md:text-lg leading-relaxed">
                I&rsquo;m a multidisciplinary designer with 13+ years
                of experience working across FMCG, fintech, and
                consumer tech. Originally from Cape Town and now based
                in Amsterdam, I work across brand, product,
                illustration, and visual communication.
              </p>
              <p className="text-base md:text-lg leading-relaxed">
                Over the years I&rsquo;ve worked with both agencies
                and startups, which means I&rsquo;m just as comfortable
                thinking about the bigger picture as I am getting
                stuck into the details. From shaping visual identities
                to improving product experiences, I enjoy finding
                simple, thoughtful ways to connect brands with people.
              </p>
              <p className="text-base md:text-lg leading-relaxed">
                I&rsquo;m naturally curious, hands on, and probably
                happiest when I&rsquo;m creating, refining, and
                problem-solving. A bit of a creative Swiss army knife,
                with a soft spot for good storytelling, clean and
                conceptual design.
              </p>
              <div className="pt-3 md:pt-6 flex flex-wrap items-center gap-4">
                <ContactButton />
                <MobileConfettiButton className="md:hidden" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
