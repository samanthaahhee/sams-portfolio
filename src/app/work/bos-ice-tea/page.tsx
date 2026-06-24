/**
 * Bespoke /work/bos-ice-tea case study page.
 *
 * Same shape as /work/temper — meta column on the left, horizontal
 * tab strip and panel content on the right. Cover, visuals, and the
 * "Continue reading" rail still pull from the shared case-study
 * record so they remain editable via /admin/case-studies/bos-ice-tea.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HalftoneCover } from "@/components/halftone-cover";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { ImageGrid } from "@/components/image-grid";
import { ImageStack } from "@/components/image-stack";
import { MediaRow } from "@/components/media-row";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { BackToTop } from "@/components/back-to-top";
import {
  Body,
  DirectionCard,
  Stats,
} from "@/components/case-study-blocks";
import { SectionTabs } from "@/components/case-study-tabs";
import { getCaseStudies, getCaseStudyBySlug } from "@/lib/db";
import { customColorsToStyle } from "@/lib/palette";

const SLUG = "bos-ice-tea";

const META = {
  no: "03",
  title: "A bold brand in a bigger market.",
  client: "BOS Ice Tea",
  // Year is retained for the cover plate only — it was removed from the
  // meta sidebar per the latest brief.
  year: "2018–2019",
  role: "Senior Art Director (EMEA region)",
  market: "Benelux launch",
  tags: [
    "Brand awareness",
    "Product launch",
    "Trade materials",
    "Activation",
    "Digital campaign",
    "Concepting",
  ],
  summary:
    "A South African ice tea brand entering the Benelux with a rand-denominated budget — building brand recognition across trade, activation, digital, and influencer through a personality-first creative approach.",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: META.title,
    description: META.summary,
  };
}

export default async function BosIceTeaCaseStudyPage() {
  const [study, caseStudies] = await Promise.all([
    getCaseStudyBySlug(SLUG),
    getCaseStudies(),
  ]);
  if (!study) notFound();

  const others = caseStudies.filter((c) => c.slug !== study.slug);
  const useCustom = study.palette === "custom" && study.customColors;

  return (
    <div
      data-pair={useCustom ? undefined : study.palette}
      style={useCustom ? customColorsToStyle(study.customColors!) : undefined}
    >
      <SiteHeader pageNo={META.no} />

      <main>
        {/* Back */}
        <div className="px-[var(--spacing-page)] pt-8 md:pt-10">
          <Link
            href="/#selected-work"
            className="font-mono text-[color:var(--meta)] hover:text-[color:var(--ink)] transition-colors"
          >
            ← Back to selected work
          </Link>
        </div>

        {/* Cover */}
        <section className="px-[var(--spacing-page)] pt-8 md:pt-12">
          <HalftoneCover
            no={META.no}
            title={META.title}
            client={META.client}
            year={META.year}
          />
        </section>

        {/* Meta column + tabbed body */}
        <section className="px-[var(--spacing-page)] pt-16 md:pt-24">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3 md:col-start-2 space-y-6 mb-10 md:mb-0">
              <div>
                <p className="font-mono text-[color:var(--meta)] mb-2">Client</p>
                <p>{META.client}</p>
              </div>
              <div>
                <p className="font-mono text-[color:var(--meta)] mb-2">Role</p>
                <p>{META.role}</p>
              </div>
              <div>
                <p className="font-mono text-[color:var(--meta)] mb-2">Market</p>
                <p>{META.market}</p>
              </div>
              <div>
                <p className="font-mono text-[color:var(--meta)] mb-2">Tags</p>
                <ul className="space-y-1">
                  {META.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-span-12 md:col-span-7 md:col-start-6">
              <SectionTabs
                tabs={[
                  {
                    num: "01",
                    label: "Context",
                    content: (
                      <>
                        <Body>
                          BOS Ice Tea is a South African brand built on
                          Rooibos, a naturally sweet indigenous tea that
                          gives BOS its distinctive flavour and lower
                          sugar profile. In South Africa it has genuine
                          cultural weight: bold, irreverent, and rooted
                          in a product that is uniquely its own.
                          &ldquo;BOS&rdquo; is a play on Rooibos, and to
                          &ldquo;go bos&rdquo; in Afrikaans means to go
                          wild. None of that lands in the Benelux.
                        </Body>
                        <Body>
                          When BOS began expanding into the EU, it
                          entered one of the most competitive cold
                          beverage markets in the world with a budget
                          denominated in South African rand. What BOS
                          had instead was a genuinely distinctive
                          product and a brand personality built around
                          four pillars: nature, art and music, design,
                          and sustainability. The challenge was how to
                          make that personality felt across every
                          channel in a new market, without the spend to
                          force it.
                        </Body>
                      </>
                    ),
                  },
                  {
                    num: "02",
                    label: "Brand problem",
                    content: (
                      <>
                        <Body>
                          BOS had no name recognition in the Benelux.
                          The goal at this stage wasn&rsquo;t to
                          convert, it was to spark curiosity first. To
                          get people thinking &ldquo;I keep seeing this
                          brand everywhere, what is it?&rdquo; before
                          they ever picked up a bottle. That meant
                          showing up consistently and memorably across
                          a wide range of touchpoints: trade,
                          activation, digital, and influencer, all on a
                          budget that demanded every execution earned
                          its place.
                        </Body>
                        <Body>
                          The strategic bet was that personality could
                          do the work that spend couldn&rsquo;t. Not
                          materials and campaigns that explained the
                          brand, but ones that embodied it. Every
                          touchpoint had to feel distinctly BOS or it
                          wasn&rsquo;t worth doing.
                        </Body>
                      </>
                    ),
                  },
                  {
                    num: "03",
                    label: "Directions considered",
                    content: (
                      <div className="space-y-10 md:space-y-12">
                        <DirectionCard
                          status="Rejected"
                          title="Leading with the red original"
                        >
                          The first EU product launch was the BOS
                          original, a red-coloured ice tea designed to
                          introduce consumers to the taste of Rooibos
                          on its own terms. It was a logical strategy:
                          lead with the hero ingredient, educate the
                          palate, build from there. In practice it
                          didn&rsquo;t land. The signature BOS pack is
                          yellow, and launching in a new market with a
                          red product muddied the brand recognition we
                          were trying to build from zero. The Rooibos
                          education story was harder to tell than
                          anticipated to a market with no frame of
                          reference for the ingredient. It was a real
                          learning about the difference between what
                          makes sense strategically and what consumers
                          can actually receive without context.
                        </DirectionCard>

                        <DirectionCard
                          status="Rejected"
                          title="Standard trade and campaign branding"
                        >
                          The default approach would have been branded
                          parasols, standard POS displays, logo-heavy
                          glassware, and generic social ads. Safe and
                          entirely forgettable. In a terrace
                          environment where a bar owner can choose
                          between a well-funded beer brand&rsquo;s
                          umbrella or a South African ice tea
                          brand&rsquo;s coaster, generic materials lose
                          every time. The same logic applied to
                          digital: BOS couldn&rsquo;t outspend
                          established players, so the creative had to
                          work harder.
                        </DirectionCard>

                        <DirectionCard
                          status="Chosen"
                          title="A personality-first approach across every channel"
                        >
                          We built every execution around a single
                          filter: would this feel unmistakably BOS
                          without the logo? Trade materials that
                          venues would actively want. Activations that
                          created real moments. Digital ads that were
                          concepted rather than produced. The bold BOS
                          colour palette ran through everything as the
                          constant thread.
                        </DirectionCard>
                      </div>
                    ),
                  },
                  {
                    num: "04",
                    label: "Approach",
                    content: (
                      <>
                        <Body>
                          As Senior Art Director, I led concepting and
                          design across the full campaign, working
                          with a Creative Director and a copywriter,
                          and managing a DTP artist and junior
                          designer.
                        </Body>
                        <Body>
                          <strong className="font-semibold">
                            Trade and activation.
                          </strong>{" "}
                          The trade toolkit was built around items
                          venues would actively choose to display: a
                          surfboard shower at beach bars, a sandwich
                          board with a built-in planter, a condiment
                          and cutlery holder, and seasonal coasters.
                          Each item was concepted to do double duty,
                          function as something useful or desirable,
                          and quietly build brand presence while doing
                          it. The Zandvoort summer activation took the
                          art and music pillar furthest: a shipping
                          container converted into a giant boombox
                          became a venue for up-and-coming DJs to play
                          live sets at a beach bar, turning BOS into an
                          experience worth attending rather than a
                          product on a menu. A tuk tuk sampling vehicle
                          brought the brand directly to golf courses,
                          putting BOS in front of a new audience in an
                          unexpected format.
                        </Body>
                        <Body>
                          <strong className="font-semibold">
                            Sales toolkit.
                          </strong>{" "}
                          The sales toolkit was designed as a
                          conversation starter. A custom-made backpack
                          in BOS signature yellow with bold red
                          contrast stitching, it looked like it had
                          walked straight out of an illustration, which
                          was entirely the point. Inside, a fully
                          organised system of compartments held product
                          samples, garnish herbs, brand materials and
                          the perfect serve components, a camp-style
                          copper mug that kept the drink cold and
                          signalled an outdoor lifestyle. A sales rep
                          walking into a venue carrying it didn&rsquo;t
                          need an opening line. The bag did the work.
                          Alongside it, a branded tea towel printed
                          with the full BOS origin story turned a
                          functional object into a piece of brand
                          education.
                        </Body>
                        <Body>
                          <strong className="font-semibold">Digital.</strong>{" "}
                          The social ad campaign was fully concepted,
                          not just produced. The creative leaned into
                          BOS&rsquo;s bold colour palette and
                          personality-led tone, designed to stop the
                          scroll in a category where most brands
                          default to product shots and health claims.
                        </Body>
                        <Body>
                          <strong className="font-semibold">
                            Influencer.
                          </strong>{" "}
                          In the era of unboxing content, the
                          influencer pack was designed as a
                          &ldquo;parcel parcel&rdquo; experience, a
                          layered unwrapping where each layer revealed
                          something new and told a piece of the BOS
                          story. The unboxing was the content, not
                          just the packaging around it.
                        </Body>
                        <Body>
                          Photoshoots across all workstreams were
                          planned with minimal resource, using bold
                          colour, strong natural light, and the
                          toolkit items themselves as props, keeping
                          the BOS signature palette front and centre
                          without requiring large production budgets.
                        </Body>
                      </>
                    ),
                  },
                  {
                    num: "05",
                    label: "Outcome",
                    content: (
                      <>
                        <Stats
                          items={[
                            {
                              value: "360°",
                              label:
                                "Campaign coverage across trade, digital, activation and influencer",
                            },
                            {
                              value: "1",
                              label: "Product launched into the Benelux market",
                            },
                            {
                              value: "4",
                              label:
                                "Brand pillars embedded consistently across every touchpoint",
                            },
                          ]}
                        />
                        <Body>
                          BOS secured new retail and venue listings
                          across the Benelux during this period. The
                          trade toolkit gave the sales team something
                          genuinely differentiated to walk into
                          accounts with, shifting the conversation
                          from &ldquo;here is our product&rdquo; to
                          &ldquo;here is our world.&rdquo;
                        </Body>
                        <Body>
                          In a market where brand recognition started
                          at zero and budget was limited, the work
                          demonstrated that personality and creative
                          consistency can substitute for spend, when
                          every execution is held to the same standard.
                        </Body>
                      </>
                    ),
                  },
                  {
                    num: "06",
                    label: "Reflection",
                    content: (
                      <>
                        <Body>
                          The thing I&rsquo;d push harder on next time
                          is measurement across channels. We had a
                          clear sense that the work was landing, but
                          without systematic tracking across trade
                          placement, digital performance, and
                          activation reach, it was difficult to know
                          which executions were doing the most work.
                          That data would have sharpened both the
                          in-flight decisions and the next brief.
                        </Body>
                        <Body>
                          What I&rsquo;d protect is the single creative
                          filter: would this feel unmistakably BOS
                          without the logo? It kept the work honest
                          across a wide range of formats and budgets,
                          and stopped any single execution from
                          drifting into generic territory. When
                          you&rsquo;re building brand recognition from
                          scratch in a competitive market, consistency
                          of personality is the only asset you can
                          compound over time.
                        </Body>
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Visuals — still pulled from data */}
        {study.visuals && study.visuals.length > 0 && (
          <section className="px-[var(--spacing-page)] pt-16 md:pt-24">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-10 md:col-start-2 space-y-8 md:space-y-12 md:px-[5%]">
                {study.visuals.map((v, i) => {
                  const figLabel = `Fig. ${String(i + 1).padStart(2, "0")}`;
                  const cap = v.caption ? `${figLabel} — ${v.caption}` : figLabel;
                  if (v.kind === "compare") {
                    return (
                      <BeforeAfterSlider
                        key={`v-${i}`}
                        before={v.before}
                        after={v.after}
                        caption={cap}
                      />
                    );
                  }
                  if (v.kind === "grid") {
                    return <ImageGrid key={`v-${i}`} images={v.images} caption={cap} />;
                  }
                  if (v.kind === "stack") {
                    return <ImageStack key={`v-${i}`} images={v.images} caption={cap} />;
                  }
                  if (v.kind === "media") {
                    return (
                      <MediaRow
                        key={`v-${i}`}
                        images={v.images}
                        layout={v.layout}
                        caption={cap}
                      />
                    );
                  }
                  if (v.kind === "video") {
                    return <YouTubeEmbed key={`v-${i}`} url={v.url} caption={cap} />;
                  }
                  return (
                    <figure key={`v-${i}-${v.url}`} className="space-y-2">
                      <div
                        className="relative overflow-hidden rounded-sm"
                        style={{ background: "transparent", aspectRatio: "16 / 10" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={v.url}
                          alt={v.caption ?? `${META.title} plate ${i + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <figcaption className="font-mono text-[color:var(--meta)]">
                        {cap}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Continue reading */}
        <section className="px-[var(--spacing-page)] pt-32 md:pt-48 pb-24 md:pb-32">
          <div className="rule mb-10" />
          <div className="grid grid-cols-12 gap-4 items-baseline">
            <p className="col-span-12 md:col-span-3 md:col-start-2 font-mono text-[color:var(--meta)]">
              Continue reading
            </p>
            <ul className="col-span-12 md:col-span-6 md:col-start-6 space-y-8 md:space-y-10 mb-12 md:mb-16">
              {others.map((o) => (
                <li key={o.slug} data-pair={o.palette}>
                  <Link
                    href={`/work/${o.slug}`}
                    className="group flex items-baseline justify-between gap-6 py-4 border-b border-[color:var(--rule)]"
                  >
                    <span className="flex items-baseline gap-6">
                      <span className="font-mono text-[color:var(--meta)]">
                        No. {o.no}
                      </span>
                      <span
                        className="font-display text-3xl md:text-4xl transition-colors"
                        style={{ color: "var(--ink)" }}
                      >
                        {o.title}
                      </span>
                    </span>
                    <span className="font-mono text-[color:var(--meta)] group-hover:text-[color:var(--ink)] transition-colors">
                      {o.client} →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <BackToTop />
      </main>

      <SiteFooter />
    </div>
  );
}
