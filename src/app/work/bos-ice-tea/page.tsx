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
  title: "A South African brand in EMEA.",
  client: "BOS Ice Tea",
  year: "2018–2019",
  role: "Senior Art Director (EMEA region)",
  market: "Benelux launch",
  tags: [
    "Brand toolkit",
    "Trade marketing",
    "Activation design",
    "Art direction",
    "Market entry",
  ],
  summary:
    "A South African ice tea brand entering the Benelux with a rand-denominated budget. The brief: build a trade and activation toolkit interesting enough that bar owners would actively choose to display it.",
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
                <p className="font-mono text-[color:var(--meta)] mb-2">Year</p>
                <p>{META.year}</p>
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
                          make that personality felt in a new market
                          without the spend to force it.
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
                          Entering the Benelux market meant competing
                          in terrace culture, where the primary
                          competitor for a branded ice tea isn&rsquo;t
                          another soft drink, it&rsquo;s a beer. Trade
                          materials in this environment aren&rsquo;t
                          decoration, they&rsquo;re real estate. A bar
                          owner who puts your branded planter on their
                          terrace or your coaster on every table is
                          giving you something paid media can&rsquo;t
                          replicate: proximity to the moment of
                          purchase, repeated over an entire season.
                        </Body>
                        <Body>
                          Generic branded trade materials don&rsquo;t
                          earn that placement. A bar owner has seen
                          thousands of them. BOS needed trade materials
                          that were interesting enough to want, useful
                          enough to keep, and on-brand enough to do the
                          awareness work while they sat there.
                        </Body>
                        <Body>
                          The strategic bet was to make trade materials
                          that got venue owners to say &ldquo;that&rsquo;s
                          clever.&rdquo; Not materials that explained
                          the brand, but materials that embodied it.
                          Every touchpoint had to tell a story or earn
                          its place by being more interesting than what
                          was already on the terrace.
                        </Body>
                        <Body>
                          There was a deeper challenge underneath this
                          too. BOS had no name recognition in the
                          Benelux. The goal wasn&rsquo;t to convert
                          immediately, it was to spark curiosity first.
                          To get people thinking &ldquo;I keep seeing
                          this brand everywhere, what is it?&rdquo;
                          before they ever picked up a bottle.
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
                          One early direction was to introduce the red
                          original ice tea as the hero product for the
                          EU launch, leaning into the Rooibos origin
                          story and the visual of a naturally red tea.
                          The problem was that the signature BOS pack
                          is yellow. Launching in a new market with a
                          red product would have muddied the brand
                          recognition we were trying to build from
                          zero. We needed visual consistency more than
                          product range at that stage.
                        </DirectionCard>

                        <DirectionCard
                          status="Rejected"
                          title="Standard trade branding"
                        >
                          The default approach would have been branded
                          parasols, standard POS displays, and
                          logo-heavy glassware. Safe and entirely
                          forgettable. In a terrace environment where a
                          bar owner can choose between a well-funded
                          beer brand&rsquo;s umbrella or a South
                          African ice tea brand&rsquo;s coaster,
                          generic materials lose every time.
                        </DirectionCard>

                        <DirectionCard
                          status="Chosen"
                          title="A trade toolkit built to be wanted"
                        >
                          We built a trade and sales toolkit where
                          every item had to justify its existence by
                          being something a venue would actively
                          choose to display. Each piece was concepted
                          to do double duty: function as a useful or
                          desirable object, and quietly build brand
                          presence while doing it. The bold BOS colour
                          palette ran through everything, making the
                          brand unmissable without shouting.
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
                          design across the full trade and activation
                          toolkit over the course of a year, working
                          with a Creative Director and a copywriter,
                          and managing a DTP artist and junior
                          designer. The scope covered the complete
                          rebuild of BOS&rsquo;s trade materials, sales
                          toolkit, and activation assets for the
                          Benelux market.
                        </Body>
                        <Body>
                          The surfboard shower, installed at beach
                          bars, brought the nature pillar to life in a
                          way a branded parasol never could.
                          Functional, photogenic, and distinctly BOS
                          without needing to explain itself. The
                          condiment and cutlery holder gave venues
                          something practical that earned its place on
                          the table. The sandwich board with a
                          built-in planter doubled as both a point of
                          sale and something venues genuinely wanted
                          for the terrace. Each item gave BOS
                          sustained, passive visibility across an
                          entire season.
                        </Body>
                        <Body>
                          The summer activation at Zandvoort was the
                          highest expression of the art and music
                          pillar. A shipping container converted into a
                          giant boombox became a venue for up-and-coming
                          DJs to play live sets at a beach bar,
                          turning BOS into an experience rather than
                          just a product on a menu. The kind of
                          activation that gets talked about,
                          photographed, and remembered, on a budget
                          that would never have stretched to a
                          conventional sponsorship.
                        </Body>
                        <Body>
                          The perfect serve added another layer. A
                          camp-style copper mug kept the drink cold
                          while signalling an outdoor, adventurous
                          lifestyle, giving bar staff a ritual to own
                          and making the BOS drinking experience
                          something distinct from anything else on the
                          menu.
                        </Body>
                        <Body>
                          The sales toolkit was designed as a
                          conversation starter. A custom-made backpack
                          in BOS signature yellow with bold red
                          contrast stitching, it looked like it had
                          walked straight out of an illustration, which
                          was entirely the point. Inside, a fully
                          organised system of compartments held product
                          samples, garnish herbs, brand materials and
                          the perfect serve components. A sales rep
                          walking into a venue carrying it didn&rsquo;t
                          need an opening line. The bag did the work.
                          Alongside it, a branded tea towel printed
                          with the full BOS origin story, from the
                          Cederberg Mountains to the &ldquo;go
                          bos&rdquo; saying, turned a functional object
                          into a piece of brand education.
                        </Body>
                        <Body>
                          Photoshoots were planned with minimal
                          resource, using bold colour, strong natural
                          light, and the toolkit items themselves as
                          props, keeping the BOS signature palette
                          front and centre without requiring large
                          production budgets.
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
                              value: "1 yr",
                              label: "Full toolkit rebuilt from scratch",
                            },
                            {
                              value: "Benelux",
                              label: "Market entry supported across the region",
                            },
                            {
                              value: "4",
                              label:
                                "Brand pillars embedded across every touchpoint",
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
                          &ldquo;here is our world.&rdquo; In a market
                          where brand recognition started at zero, the
                          materials were the primary vehicle for making
                          BOS feel like it belonged.
                        </Body>
                        <Body>
                          The Zandvoort boombox activation demonstrated
                          that the brand could generate genuine
                          cultural traction on a limited budget, by
                          creating an experience worth attending rather
                          than an ad worth ignoring.
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
                          is measuring placement rate. We knew the
                          toolkit was being well received, but we
                          didn&rsquo;t have a systematic way of
                          tracking how many items were actually making
                          it onto terraces versus sitting in a
                          storeroom. That data would have sharpened the
                          next iteration, telling us which items were
                          genuinely earning their place and which were
                          liked but not used.
                        </Body>
                        <Body>
                          What I&rsquo;d protect is the &ldquo;would
                          they want it without the branding&rdquo;
                          test. It&rsquo;s a useful filter for any
                          trade or activation work where the budget is
                          limited. It stops you spending money on
                          things that only work if people are already
                          fans, and forces the creativity into the
                          object itself rather than onto a logo printed
                          on top of it.
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
