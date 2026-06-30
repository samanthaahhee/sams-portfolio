"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import type { PortfolioJob, PortfolioInterest } from "@/lib/db-portfolio";

/* ── Placeholder data ─────────────────────────────────────────────── */

const TAB_COLORS = ["#f2a68a", "#f7c26b", "#7ec8c8", "#a0b4d6", "#b8a9c9"];

const PLACEHOLDER_JOBS: PortfolioJob[] = [
  {
    id: 1, company: "Ten 8 City", title: "Design & Business Consulting Studio",
    dateRange: "2026", descriptor: "Design & Business Consulting Studio",
    role: "Visual Comms Designer",
    clients: ["Small Stitch", "Butternut Box", "Hey Otis"],
    scope: [
      "Leading brand identity and visual communication projects",
      "Translating complex briefs into clear design systems",
      "Building and maintaining client relationships",
    ],
    tools: ["Figma", "Claude Anthropic", "Adobe Creative Suite"],
    periodLabel: "2026", orderIndex: 0, recommendation: null,
  },
  {
    id: 2, company: "Temper", title: "Contractor Platform",
    dateRange: "2022–2025", descriptor: "Dutch contractor marketplace",
    role: "Senior Visual Designer",
    clients: ["Temper", "Temper Staff"],
    scope: [
      "Led the Duplicate & Reskin brand strategy",
      "Built a shared design system across two apps",
      "Designed and shipped the retention email campaign (82% open rate)",
    ],
    tools: ["Figma", "Notion", "Lottie", "Zeplin"],
    periodLabel: "2022–25", orderIndex: 1,
    recommendation: {
      id: 1, author: "Jane van der Berg", date: "March 2025",
      relationship: "Jane managed Sam directly at Temper",
      body: "Sam brought an exceptional level of creative thinking and strategic clarity to every project. She navigated a genuinely complex rebrand under real deadline pressure and delivered work that unified our product experience across two distinct platforms. I'd work with Sam again without hesitation.",
    },
  },
  {
    id: 3, company: "Recharge.com", title: "Global top-up marketplace",
    dateRange: "2020–2022", descriptor: "Global top-up marketplace",
    role: "Visual Designer",
    clients: ["Recharge.com"],
    scope: [
      "Refreshed the product illustration system",
      "Redesigned the marketing website",
      "Developed the brand's editorial tone of voice",
    ],
    tools: ["Figma", "Illustrator", "Framer", "Webflow"],
    periodLabel: "2020–2018", orderIndex: 2, recommendation: null,
  },
  {
    id: 4, company: "BOS Ice Tea", title: "FMCG Brand",
    dateRange: "2018–2020", descriptor: "FMCG brand & campaign work",
    role: "Senior Art Director",
    clients: ["BOS Ice Tea"],
    scope: [
      "Concepted and led the full Benelux EU launch campaign",
      "Built the trade toolkit, activation and influencer packs",
      "Managed DTP artist and junior designer",
    ],
    tools: ["Illustrator", "InDesign", "Photoshop"],
    periodLabel: "2018–2015", orderIndex: 3, recommendation: null,
  },
  {
    id: 5, company: "Studio Ahhee", title: "Independent studio",
    dateRange: "2015–2018", descriptor: "Freelance & early career",
    role: "Art Director / Designer",
    clients: ["Various Cape Town clients"],
    scope: [
      "Freelance brand identity and print design",
      "Event design and illustration",
    ],
    tools: ["Illustrator", "InDesign", "Photoshop"],
    periodLabel: "2015–2013", orderIndex: 4, recommendation: null,
  },
];

