/**
 * Bespoke /work/temper case study page.
 *
 * Overrides the generic /work/[slug] template because the Temper case
 * has more body sections than the standard six (Context · Problem ·
 * Approach · Decisions · Outcome · Reflection) — plus a pullquote,
 * highlight callout, stats, and three direction cards.
 *
 * Cover, visuals, and the "Continue reading" rail still pull from the
 * shared case-study data so the user can keep editing those in
 * /admin/case-studies/temper. Meta + body copy lives in this file.
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
  Callout,
  DirectionCard,
  Pullquote,
  Stats,
} from "@/components/case-study-blocks";
import { SectionTabs } from "@/components/case-study-tabs";
import { getCaseStudies, getCaseStudyBySlug } from "@/lib/db";
import { customColorsToStyle } from "@/lib/palette";

const SLUG = "temper";

const META = {
  no: "02",
  title: "Same brand, new contract model.",
  client: "Temper",
  year: "Q2 – Q3 2025",
  role: "Visual Communications Designer",
  constraint: "4± month deadline",
  tags: [
    "Brand system",
    "Design system",
    "Retention strategy",
    "App split",
    "Regulatory pivot",
  ],
  summary:
    "When EU labour reform forced a contract-model pivot, Temper had four months to launch a second app, migrate users, and keep the brand coherent — without a public rebrand. The work sat at the intersection of brand, product, and retention.",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: META.title,
    description: META.summary,
  };
}

export default async function TemperCaseStudyPage() {
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
                <p className="font-mono text-[color:var(--meta)] mb-2">
                  Constraint
                </p>
                <p>{META.constraint}</p>
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
                    Temper is a Dutch platform connecting freelance
                    contractors with hospitality and events clients. In
                    2025 it was operating in a landscape that was about
                    to shift underneath it. A wave of EU labour-law
                    reform, mirroring the regulatory pressure that had
                    already challenged Uber&rsquo;s contractor model, put
                    platforms like Temper directly in the crosshairs.
                    Enterprise clients who relied on the platform were
                    beginning to feel exposed. The risk of being on the
                    wrong side of a labour classification ruling was
                    real, and some were actively evaluating whether to
                    exit the contract model entirely.
                  </Body>
                  <Body>
                    The business had a clear choice: adapt or lose
                    clients. What it didn&rsquo;t have was time, runway,
                    or the engineering capacity to build a new product
                    from scratch. With roughly 22,000 registered users
                    and 9,000 actives, the stakes of getting the
                    transition wrong were significant.
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
            The business decision was made to pivot the contract model, and to
            do it by duplicating and reskinning the existing app rather than
            rebuilding. A second app, Temper Staff, would sit alongside the
            original Temper app in the App Store, operating under a compliant
            employment model while the original continued for freelancers.
          </Body>
          <Body>
            This created a layered brand problem that went well beyond visual
            design. Two apps in the same store, from the same company,
            targeting overlapping users. How do you prevent confusion without
            a costly public rebrand? How do you migrate between 2,500 and
            5,000 existing users to a new platform without triggering mass
            drop-off? And critically, how do you do any of this when the
            existing brand hadn&rsquo;t been fully adopted across the product
            in the first place?
          </Body>

                  <Pullquote>
                    I was already deep into a marketing refresh when the
                    pivot was announced. The previous rebrand had never
                    been fully implemented in the product. Marketing was
                    using Temper green throughout. The product was
                    running in Temper purple. Users were encountering
                    two visually different brands depending on where
                    they touched the platform &mdash; a consequence of
                    technical debt that had never been prioritised after
                    the previous rebrand.
                  </Pullquote>
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
              title="Public rebrand with dual launch"
            >
              The first instinct was to treat the new app as an opportunity:
              announce both platforms publicly, rebrand Temper more boldly,
              and position Temper Staff as a deliberate product extension. We
              ruled this out. A dual public launch would have split our
              messaging at the exact moment users needed clarity. It also
              risked cannibalising the original platform before Temper Staff
              had enough shifts on it to retain users, and we knew shift
              volume on the new platform was going to be low at launch.
            </DirectionCard>

            <DirectionCard
              status="Rejected"
              title="Full visual rebrand of both apps"
            >
              We also considered a clean visual break &mdash; two clearly
              distinct brands differentiated enough that users could orient
              quickly. The risk was abandonment. If Temper Staff looked too
              different, existing Temper users migrated across wouldn&rsquo;t
              feel the continuity. Without enough shifts on the new platform,
              we couldn&rsquo;t afford high drop-off rates. We needed people
              to stay, not be disoriented.
            </DirectionCard>

            <DirectionCard
              status="Chosen"
              title="Quiet migration with brand elevation"
            >
              We chose a soft-launch strategy: migrate existing users to
              Temper Staff without a public announcement, and keep the two
              brands visually close. This wasn&rsquo;t just a risk-mitigation
              call. The contract difference between the two apps lived
              entirely in the backend. From a user&rsquo;s perspective, the
              experience was intentionally the same product. Keeping the
              frontend near-identical reflected that reality accurately,
              rather than overstating the distinction. The strategic framing
              was &ldquo;new contract model, same brand.&rdquo; Two apps in
              the same App Store claiming to be the same company is
              inherently risky. Visual coherence was what made that credible
              rather than confusing.
            </DirectionCard>
                </div>
              ),
            },
            {
              num: "04",
              label: "Making the case",
              content: (
                <>
                  <Body>
            The decision to elevate the brand during the reskin, rather than
            ship a minimum viable version, was not straightforward to get
            through. Product were understandably cautious. Under a four-month
            deadline, changing the existing design system felt like risk, not
            opportunity. The instinct was to do the minimum and move fast.
          </Body>
          <Body>
            I sat at the intersection of marketing and product, which meant I
            could see what neither team was fully seeing on their own. I
            built a touchpoint audit, mapping every surface a user
            encountered by colour brand exposure, from paid acquisition
            through to in-app flows. The output made the problem impossible
            to ignore: green everywhere in marketing, purple everywhere in
            the product. Two brands, one company, zero consistency.
          </Body>

          <Callout label="The case I made">
            The misalignment wasn&rsquo;t aesthetic, it was a trust problem.
            A platform asking workers to migrate to a new employment model
            needed to feel stable, professional and coherent at every
            touchpoint. A user who saw a confident, premium brand in a
            social ad and then opened an app that felt like a different
            product would register that gap subconsciously, even if they
            couldn&rsquo;t name it. Premium visual language wasn&rsquo;t a
            nice-to-have. It was what made &ldquo;new contract model, same
            brand&rdquo; actually believable.
          </Callout>

          <Body>
            To show rather than tell, I reskinned a section of the app so the
            team could see the elevated direction alongside the existing
            product. I also ran a design tokens workshop to demonstrate how a
            token-based system would make the reskin faster and safer, not
            slower, reducing the engineering risk the product team was
            concerned about. Once they could see the before and after, and
            understand that the system would actually make future changes
            easier to maintain, the conversation shifted from &ldquo;is this
            necessary&rdquo; to &ldquo;how do we do this well.&rdquo;
          </Body>
          <Body>
            The illustration library was a direct beneficiary of this. With a
            proper design system in place, I rebuilt the illustration style
            to be consistent across both apps, replacing a fragmented set of
            assets that had accumulated across teams with a cohesive library
            that could scale.
                  </Body>
                </>
              ),
            },
            {
              num: "05",
              label: "Retention",
              content: (
                <>
                  <Body>
                    Once Temper Staff launched quietly, we hit the problem
            we&rsquo;d anticipated. Shift volume on the new platform was too
            low to keep users engaged. People were downloading, seeing
            limited opportunities, and leaving. The drop-off was directly
            tied to supply, not experience.
          </Body>
          <Body>
            The solution I proposed was to reverse the user funnel entirely.
            Rather than waiting for users to come to the app and find limited
            shifts, we would reach out to them first. I designed a
            preference-capture flow and an email campaign that collected work
            preferences and availability from both existing Temper users and
            new Temper Staff sign-ups, then surfaced targeted shift
            recommendations when relevant matches appeared. This pulled users
            back at the moment of maximum relevance rather than asking them
            to check in on an app that might have nothing for them.
          </Body>
          <Body>
            There was also a regulatory angle that made this approach
            particularly significant. Under the original freelance model, EU
            labour law had restricted Temper from making proactive shift
            recommendations. The employment model on Temper Staff removed
            that restriction entirely, making this kind of outreach legally
            permissible for the first time. The pivot unlocked a retention
                    mechanic the original product had never been able to use.
                  </Body>
                </>
              ),
            },
            {
              num: "06",
              label: "Outcome",
              content: (
                <>
                  <Stats
            items={[
              { value: "82%", label: "Email open rate on shift campaign" },
              { value: "4 months", label: "Brand system delivered to deadline" },
              { value: "2 apps", label: "Operating from one design system" },
            ]}
          />
          <Body>
            The 82% open rate was significant partly because it came from a
            preference-capture flow rather than an established engaged list.
            Users weren&rsquo;t disengaged, they were idle because the right
            opportunity hadn&rsquo;t appeared yet. Reaching out at the moment
            of relevance was enough to bring them back, across both the old
            and new user base.
          </Body>
          <Body>
            The brand system met its four-month deadline. Both Temper and
            Temper Staff launched operating from a shared visual foundation,
            with the illustration system, type, and colour system consistent
            from paid acquisition through to in-app experience. The gap
            between what users saw in marketing and what they experienced in
            the product was closed for the first time.
          </Body>
          <Body>
            We also introduced a contract tagging system across both apps,
            surfacing &ldquo;Staff&rdquo; and &ldquo;Freelance&rdquo; labels
            at the shift level. This wasn&rsquo;t just a UX detail. It was
            the first step in educating users about the distinction between
            the two models, laying the groundwork for an eventual platform
            merge that would make Temper model-agnostic. The tagging system
            meant the merge, when it came, wouldn&rsquo;t require users to
                    relearn anything from scratch.
                  </Body>
                </>
              ),
            },
            {
              num: "07",
              label: "Reflection",
              content: (
                <>
                  <Body>
                    The thing I&rsquo;d do differently is build the preference-capture
            flow before launch rather than in response to drop-off. We lost
            users in the window between migration and first relevant shift
            &mdash; users who might have stayed if we&rsquo;d been in their
            inbox sooner. The retention mechanic worked, but it would have
            worked better if it had been ready on day one.
          </Body>
          <Body>
            What I&rsquo;d protect is the investment in the internal
            case-making. The touchpoint audit and the reskin prototype took
            time I could have spent on production, but they were what got
            the project greenlit properly rather than just tolerated. Showing
            the team exactly what users were seeing, in a format they
            couldn&rsquo;t dismiss as subjective, changed the conversation.
            That shift in framing is what made the design system possible
                    under the deadline we had.
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
