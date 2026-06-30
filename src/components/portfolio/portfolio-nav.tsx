import Link from "next/link";

export function PortfolioNav({ active }: { active?: "work" | "about" | "contact" }) {
  const link = (href: string, label: string, key: typeof active) => (
    <Link
      href={href}
      className={`text-sm tracking-[0.04em] transition-opacity hover:opacity-70 ${active === key ? "font-semibold" : "font-normal"}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 py-5">
      <Link
        href="/"
        className="font-lore text-xl md:text-2xl leading-none tracking-tight hover:opacity-70 transition-opacity"
      >
        SAM AHHEE
      </Link>
      <nav className="flex items-center gap-7 md:gap-10 font-portfolio-sans text-[color:var(--ink)]">
        {link("/work", "Work", "work")}
        {link("/about", "About me", "about")}
        {link("/contact", "Contact", "contact")}
      </nav>
    </header>
  );
}