const PLACEHOLDER_INTERESTS: PortfolioInterest[] = [
  { id: 1, groupLabel: "FILM DIRECTORS:", items: ["Taika Waititi, Hayao Miyazaki", "& Wes Anderson"], side: "left", position: 0 },
  { id: 2, groupLabel: "AUTHORS:", items: ["Taylor Jenkins Reid, Dolly Alderton"], side: "left", position: 1 },
  { id: 3, groupLabel: "MUSICIANS:", items: ["Mac Miller, Loyle Carner, Bonobo"], side: "left", position: 2 },
  { id: 4, groupLabel: "YOUTUBE CHANNELS:", items: ["Greatest Food Review Show Ever"], side: "right", position: 0 },
  { id: 5, groupLabel: "CURRENTLY OBSESSED WITH:", items: ["Birds (this is 30s), nail art"], side: "right", position: 1 },
];

/* ── Floating interests copy ──────────────────────────────────────── */

function InterestBlock({ interest, index }: { interest: PortfolioInterest; index: number }) {
  const yOffset = [0, 8, -6, 4, -10][index % 5];
  return (
    <motion.div
      className="pointer-events-none select-none"
      animate={{ y: [yOffset, yOffset + 10, yOffset] }}
      transition={{ duration: 6 + index * 1.3, repeat: Infinity, ease: "easeInOut" }}
    >
      <p className="font-lore font-bold text-white/90 text-xs md:text-sm leading-tight mb-0.5" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.25)" }}>
        {interest.groupLabel}
      </p>
      {interest.items.map((item, i) => (
        <p key={i} className="font-lore text-white/80 text-xs md:text-sm leading-snug" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.25)" }}>
          {item}
        </p>
      ))}
    </motion.div>
  );
}

/* ── Recommendation letter ────────────────────────────────────────── */

