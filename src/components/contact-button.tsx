"use client";

import { useState } from "react";

const EMAIL = "samantha.ahhee@gmail.com";

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ContactButton({ className = "" }: { className?: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    if (!revealed) setRevealed(true);
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* no-op — text is still selectable */
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={revealed ? `Copy ${EMAIL}` : "Reveal email"}
      className={`inline-flex items-center gap-2 font-mono uppercase tracking-[0.14em] px-5 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-[0.98] ${className}`}
      style={{
        background: "var(--ink)",
        color: "var(--paper)",
        fontSize: "11px",
      }}
    >
      {!revealed ? (
        <>Let&apos;s work together →</>
      ) : (
        <>
          <span>{EMAIL}</span>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </>
      )}
    </button>
  );
}
