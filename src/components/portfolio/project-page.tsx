"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { isMotionMedia } from "@/lib/db-portfolio";
import type { PortfolioBlock, PortfolioMedia, PortfolioProject } from "@/lib/db-portfolio";
import { BendingPanel } from "./bending-panel";
import { SiteFooter } from "./site-footer";
import { FRAME_MS, WorkTile } from "./work-tile";
import { META_STYLE, MetaRowContent } from "./site-meta";
import { ROW_LAYOUTS, compareAspect, rowAspect } from "@/lib/block-layouts";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { ImageStack } from "@/components/image-stack";

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

/** ← back to the grid · CLIENT | TITLE · next project →
 *
 *  The left slot returns to the homepage rather than stepping to the
 *  previous project, anchored to this project's own tile — you land back
 *  where you were looking instead of at the top of the page. */
function ProjectNav({
  color,
  slug,
  next,
  title,
  client,
}: {
  color: string;
  slug: string;
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
        <Link href={`/#work-${slug}`} className="hover:opacity-70 transition-opacity" style={link}>
          &larr; back to work
        </Link>
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
 *  Stills go through the warping canvas like every other row, sized to
 *  the file's own proportions so "original size" still means uncropped —
 *  a cover crop to the image's own ratio takes nothing off. That way an
 *  original-size row bends through the viewport's bottom band exactly
 *  like its neighbours.
 *
 *  Animated GIFs cannot: canvas drawImage paints only their first frame,
 *  so routing them through it would silently freeze them. They stay a
 *  plain <img>, animating but not bending. That trade is unavoidable —
 *  the warp needs per-row redrawing and a GIF's animation is owned by
 *  the browser's image decoder. */
function NativeImage({ frames }: { frames: PortfolioMedia[] }) {
  const [i, setI] = useState(0);
  const [measured, setMeasured] = useState<string | null>(null);

  /* A native slot can hold a sequence too, so an original-size row loops
     the same way a cropped one does. */
  useEffect(() => {
    if (frames.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % frames.length), FRAME_MS);
    return () => clearInterval(t);
  }, [frames.length]);

  const media = frames[i % Math.max(frames.length, 1)];
  const isGif = isMotionMedia(media);

  /* The canvas needs a box before it can draw. Stored dimensions are
     used when present; most migrated rows have none, so the file itself
     is measured once. */
  const stored = media?.width && media?.height ? `${media.width} / ${media.height}` : null;
  const ratio = stored ?? measured;
  const needsMeasuring = !!media && !isGif && !stored && !measured;
  const measureUrl = needsMeasuring ? media.url : null;

  useEffect(() => {
    if (!measureUrl) return;
    let cancelled = false;
    const probe = new window.Image();
    probe.onload = () => {
      if (!cancelled && probe.naturalWidth && probe.naturalHeight) {
        setMeasured(`${probe.naturalWidth} / ${probe.naturalHeight}`);
      }
    };
    probe.src = measureUrl;
    return () => {
      cancelled = true;
    };
  }, [measureUrl]);

  if (!media) {
    return <div style={{ aspectRatio: "2 / 1", background: "#e5e5e5", borderRadius: 4 }} />;
  }

  if (!isGif && ratio) {
    /* WorkTile measures its siblings to work out how the row leans; as an
       only child it sits centred, which is what a full-width row wants. */
    return (
      <div className="grid grid-cols-1">
        <WorkTile
          aspect={ratio}
          frames={frames.map((m) => ({
            url: m.url,
            focalX: m.focalX,
            focalY: m.focalY,
            zoom: m.zoom,
          }))}
        />
      </div>
    );
  }

  const naturalStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: "auto",
    borderRadius: 4,
  };

  if (media.type === "mp4") {
    return <video src={media.url} autoPlay loop muted playsInline style={naturalStyle} />;
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={media.url}
      alt=""
      /* Deliberately no width/height attributes and no aspect-ratio: the
         stored dimensions are missing for library picks and can be stale
         for anything else, and either would force a box the file does not
         actually have — which stretches it. */
      style={naturalStyle}
    />
  );
}

/** A GIF in a cropped row.
 *
 *  Never the canvas: drawImage paints only a GIF's first frame, so any
 *  animated image routed through the warp silently froze — which is what
 *  happened to six of them in three-up rows. A plain <img> with the same
 *  cover crop, focal point and zoom keeps the frame identical to its
 *  neighbours and keeps the animation. It forfeits only the scroll warp,
 *  which is the trade animation always costs. */
