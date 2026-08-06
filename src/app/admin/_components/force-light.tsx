"use client";

import { useEffect } from "react";

/** The admin is a tool, not a themed surface — it always renders light,
 *  even if dark was chosen for the public site or is still stored from
 *  before light became the default. */
export function ForceLight() {
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.remove("dark");

    /* Removing it once is not enough: ThemeProvider sits above this in the
       tree, so its effect runs afterwards and puts the class straight
       back. Watch the attribute and keep stripping it for as long as an
       admin page is mounted. */
    const observer = new MutationObserver(() => {
      if (root.classList.contains("dark")) root.classList.remove("dark");
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      if (wasDark) root.classList.add("dark");
    };
  }, []);
  return null;
}
