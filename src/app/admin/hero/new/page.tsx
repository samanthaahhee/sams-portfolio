import Link from "next/link";
import { HeroCardForm } from "../_form";

export default function NewHeroCardPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header>
        <Link
          href="/admin/hero"
          className="font-mono text-[color:var(--meta)] hover:text-[color:var(--ink)] text-[11px] uppercase tracking-[0.14em]"
        >
          ← Hero deck
        </Link>
        <h1
          className="font-display text-4xl md:text-5xl mt-3"
          style={{ lineHeight: 0.95 }}
        >
          New hero card
        </h1>
      </header>

      <HeroCardForm />
    </div>
  );
}