function CroppedMotion({ media, aspect }: { media: PortfolioMedia; aspect: string }) {
  const style: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: "100%",
    aspectRatio: aspect,
    objectFit: "cover",
    objectPosition: `${media.focalX * 100}% ${media.focalY * 100}%`,
    transform: media.zoom > 1 ? `scale(${media.zoom})` : undefined,
    transformOrigin: `${media.focalX * 100}% ${media.focalY * 100}%`,
    borderRadius: 4,
  };

  if (media.type === "mp4") {
    return (
      /* muted + playsInline are what let a browser autoplay at all, and
         a silent looping clip is the point here — it stands in for a GIF
         at a fraction of the weight. */
      <video src={media.url} autoPlay loop muted playsInline style={style} />
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={media.url}
      alt=""
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        aspectRatio: aspect,
        objectFit: "cover",
        objectPosition: `${media.focalX * 100}% ${media.focalY * 100}%`,
        transform: media.zoom > 1 ? `scale(${media.zoom})` : undefined,
        transformOrigin: `${media.focalX * 100}% ${media.focalY * 100}%`,
        borderRadius: 4,
      }}
    />
  );
}

function isAnimated(m?: PortfolioMedia) {
  return isMotionMedia(m);
}

function ImageRow({ block, accent }: { block: Extract<PortfolioBlock, { kind: "images" }>; accent: string }) {
  if (block.layout === "native") {
    return <NativeImage frames={block.slots[0] ?? []} />;
  }

  /* Before/after and the layered stack reuse the components the legacy
     pages already used, so the interaction is the one that shipped
     rather than a second implementation of it. */
  if (block.layout === "compare") {
    const first = block.slots[0]?.[0];
    const after = block.slots[1]?.[0]?.url;
    if (!first?.url || !after) {
      return <div style={{ aspectRatio: "4 / 3", background: "#e5e5e5", borderRadius: 4 }} />;
    }
    /* The frame is the BEFORE image's own shape, so it is shown whole and
       the after is cropped to meet it. */
    return <BeforeAfterSlider before={first.url} after={after} aspect={compareAspect(first)} color={accent} />;
  }

  if (block.layout === "stack") {
    const images = (block.slots[0] ?? []).map((m) => m.url);
    if (images.length === 0) {
      return <div style={{ aspectRatio: "4 / 3", background: "#e5e5e5", borderRadius: 4 }} />;
    }
    return <ImageStack images={images} />;
  }
  const { className, aspects } = ROW_LAYOUTS[block.layout] ?? ROW_LAYOUTS.single;
  /* Rows whose frame comes from the pictures rather than a fixed ratio. */
  const shared = rowAspect(block.layout, block.slots[0]?.[0]);
  return (
    <div className={className} style={{ gap: GUTTER }}>
      {aspects.map((a, i) => {
        const frame = shared ?? a;
        const first = block.slots[i]?.[0];
        if (isAnimated(first)) return <CroppedMotion key={i} media={first!} aspect={frame} />;
        return (
          <WorkTile
            key={i}
            aspect={frame}
            frames={(block.slots[i] ?? []).map((m) => ({
              url: m.url,
              focalX: m.focalX,
              focalY: m.focalY,
              zoom: m.zoom,
            }))}
          />
        );
      })}
    </div>
  );
}

export function ProjectPage({
  project,
  blocks,
  next,
}: {
  project: PortfolioProject;
  blocks: PortfolioBlock[];
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
          <ProjectNav color={accent} slug={project.slug} next={next} title={project.title} client={project.client} />
        </div>
      </div>

      <div style={{ padding: `clamp(14px, 1.8vw, 24px) ${SIDE_PAD} 0`, display: "grid", gap: GUTTER }}>
        {/* hero */}
        {project.showHero && project.coverUrl && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr" }}>
            <WorkTile
              aspect="2 / 1"
              frames={[
                {
                  url: project.coverUrl,
                  focalX: project.coverFocalX,
                  focalY: project.coverFocalY,
                  zoom: project.coverZoom,
                },
              ]}
            />
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
          block.kind === "embed" ? (
            block.url ? (
              <motion.div
                key={block.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
              >
                <YouTubeEmbed url={block.url} caption={block.caption ?? undefined} />
              </motion.div>
            ) : null
          ) : block.kind === "text" ? (
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
            <ImageRow key={block.id} block={block} accent={accent} />
          ),
        )}

        <div style={{ padding: "clamp(20px, 3vw, 44px) 0 clamp(8px, 1.4vw, 20px)" }}>
          <ProjectNav color={accent} slug={project.slug} next={next} />
        </div>
      </div>

      <SiteFooter color={accent} sidePad={SIDE_PAD} />
    </div>
  );
}
