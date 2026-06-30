import Link from "next/link";
import { getHeroCards } from "@/lib/db";
import { HeroCardsReorder } from "./_reorder";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HeroAdminPage() {
  const cards = await getHeroCards();

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono text-[color:var(--meta)] mb-2">Landing hero</p>
          <h1
            className="font-display text-4xl md:text-5xl"
            style={{ lineHeight: 0.95 }}
          >
            Hero card deck
          </h1>
          <p className="font-mono text-[color:var(--meta)] text-[11px] mt-3 max-w-prose leading-relaxed">
            Cards displayed in the auto-shuffling deck on the
            landing-hero preview. Drag to reorder. Click a row to
            edit. The image, title, link and optional accent /
            background colours are all editable per card.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/hero/batch"
            className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px] border border-[color:var(--rule)] hover:border-[color:var(--ink)] transition-colors"
          >
            Batch upload
          </Link>
          <Link
            href="/admin/hero/new"
            className="font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full text-[10px]"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            + New card
          </Link>
        </div>
      </header>

      {cards.length === 0 ? (
        <div className="rounded-md border border-[color:var(--rule)] p-10 text-center font-mono text-[color:var(--meta)] text-sm">
          No hero cards yet. Add one to start populating the deck.
        </div>
      ) : (
        <HeroCardsReorder initial={cards} />
      )}
    </div>
  );
}
