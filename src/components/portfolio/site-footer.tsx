"use client";

import { motion } from "motion/react";
import { BendingPanel } from "./bending-panel";

/* Real profiles, not invented: LinkedIn from src/lib/about.ts, Behance from
   the source note in src/lib/projects.ts. */
export const SOCIALS = [
  { label: "Behance", href: "https://www.behance.net/Samantha_ahhee" },
  { label: "LinkedIn", href: "https://linkedin.com/in/samanthaahhee" },
];

export const CONTACT = {
  email: "samantha.ahhee@gmail.com",
  phone: "+31 68 545 5874",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** The tall contact panel that closes every page. `color` lets a project
 *  page tint it with its own accent; it defaults to the site red.
 *
 *  No bottom margin — the panel runs to the very end of the document so
 *  there is no white strip beneath it. */
export function SiteFooter({
  color = "#FF2E31",
  sidePad = "clamp(16px, 2.6vw, 44px)",
}: {
  color?: string;
  sidePad?: string;
}) {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={fadeUp}
      className="font-portfolio-sans"
      style={{ margin: `0 ${sidePad}` }}
    >
      <BendingPanel
        color={color}
        radius={8}
        style={{
          color: "#fff",
          padding: "clamp(28px, 4.4vw, 76px)",
          /* headline pinned to the top, details to the bottom, with the
             block itself holding open the tall gap between them */
          minHeight: "clamp(320px, 34vw, 620px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 40,
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.5rem, 3.2vw, 3.1rem)",
            lineHeight: 1.18,
            fontWeight: 500,
            letterSpacing: "-0.015em",
            maxWidth: "16ch",
          }}
        >
          Looking forward to new projects and opportunities.
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "28px 32px",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: "#fff", fontSize: "clamp(12px, 1.05vw, 15px)", letterSpacing: "0.06em" }}
                >
                  <span aria-hidden style={{ marginRight: 6 }}>
                    &#8627;
                  </span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <div style={{ textAlign: "right", marginLeft: "auto", display: "grid", gap: 2 }}>
            <a
              href={`mailto:${CONTACT.email}`}
              className="hover:opacity-70 transition-opacity"
              style={{ color: "#fff", fontSize: "clamp(1.05rem, 2.6vw, 2.55rem)", letterSpacing: "-0.01em" }}
            >
              {CONTACT.email}
            </a>
            <a
              href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
              className="hover:opacity-70 transition-opacity"
              style={{ color: "#fff", fontSize: "clamp(1.05rem, 2.6vw, 2.55rem)", letterSpacing: "-0.01em" }}
            >
              {CONTACT.phone}
            </a>
          </div>
        </div>
      </BendingPanel>
    </motion.footer>
  );
}
