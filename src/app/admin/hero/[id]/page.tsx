import Link from "next/link";
import { notFound } from "next/navigation";
import { getHeroCard } from "@/lib/db";
import { HeroCardForm } from "../_form";

export const dynamic = "force-dynamic";

export default async function EditHeroCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numeric = Number(id);
  if (!numeric || Number.isNaN(numeric)) notFound();
  const card = await getHeroCard(numeric);
  if (!card) notFound();

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
          Edit hero card
        </h1>
      </header>

      <HeroCardForm initial={card} />
    </div>
  );
}
