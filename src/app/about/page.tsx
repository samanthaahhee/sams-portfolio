import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AboutHero } from "@/components/about-hero";
import { AboutNav } from "@/components/about-nav";
import { MenuCard } from "@/components/menu-card";
import { ExperienceMenu } from "@/components/experience-menu";
import { TestimonialTile } from "@/components/testimonial-tile";
import {
  profile,
  stats,
  experience,
  testimonials,
  skills,
  tools,
  education,
  languages,
  downloads,
} from "@/lib/about";

export const metadata = {
  title: "About",
  description:
    "Sam Ahhee Schneider is a senior product & visual designer in Amsterdam. 13+ years across digital products, brand systems, and integrated campaigns — currently building HeyOtis at Ten 8 City.",
};

/**
 * /about — long-form scrolling CV in editorial framing. Three sections
 * (Overview, Experience, Personal) with a sticky in-page nav and an
 * inverted footer CTA.
 *
 * All copy lives in `src/lib/about.ts`. All visuals resolve to existing
 * design tokens — `data-pair="butter-slate"` is the only surface needed
 * to flip the whole page to another palette.
 */
export default function AboutPage() {
  return (
    <div data-pair="butter-slate">
      <SiteHeader pageNo="A" />

      <main>
        <AboutHero />
        <AboutNav />

        {/* ── 01 / Overview ──────────────────────────────────────── */}
        <MenuCard
          id="overview"
          eyebrow="01 / Overview"
          title="The basics."
          tagline="Who I am, what I do, where I've been."
        >
          {/* Featured intro */}
          <div
            className="grid grid-cols-12 gap-4 py-8 md:py-10"
            style={{ borderTop: "1px solid var(--rule)" }}
          >
            <div className="col-span-12 md:col-span-9">
              <p className="font-display text-2xl md:text-3xl mb-3 text-[color:var(--ink)]">
                Senior Product &amp; Visual Designer{" "}
                <span className="font-mono text-[color:var(--meta)] align-middle ml-2">
                  · est. 2012
                </span>
              </p>
              <p className="text-base md:text-lg leading-relaxed text-[color:var(--ink-soft)]">
                {profile.paragraph}
              </p>
            </div>
          </div>

          {/* Two specialty tiles */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-0"
            style={{ borderTop: "1px solid var(--rule)" }}
          >
            <SpecialtyTile
              label="Specialty"
              title="Design Systems"
              body="Component libraries, design tokens, brand-to-product translation. Recently certified in Design Systems by Memorisely (2024)."
            />
            <div
              className="md:border-l border-t md:border-t-0"
              style={{ borderColor: "var(--rule)" }}
            >
              <SpecialtyTile
                label="Currently"
                title="AI-Native Product"
                body="Building shipping AI products with the Anthropic Claude API, Supabase, and Claude Code — including HeyOtis and smallstitch.club."
              />
            </div>
          </div>

          {/* Stats row */}
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
                className={`p-5 md:p-7 hover:bg-[color:var(--paper-soft)] transition-colors ${
                  i > 0 ? "md:border-l" : ""
                } ${i % 2 === 1 ? "border-l md:border-l" : ""} ${
                  i >= 2 ? "border-t md:border-t-0" : ""
                }`}
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
        </MenuCard>

        {/* ── 02 / Experience ────────────────────────────────────── */}
        <MenuCard
          id="experience"
          eyebrow="02 / Experience"
          title="The work."
          tagline="Click any role to expand. ★ marks the current role."
          variant="paper-soft"
        >
          <ExperienceMenu items={experience} />

          {/* Download row */}
          <div
            className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-4"
            aria-label="Download CV"
          >
            <DownloadCard
              href={downloads.pdf.href}
              label={downloads.pdf.label}
              meta="PDF · A4 · single page"
            />
            <DownloadCard
              href={downloads.docx.href}
              label={downloads.docx.label}
              meta="DOCX · for Workday / Greenhouse / Lever"
            />
          </div>
        </MenuCard>

        {/* ── 03 / Personal ──────────────────────────────────────── */}
        <MenuCard
          id="personal"
          eyebrow="03 / Personal"
          title="Personal &amp; testimonials."
          tagline="What people say. Where I trained. What I'm good at."
        >
          {/* Testimonials 2×2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-14 md:mb-20">
            {testimonials.map((t, i) => (
              <TestimonialTile key={i} t={t} />
            ))}
          </div>

          {/* Info row — Skills · Tools · Education · Languages */}
          <div
            className="grid grid-cols-1 md:grid-cols-4 gap-0"
            style={{
              borderTop: "1px solid var(--rule)",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <InfoCell title="Skills">
              <p className="leading-relaxed text-[color:var(--ink-soft)]">
                {skills.join(" · ")}
              </p>
            </InfoCell>
            <InfoCell title="Tools" withBorder>
              <p className="leading-relaxed text-[color:var(--ink-soft)]">
                {tools.join(" · ")}
              </p>
            </InfoCell>
            <InfoCell title="Education" withBorder>
              <ul className="space-y-3 text-[color:var(--ink-soft)]">
                {education.map((e) => (
                  <li key={e.title}>
                    <p className="text-[color:var(--ink)]">{e.title}</p>
                    <p className="font-mono text-[color:var(--meta)]">
                      {e.institution} · {e.year}
                    </p>
                  </li>
                ))}
              </ul>
            </InfoCell>
            <InfoCell title="Languages" withBorder>
              <ul className="space-y-3 text-[color:var(--ink-soft)]">
                {languages.map((l) => (
                  <li key={l.name}>
                    <span className="text-[color:var(--ink)]">{l.name}</span>{" "}
                    <span className="font-mono text-[color:var(--meta)]">
                      {l.level}
                    </span>
                  </li>
                ))}
              </ul>
            </InfoCell>
          </div>
        </MenuCard>

        {/* ── Inverted footer CTA ────────────────────────────────── */}
        <section
          className="px-[var(--spacing-page)] py-20 md:py-28"
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
            <div className="col-span-12 md:col-span-9 mt-8 md:mt-10 flex flex-wrap gap-3">
              <ContactPill
                href={`mailto:${profile.email}`}
                label={profile.email}
              />
              <ContactPill
                href={profile.links.linkedin}
                label="LinkedIn ↗"
                external
              />
              <ContactPill
                href={downloads.pdf.href}
                label="Download CV ↗"
              />
            </div>
            <p className="col-span-12 mt-12 md:mt-16 font-mono opacity-70 max-w-3xl">
              Made by Sam Ahhee Schneider in Amsterdam · ©{" "}
              {new Date().getFullYear()} Sam Ahhee, all rights reserved.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/* ── Local helpers ─────────────────────────────────────────────────── */

function SpecialtyTile({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className="p-5 md:p-7 hover:bg-[color:var(--paper-soft)] transition-colors">
      <p className="font-mono text-[color:var(--meta)] mb-3">{label}</p>
      <p className="font-display text-xl md:text-2xl mb-2 text-[color:var(--ink)]">
        {title}
      </p>
      <p className="text-[color:var(--ink-soft)] leading-relaxed">{body}</p>
    </div>
  );
}

function InfoCell({
  title,
  withBorder,
  children,
}: {
  title: string;
  withBorder?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`p-5 md:p-7 ${withBorder ? "md:border-l border-t md:border-t-0" : ""}`}
      style={{ borderColor: "var(--rule)" }}
    >
      <p className="font-mono text-[color:var(--meta)] mb-3">{title}</p>
      {children}
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

function DownloadCard({
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
      className="group flex items-center justify-between gap-4 p-5 rounded-sm border transition-colors hover:border-[color:var(--ink)]"
      style={{ borderColor: "var(--rule)" }}
    >
      <div>
        <p className="font-display text-lg md:text-xl text-[color:var(--ink)]">
          {label}
        </p>
        <p className="font-mono text-[color:var(--meta)] mt-1">{meta}</p>
      </div>
      <span
        aria-hidden
        className="font-mono text-[color:var(--ink-soft)] group-hover:text-[color:var(--ink)] transition-colors"
      >
        Download ↓
      </span>
    </a>
  );
}
