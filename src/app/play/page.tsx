import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PillPhysics } from "@/components/pill-physics";

export const metadata = { title: "Play (preview)" };

export default function PlayPage() {
  return (
    <div data-pair="butter-slate">
      <SiteHeader pageNo="P" />

      <main className="px-[var(--spacing-page)] py-12 md:py-20">
        <header className="max-w-2xl mb-8 md:mb-12">
          <p className="font-mono text-[color:var(--meta)] mb-2">
            Preview · not linked publicly
          </p>
          <h1
            className="font-display"
            style={{ fontSize: "var(--text-d2)", lineHeight: 0.95 }}
          >
            Tag soup.
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-[color:var(--ink-soft)]">
            A little physics playground. Drag the pills, throw the stars,
            stack them up. Refresh to drop them again.
          </p>
        </header>

        <PillPhysics
          height={620}
          background="#000000"
          className="rounded-2xl"
        />

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--meta)]">
          Touch friendly · Reduced-motion users see a static pile.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