function RecLetter({ rec, cardRef }: { rec: NonNullable<PortfolioJob["recommendation"]>; cardRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <motion.div
      drag
      dragConstraints={cardRef}
      dragElastic={0.05}
      className="absolute top-4 right-4 w-52 bg-white rounded-sm cursor-grab active:cursor-grabbing z-20 select-none"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.12)", padding: "12px 14px" }}
      whileDrag={{ scale: 1.02, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
    >
      {/* Paper-clip graphic */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-neutral-400 text-lg select-none" aria-hidden>📎</div>
      <p className="font-portfolio-sans text-[10px] text-neutral-500 leading-relaxed mt-3">
        &ldquo;{rec.body}&rdquo;
      </p>
      <div className="mt-2 pt-2 border-t border-neutral-100">
        <p className="font-portfolio-sans font-semibold text-[10px] text-neutral-700">{rec.author}</p>
        <p className="font-portfolio-sans text-[10px] text-neutral-400">{rec.date}</p>
        <p className="font-portfolio-sans text-[10px] text-neutral-400 italic">{rec.relationship}</p>
      </div>
    </motion.div>
  );
}

/* ── Timeline card ────────────────────────────────────────────────── */

function TimelineCard({ job, color, isTop, onClick }: {
  job: PortfolioJob; color: string; isTop: boolean; onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 rounded-2xl overflow-visible"
      style={{ background: "#fce8de", pointerEvents: isTop ? "auto" : "none" }}
    >
      {/* Recommendation letter (draggable within card) */}
      {isTop && job.recommendation && (
        <RecLetter rec={job.recommendation} cardRef={cardRef} />
      )}

      <div className="p-6 md:p-8 h-full overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-portfolio-sans font-bold text-xl md:text-2xl text-neutral-800">
            {job.company}
          </h2>
          <span className="font-portfolio-sans text-sm text-neutral-500 shrink-0 ml-4">{job.dateRange}</span>
        </div>
        {job.descriptor && (
          <p className="font-portfolio-sans text-sm text-neutral-500 mb-5">{job.descriptor}</p>
        )}

        {job.role && (
          <div className="mb-4">
            <p className="font-portfolio-sans text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Role</p>
            <p className="font-portfolio-sans text-sm text-neutral-800">{job.role}</p>
          </div>
        )}

        {job.clients.length > 0 && (
          <div className="mb-4">
            <p className="font-portfolio-sans text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Clients</p>
            <p className="font-portfolio-sans text-sm text-neutral-800">{job.clients.join(", ")}</p>
          </div>
        )}

        {job.scope.length > 0 && (
          <div className="mb-4">
            <p className="font-portfolio-sans text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Scope of work</p>
            <ul className="space-y-1">
              {job.scope.map((s, i) => (
                <li key={i} className="font-portfolio-sans text-sm text-neutral-700 flex gap-2">
                  <span className="text-neutral-400 shrink-0">–</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {job.tools.length > 0 && (
          <div>
            <p className="font-portfolio-sans text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Tools</p>
            <p className="font-portfolio-sans text-sm text-neutral-700">{job.tools.join(", ")}</p>
          </div>
        )}
      </div>

      {/* Invisible click overlay for non-top cards */}
      {!isTop && (
        <button
          onClick={onClick}
          className="absolute inset-0 w-full h-full cursor-pointer"
          aria-label={`View ${job.company}`}
        />
      )}
    </div>
  );
}

/* ── Main About page component ────────────────────────────────────── */

export function AboutPage({
  jobs,
  interests,
}: {
  jobs: PortfolioJob[];
  interests: PortfolioInterest[];
}) {
  const jobList = jobs.length > 0 ? jobs : PLACEHOLDER_JOBS;
  const interestList = interests.length > 0 ? interests : PLACEHOLDER_INTERESTS;

  const [activeIdx, setActiveIdx] = useState(0);

  const left = interestList.filter((i) => i.side === "left");
  const right = interestList.filter((i) => i.side === "right");

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/images/about-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Subtle warm overlay so card reads on top of photo */}
      <div className="absolute inset-0 bg-black/20" aria-hidden />

      {/* ── Left floating interests ──────────────────────────────── */}
      <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-10 space-y-6 hidden md:block">
        {left.map((interest, i) => (
          <InterestBlock key={interest.id} interest={interest} index={i} />
        ))}
      </div>

      {/* ── Right floating interests ─────────────────────────────── */}
      <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-10 space-y-6 hidden md:block text-right">
        {right.map((interest, i) => (
          <InterestBlock key={interest.id} interest={interest} index={i + 3} />
        ))}
      </div>

      {/* ── Timeline folder card ─────────────────────────────────── */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 py-24">
        <div className="w-full max-w-lg">

          {/* Folder tabs */}
          <div className="flex gap-1 mb-0 relative z-10 pl-2">
            {jobList.map((job, i) => (
              <button
                key={job.id}
                onClick={() => setActiveIdx(i)}
                className="px-3 py-1.5 rounded-t-lg text-xs font-portfolio-sans font-semibold transition-all shrink-0"
                style={{
                  background: TAB_COLORS[i % TAB_COLORS.length],
                  color: "#fff",
                  opacity: i === activeIdx ? 1 : 0.65,
                  transform: i === activeIdx ? "translateY(2px)" : "none",
                  zIndex: i === activeIdx ? 10 : 1,
                }}
              >
                {job.periodLabel}
              </button>
            ))}
          </div>

          {/* Card stack */}
          <div className="relative" style={{ height: 480 }}>
            {jobList.map((job, i) => {
              const offset = (i - activeIdx) * 4;
              return (
                <motion.div
                  key={job.id}
                  className="absolute inset-0"
                  animate={{
                    zIndex: i === activeIdx ? 10 : Math.max(1, jobList.length - Math.abs(i - activeIdx)),
                    y: i === activeIdx ? 0 : offset,
                    scale: i === activeIdx ? 1 : 1 - Math.abs(i - activeIdx) * 0.015,
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ borderRadius: 16, overflow: "hidden" }}
                >
                  <TimelineCard
                    job={job}
                    color={TAB_COLORS[i % TAB_COLORS.length]}
                    isTop={i === activeIdx}
                    onClick={() => setActiveIdx(i)}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
