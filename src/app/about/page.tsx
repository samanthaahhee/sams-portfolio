import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AboutHero } from "@/components/about-hero";
import { CareerRoadmap } from "@/components/career-roadmap";
import { TestimonialsGrid } from "@/components/testimonials-grid";
import {
  profile,
  stats,
  experience as staticExperience,
  testimonials,
  downloads,
} from "@/lib/about";
import { getExperience } from "@/lib/db";

export const metadata = {
  title: "About",
  description:
    "Sam Ahhee Schneider is a senior product & visual designer in Amsterdam. 13+ years across digital products, brand systems, and integrated campaigns — currently building HeyOtis at Ten 8 City.",
};

/**
 * /about — restructured per the audit brief.
 *
 * Six sections in scan-friendly order:
 *   1. Hero — who, where, what now
 *   2. Snapshot — fast-scan stats + 2 specialty tiles
 *   3. Experience — career timeline (proof)
 *   4. Voices — testimonials (2×2 grid)
 *   5. Connect — CTA + CV downloads + contact
 *   6. Footnote strip — Skills · Tools · Education · Languages (mono, compact)
 *
 * Identity copy appears once in the hero, specialties once in the
 * snapshot, experience copy once in the timeline. No repetition.
 */
export default async function AboutPage() {
  /* Prefer DB content; fall back to the static src/lib/about.ts seed. */
  const dbExperience = await getExperience();
  const experience =
    dbExperience.length > 0 ? dbExperience : staticExperience;

  return (
    <div data-pair="butter-slate">
      <SiteHeader pageNo="A" />

      <main>
        {/* ── 1. Hero — who I am, where I am, what I'm doing now ── */}
        <AboutHero />

        {/* ── 2. Snapshot — fast-scan: 4 stats + 2 specialty tiles
            in dustypink-ink to match the timeline below. ──────── */}
        <section
          id="snapshot"
          data-pair="dustypink-ink"
          className="px-[var(--spacing-page)] py-16 md:py-24 scroll-mt-20"
          style={{ background: "var(--paper-soft)" }}
        >
          <div
            className="grid grid-cols-2 md:grid-cols-4"
            style={{
              borderTop: "1px solid var(--rule)",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`p-5 md:p-7 ${i > 0 ? "md:border-l" : ""} ${
                  i % 2 === 1 ? "border-l md:border-l" : ""
                } ${i >= 2 ? "border-t md:border-t-0" : ""}`}
                style={{ borderColor: "var(--rule)" }}
              >
                <p
                  className="font-display text-4xl md:text-5xl"
                  style={{ lineHeight: 1, color: "var(--ink)" }}
                >
                  {s.value}
                </p>
                <p className="font-mono text-[color:var(--meta)] mt-3">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2"
            style={{ borderBottom: "1px solid var(--rule)" }}
          >
            <SpecialtyTile
              eyebrow="Specialty"
              title="Design Systems"
              body="Component libraries, design tokens, brand-to-product translation. Certified Design Systems by Memorisely (2024)."
            />
            <div
              className="md:border-l border-t md:border-t-0"
              style={{ borderColor: "var(--rule)" }}
            >
              <SpecialtyTile
                eyebrow="Currently building"
                title="AI-native products"
                body="Shipping with the Anthropic Claude API, Supabase, and Claude Code. HeyOtis and smallstitch.club are both in flight."
              />
            </div>
          </div>
        </section>

        {/* ── 3. Experience — the career timeline. No intro
            paragraph; the section header carries it. ─────────── */}
        <div
          id="experience"
          data-pair="dustypink-ink"
          className="scroll-mt-20"
          style={{ background: "var(--paper-soft)" }}
        >
          <CareerRoadmap items={experience} />
        </div>

        {/* ── 4. Voices — testimonials in a 2×2 grid ────────────── */}
        <div
          id="voices"
          data-pair="dustypink-ink"
          className="scroll-mt-20"
          style={{ background: "var(--paper-soft)" }}
        >
          <TestimonialsGrid items={testimonials} />
        </div>

        {/* ── 5. Connect — CTA + contact row + CV downloads ──── */}
        <section
          id="connect"
          className="px-[var(--spacing-page)] py-20 md:py-28 scroll-mt-20"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          <div className="grid grid-cols-12 gap-4">
            <h2
              className="col-span-12 md:col-span-10 font-display"
              style={{
                fontSize: "var(--text-d2)",
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
              }}
            >
              Want to{" "}
              <span style={{ color: "var(--pair-a)" }}>
                work together?
              </span>
            </h2>
            <p className="col-span-12 md:col-span-8 mt-6 md:mt-8 text-base md:text-lg leading-relaxed opacity-80">
              Open to senior product &amp; visual design roles, freelance
              briefs, and AI-product collaborations.
            </p>

            <div className="col-span-12 md:col-span-10 mt-8 flex flex-wrap items-center gap-3">
              <ContactPill
                href={`mailto:${profile.email}`}
                label={profile.email}
              />
              <ContactPill
                href={profile.links.linkedin}
                label="LinkedIn ↗"
                external
              />
              <span
                className="font-mono opacity-70 ml-1"
                style={{ color: "var(--paper)" }}
              >
                · Based in Amsterdam
              </span>
            </div>

            <p className="col-span-12 mt-12 md:mt-14 font-mono opacity-70 max-w-2xl">
              Whichever serves you better — the styled PDF for humans, the
              DOCX for ATS systems.
            </p>
            <div className="col-span-12 md:col-span-10 mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <InvertedDownloadCard
                href={downloads.pdf.href}
                label="Styled CV"
                meta="PDF · A4 · single page"
              />
              <InvertedDownloadCard
                href={downloads.docx.href}
                label="Plain CV"
                meta="DOCX · for Workday / Greenhouse / Lever"
              />
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}

/* ── Local helpers ─────────────────────────────────────────────────── */

function SpecialtyTile({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="p-5 md:p-7 hover:bg-[color:var(--paper)] transition-colors">
      <p className="font-mono text-[color:var(--meta)] mb-3">{eyebrow}</p>
      <p className="font-display text-xl md:text-2xl mb-2 text-[color:var(--ink)]">
        {title}
      </p>
      <p className="text-[color:var(--ink-soft)] leading-relaxed">{body}</p>
    </div>
  );
}

function ContactPill({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="font-mono px-4 py-2 rounded-full border transition-colors hover:bg-[color:var(--paper)] hover:text-[color:var(--ink)]"
      style={{
        borderColor: "color-mix(in srgb, var(--paper) 35%, transparent)",
      }}
    >
      {label}
    </a>
  );
}

/** CV download card — inverted variant for the dark Connect section. */
function InvertedDownloadCard({
  href,
  label,
  meta,
}: {
  href: string;
  label: string;
  meta: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between gap-4 p-5 rounded-sm border transition-colors hover:border-[color:var(--paper)]"
      style={{
        borderColor: "color-mix(in srgb, var(--paper) 25%, transparent)",
        color: "var(--paper)",
      }}
    >
      <div>
        <p className="font-display text-lg md:text-xl">{label}</p>
        <p className="font-mono opacity-70 mt-1">{meta}</p>
      </div>
      <span aria-hidden className="font-mono opacity-80 group-hover:opacity-100">
        Download ↓
      </span>
    </a>
  );
}

