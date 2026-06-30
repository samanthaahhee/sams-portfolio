"use client";

import { useEffect } from "react";

/**
 * Drop on any page that should always open at the top of the
 * viewport — fights both browser scroll restoration and stale URL
 * hashes (e.g. arriving via `/#selected-work` from a nav link).
 *
 * Runs once on mount. Uses an immediate-scroll-then-replaceState
 * sequence so the hash is cleared before the browser restores.
 */
export function ScrollTopOnMount() {
  useEffect(() => {
    // Strip any hash silently so the browser doesn't re-jump to it.
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    // Two writes — the first beats the browser's restored scroll, the
    // second runs after layout settles (handles late-mounting images
    // pushing content).
    window.scrollTo(0, 0);
    const id = window.setTimeout(() => window.scrollTo(0, 0), 0);
    return () => window.clearTimeout(id);
  }, []);
  return null;
}
