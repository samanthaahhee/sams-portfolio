"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="font-mono inline-flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
    >
      <span aria-hidden className="relative inline-block w-3 h-3">
        <span
          className="absolute inset-0 rounded-full border border-current transition-all"
          style={{
            background: theme === "dark" ? "currentColor" : "transparent",
          }}
        />
      </span>
      {theme === "light" ? "Day" : "Night"}
    </button>
  );
}
