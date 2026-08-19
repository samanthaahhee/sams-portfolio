"use client";

import { useRef, useState } from "react";
import { SITE_EMAIL as EMAIL } from "@/lib/site";

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

/** Copy `text`, and flag it for a moment so the caller can show a tick.
 *
 *  The clipboard API refuses in more cases than you would expect —
 *  an unfocused document, a denied permission, any insecure origin. When
 *  it does, `fallback` is selected instead, so the reader still ends up
 *  one keystroke from having the address rather than clicking something
 *  that appears to do nothing. */
function useCopy(text: string, fallback?: React.RefObject<HTMLElement | null>) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      const node = fallback?.current;
      if (!node) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };
  return { copied, copy };
}

/** The address itself, which copies when clicked.
 *
 *  Deliberately not a mailto: link — that hands the reader off to
 *  whatever mail client the machine happens to have registered, which is
 *  often nothing or the wrong one. Copying keeps them on the page with
 *  the address on their clipboard.
 *
 *  Inherits colour and type from wherever it sits, so it can read as part
 *  of the copy around it. */
export function CopyEmail({
  email = EMAIL,
  className = "",
  style,
}: {
  email?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const addressRef = useRef<HTMLSpanElement>(null);
  const { copied, copy } = useCopy(email, addressRef);
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${email}`}
      className={`inline-flex items-center gap-2 transition-opacity hover:opacity-70 ${className}`}
      style={{ color: "inherit", font: "inherit", ...style }}
    >
      <span ref={addressRef}>{email}</span>
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}

export function ContactButton({ className = "" }: { className?: string }) {
  const [revealed, setRevealed] = useState(false);
  const { copied, copy } = useCopy(EMAIL);

  const handle = async () => {
    if (!revealed) setRevealed(true);
    await copy();
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
