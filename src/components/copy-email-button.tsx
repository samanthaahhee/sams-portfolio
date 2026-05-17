"use client";

import { useState } from "react";

/**
 * Click-to-copy email block. Shows the email address with a small
 * copy icon; on click, writes the email to the clipboard and swaps
 * the icon to a "copied" check for ~1.5s. Falls back to a regular
 * mailto link on accessible focus / keyboard.
 */
export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — open the mail client as a fallback.
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <div className="inline-flex md:flex md:justify-end items-center gap-2">
      <a
        href={`mailto:${email}`}
        className="hover:text-[color:var(--ink)] transition-colors underline-offset-4 hover:underline"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={onCopy}
        aria-label={
          copied ? "Email address copied" : "Copy email address to clipboard"
        }
        className="inline-flex items-center justify-center w-6 h-6 rounded-sm border border-[color:var(--rule)] text-[color:var(--ink-soft)] hover:border-[color:var(--ink)] hover:text-[color:var(--ink)] transition-colors"
      >
        {copied ? (
          <CheckIcon />
        ) : (
          <CopyIcon />
        )}
      </button>
      {copied && (
        <span
          aria-live="polite"
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--meta)]"
        >
          Copied
        </span>
      )}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
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
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
