import Link from "next/link";

export function PortfolioNav({ active }: { active?: "work" | "about" | "contact" }) {
  return (
    <header
      className="flex items-center justify-between bg-white"
      style={{ height: 56, padding: "0 24px" }}
    >
      <Link
        href="/"
        className="font-lore font-bold leading-none hover:opacity-70 transition-opacity"
        style={{ fontSize: 18, color: "#1a1a1a" }}
      >
        SAM AHHEE
      </Link>
      <nav className="flex items-center gap-8 font-portfolio-sans" style={{ fontSize: 14 }}>
        {(["work", "about", "contact"] as const).map((key) => (
          <Link
            key={key}
            href={key === "about" ? "/about" : `/${key}`}
            className="hover:opacity-60 transition-opacity"
            style={{ fontWeight: active === key ? 700 : 400, color: "#1a1a1a" }}
          >
            {key === "about" ? "About me" : key.charAt(0).toUpperCase() + key.slice(1)}
          </Link>
        ))}
      </nav>
    </header>
  );
}
