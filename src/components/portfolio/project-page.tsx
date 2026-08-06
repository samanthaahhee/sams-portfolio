"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { PortfolioBlock, PortfolioProject } from "@/lib/db-portfolio";
import { BendingPanel } from "./bending-panel";
import { SiteFooter } from "./site-footer";
import { WorkTile } from "./work-tile";
import { META_STYLE, MetaRowContent } from "./site-meta";

/* ── Project page ──────────────────────────────────────────────────────
   One accent colour drives the wordmark, the section headings and the
   meta rows; body copy stays charcoal so it reads at length. The page
   body is an ordered stream of blocks (image rows and paragraphs) that
   the admin composes, so copy can sit anywhere between rows. */

const MONO = "var(--font-dm-mono)";
const INK = "#1a1a1a";
const PANEL = "#f6f6f6";
const SIDE_PAD = "clamp(16px, 2.6vw, 44px)";
const GUTTER = "clamp(16px, 2.6vw, 44px)";

export type ProjectNeighbour = { slug: string; title: string } | null;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** The wordmark, tinted with the project's accent. The SVG carries its own
 *  fill, so it is used as a mask over a flat colour rather than as an
 *  <img> — that way one setting really does recolour it. */
function Wordmark({ color }: { color: string }) {
  return (
    <span
      role="img"
      aria-label="Sam Ahhee"
      style={{
        display: "block",
        width: "clamp(120px, 14vw, 190px)",
        aspectRatio: "321 / 62",
        background: color,
        maskImage: "url(/logo/samahhee.svg)",
        WebkitMaskImage: "url(/logo/samahhee.svg)",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

/** ← previous project · PROJECT NAME · next project → */
function ProjectNav({
  color,
  prev,
  next,
  title,
}: {
  color: string;
  prev: ProjectNeighbour;
  next: ProjectNeighbour;
  title?: string;
}) {
  const link: React.CSSProperties = { color, fontSize: "clamp(12px, 1.05vw, 15px)" };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <span style={{ flex: 1 }}>
        {prev && (
          <Link href={`/work/${prev.slug}`} className="hover:opacity-70 transition-opacity" style={link}>
            &larr; previous project
          </Link>
        )}
      </span>
      {title && (
        <span
          style={{
            color,
            fontSize: "clamp(12px, 1.15vw, 16px)",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {title}
        </span>
      )}
      <span style={{ flex: 1, textAlign: "right" }}>
        {next && (
          <Link href={`/work/${next.slug}`} className="hover:opacity-70 transition-opacity" style={link}>
            next project &rarr;
          </Link>
        )}
      </span>
    </div>
  );
}

/** A copy panel: accent heading, charcoal body. Used for the overview
 *  (which also carries the meta rail) and for every text block. */
function TextPanel({
  color,
  heading,
  body,
  rail,
}: {
  color: string;
  heading?: string | null;
  body?: string | null;
  rail?: React.ReactNode;
}) {
  return (
    <BendingPanel
      color={PANEL}
      className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto]"
      style={{
        padding: "clamp(24px, 3vw, 40px) clamp(24px, 3vw, 40px)",
        columnGap: "clamp(28px, 4vw, 72px)",
        rowGap: 24,
      }}
    >
      <div style={{ maxWidth: "68ch" }}>
        {heading && (
          <h2
            style={{
              color,
              fontSize: "clamp(13px, 1.15vw, 16px)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            {heading}
          </h2>
        )}
        {body && (
          <div style={{ color: INK, fontSize: "clamp(13px, 1.05vw, 15px)", lineHeight: 1.62 }}>
            {body.split(/\n{2,}/).map((para, i) => (
              <p key={i} style={{ marginTop: i === 0 ? 0 : "1em" }}>
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
      {rail ?? <div className="hidden md:block" aria-hidden />}
    </BendingPanel>
  );
}

/** Role / Year / Deliverables, mono and right-aligned, in the accent. */
function MetaRail({ color, project }: { color: string; project: PortfolioProject }) {
  const entries: Array<[string, string[]]> = [
    ["Role", project.role ? [project.role] : []],
    ["Year", project.year ? [project.year] : []],
    ["Deliverables", project.deliverables],
  ];
  return (
    <div style={{ fontFamily: MONO, color, textAlign: "right", fontSize: 11, lineHeight: 1.7 }}>
      {entries
        .filter(([, values]) => values.length > 0)
        .map(([label, values]) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <div style={{ fontStyle: "italic", opacity: 0.85 }}>{label}</div>
            {values.map((v) => (
              <div key={v}>{v}</div>
            ))}
          </div>
        ))}
    </div>
  );
}

/* Column templates and per-tile aspects chosen so both tiles in a row end
   up exactly the same height whatever the viewport width. */
const ROW_LAYOUTS = {
  single: { className: "grid grid-cols-1", aspects: ["2 / 1"] },
  portrait_landscape: { className: "grid grid-cols-1 md:grid-cols-[1fr_2fr]", aspects: ["3 / 4", "3 / 2"] },
  landscape_portrait: { className: "grid grid-cols-1 md:grid-cols-[2fr_1fr]", aspects: ["3 / 2", "3 / 4"] },
  split: { className: "grid grid-cols-1 md:grid-cols-2", aspects: ["4 / 3", "4 / 3"] },
} as const;

function ImageRow({ block }: { block: Extract<PortfolioBlock, { kind: "images" }> }) {
  const { className, aspects } = ROW_LAYOUTS[block.layout] ?? ROW_LAYOUTS.single;
  return (
    <div className={className} style={{ gap: GUTTER }}>
      {aspects.map((aspect, i) => (
        <WorkTile key={i} aspect={aspect} src={block.media[i]?.url} />
      ))}
    </div>
  );
}

export function ProjectPage({
  project,
  blocks,
  prev,
  next,
}: {
  project: PortfolioProject;
  blocks: PortfolioBlock[];
  prev: ProjectNeighbour;
  next: ProjectNeighbour;
}) {
  const accent = project.accentColor || "#FF2E31";

  return (
    <div className="font-portfolio-sans" style={{ background: "#fff" }}>
      <div style={{ padding: `24px ${SIDE_PAD} 0` }}>
        {/* Same meta row as the homepage — identical copy and styling, only
            tinted with this project's accent. */}
        <div style={{ ...META_STYLE, color: accent }}>
          <MetaRowContent />
        </div>

        {/* small centred wordmark, tinted by the project's accent */}
        <Link href="/" aria-label="Home" style={{ display: "block", margin: "clamp(28px, 4vw, 52px) auto 0", width: "fit-content" }}>
          <Wordmark color={accent} />
        </Link>

        <div style={{ marginTop: "clamp(24px, 3.4vw, 46px)" }}>
          <ProjectNav color={accent} prev={prev} next={next} title={project.title} />
        </div>
      </div>

      <div style={{ padding: `clamp(14px, 1.8vw, 24px) ${SIDE_PAD} 0`, display: "grid", gap: GUTTER }}>
        {/* hero */}
        {project.coverUrl && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr" }}>
            <WorkTile aspect="2 / 1" src={project.coverUrl} />
          </div>
        )}

        {/* overview: heading + body left, meta rail right */}
        {(project.overviewHeading || project.overviewBody || project.deliverables.length > 0) && (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
            <TextPanel
              color={accent}
              heading={project.overviewHeading}
              body={project.overviewBody}
              rail={<MetaRail color={accent} project={project} />}
            />
          </motion.div>
        )}

        {/* the composed stream */}
        {blocks.map((block) =>
          block.kind === "text" ? (
            <motion.div
              key={block.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
            >
              <TextPanel color={accent} heading={block.heading} body={block.body} />
            </motion.div>
          ) : (
            <ImageRow key={block.id} block={block} />
          ),
        )}

        <div style={{ padding: "clamp(20px, 3vw, 44px) 0 clamp(8px, 1.4vw, 20px)" }}>
          <ProjectNav color={accent} prev={prev} next={next} />
        </div>
      </div>

      <SiteFooter color={accent} sidePad={SIDE_PAD} />
    </div>
  );
}
