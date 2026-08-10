"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { PortfolioBlock, PortfolioMedia, PortfolioProject } from "@/lib/db-portfolio";
import { BendingPanel } from "./bending-panel";
import { SiteFooter } from "./site-footer";
import { FRAME_MS, WorkTile } from "./work-tile";
import { META_STYLE, MetaRowContent } from "./site-meta";
import { ROW_LAYOUTS } from "@/lib/block-layouts";

/* ── Project page ──────────────────────────────────────────────────────
   One accent colour drives the wordmark, the headings and the meta
   rows; body copy stays near-black so it reads at length. The page body
   is an ordered stream of blocks (image rows and paragraphs) that the
   admin composes, so copy can sit anywhere between rows. */

const MONO = "var(--font-dm-mono)";
const SANS = "var(--font-dm-sans)";
/* Body copy sits at near-black rather than the accent — the accent is
   for headers, meta and the wordmark. */
const INK = "#232323";
const PANEL = "#FCF9F9";
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

/** ← previous project · CLIENT | TITLE · next project → */
function ProjectNav({
  color,
  prev,
  next,
  title,
  client,
}: {
  color: string;
  prev: ProjectNeighbour;
  next: ProjectNeighbour;
  title?: string;
  client?: string;
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
            display: "inline-flex",
            alignItems: "center",
            gap: "0.9em",
          }}
        >
          {client && (
            <>
              {client}
              {/* hairline divider, not a typed pipe — keeps its weight
                  independent of the label's */}
              <span aria-hidden style={{ width: 1, height: "1em", background: "currentColor", opacity: 0.5 }} />
            </>
          )}
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

/** A copy panel, set entirely in the project's accent. Used for the
 *  overview (which also carries the meta rail) and every text block. */
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
              fontFamily: SANS,
              color,
              fontSize: "clamp(13px, 1.15vw, 16px)",
              fontWeight: 700,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            {heading}
          </h2>
        )}
        {body && (
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 500,
              color: INK,
              fontSize: "clamp(13px, 1.05vw, 15px)",
              lineHeight: 1.62,
            }}
          >
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

/** One image at its own aspect ratio, full width, uncropped.
 *
 *  A plain <img>, not the warping canvas: canvas drawImage paints only
 *  an animated GIF's first frame, so anything animated would freeze.
 *  The trade-off is that this row does not bend through the viewport's
 *  bottom band the way the cropped rows do. */
function NativeImage({ frames }: { frames: PortfolioMedia[] }) {
  const [i, setI] = useState(0);
  /* A native slot can hold a sequence too, so an original-size row loops
     the same way a cropped one does. */
  useEffect(() => {
    if (frames.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % frames.length), FRAME_MS);
    return () => clearInterval(t);
  }, [frames.length]);

  const media = frames[i % Math.max(frames.length, 1)];
  if (!media) {
    return <div style={{ aspectRatio: "2 / 1", background: "#e5e5e5", borderRadius: 4 }} />;
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={media.url}
      alt=""
      /* Deliberately no width/height attributes and no aspect-ratio: the
         stored dimensions are missing for library picks and can be stale
         for anything else, and either would force a box the file does not
         actually have — which stretches it. Letting the image size itself
         costs a little layout shift and can never distort. */
      style={{ display: "block", width: "100%", height: "auto", borderRadius: 4 }}
    />
  );
}

function ImageRow({ block }: { block: Extract<PortfolioBlock, { kind: "images" }> }) {
  if (block.layout === "native") {
    return <NativeImage frames={block.slots[0] ?? []} />;
  }
  const { className, aspects } = ROW_LAYOUTS[block.layout] ?? ROW_LAYOUTS.single;
  return (
    <div className={className} style={{ gap: GUTTER }}>
      {aspects.map((aspect, i) => (
        <WorkTile
          key={i}
          aspect={aspect}
          frames={(block.slots[i] ?? []).map((m) => ({
            url: m.url,
            focalX: m.focalX,
            focalY: m.focalY,
          }))}
        />
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
          <ProjectNav color={accent} prev={prev} next={next} title={project.title} client={project.client} />
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
