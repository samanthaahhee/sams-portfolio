"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { key: "work", href: "/work", label: "Work" },
  { key: "about", href: "/about", label: "About me" },
  { key: "contact", href: "/contact", label: "Contact" },
] as const;

export function PortfolioNav({ active }: { active?: "work" | "about" | "contact" }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative bg-white" style={{ zIndex: 50 }}>
      <div className="flex items-center justify-between" style={{ height: 56, padding: "0 24px" }}>
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-lore font-bold leading-none hover:opacity-70 transition-opacity"
          style={{ fontSize: 18, color: "#1a1a1a" }}
        >
          SAM AHHEE
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-8 font-portfolio-sans" style={{ fontSize: 14 }}>
          {LINKS.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className="hover:opacity-60 transition-opacity"
              style={{ fontWeight: active === l.key ? 700 : 400, color: "#1a1a1a" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger → X */}
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="md:hidden relative"
          style={{ width: 28, height: 28 }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: 3,
                right: 3,
                height: 2,
                borderRadius: 2,
                background: "#1a1a1a",
                top: open ? 13 : 8 + i * 6,
                transform: open
                  ? i === 0 ? "rotate(45deg)" : i === 2 ? "rotate(-45deg)" : "scaleX(0)"
                  : "none",
                transition: "top .2s ease, transform .2s ease",
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile dropdown (overlays content) */}
      {open && (
        <nav
          className="md:hidden absolute left-0 right-0 bg-white font-portfolio-sans"
          style={{ top: 56, padding: "4px 24px 16px", borderBottom: "1px solid #eee", boxShadow: "0 8px 20px rgba(0,0,0,0.06)" }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block hover:opacity-60 transition-opacity"
              style={{ fontWeight: active === l.key ? 700 : 400, color: "#1a1a1a", fontSize: 18, padding: "12px 0" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
