import type { Palette } from "@/lib/case-studies";

export function PageTheme({
  palette,
  children,
  className,
}: {
  palette: Palette;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-pair={palette} className={className}>
      {children}
    </div>
  );
}
