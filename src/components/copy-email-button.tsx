"use client";

import { useState } from "react";

type Variant = "inline" | "title";

/**
 * Click-to-copy email block. Two variants:
 *  - "inline" (default): mono-sized address with a small copy icon
 *    button to the right. Used in the footer and elsewhere as a
 *    body-level affordance.
 *  - "title": display-weight address rendered as a hero title with
 *    a copy icon scaled to match. Used on the Contact page as the
 *    page heading.
 *
 * In both cases, clicking the icon writes the email to the clipboard
 * and swaps to a check for ~1.5s. Clipboard API unavailable → opens
 * the mail client as a fallback. The address itself remains a
 * standard mailto link for keyboard / right-click users.
 */
export function CopyEmailButton({
  email,
  variant = "inline",
  label,
}: {
  email: string;
  variant?: Variant;
  /** Custom display text for the title variant. Defaults to the
   *  email address itself. The copy action always writes `email`
   *  to the clipboard regardless of what's shown. */
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  if (variant === "title") {
    return (
      <h1
        className="font-display flex flex-wrap items-center gap-4 md:gap-6 break-all"
        style={{
          fontSize: "var(--text-d2)",
          lineHeight: 0.92,
          letterSpacing: "-0.02em",
        }}
      >
        <a
          href={`mailto:${email}`}
          className="hover:opacity-80 transition-opacity"
        >
          {label ?? email}
        </a>
        <button
          type="button"
          onClick={onCopy}
          aria-label={
            copied
              ? "Email address copied"
              : "Copy email address to clipboard"
          }
          className="inline-flex items-center justify-center rounded-md border transition-colors flex-shrink-0"
          style={{
            width: "0.9em",
            height: "0.9em",
            borderColor: "var(--rule-strong)",
            color: copied ? "var(--pair-b)" : "var(--ink-soft)",
          }}
        >
          {copied ? <CheckIcon big /> : <CopyIcon big />}
        </button>
        {copied && (
          <span
            aria-live="polite"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--meta)]"
          >
            Copied
          </span>
        )}
      </h1>
    );
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
        {copied ? <CheckIcon /> : <CopyIcon />}
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

function CopyIcon({ big = false }: { big?: boolean }) {
  const size = big ? "55%" : 12;
  return (
    <svg
      width={size}
      height={size}
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

function CheckIcon({ big = false }: { big?: boolean }) {
  const size = big ? "55%" : 12;
  return (
    <svg
      width={size}
      height={size}
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
