import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div data-pair="dustypink-ink">
      <SiteHeader pageNo="A" />
      <main className="px-[var(--spacing-page)] py-20 md:py-32">
        <div className="grid grid-cols-12 gap-4">
          <h1
            className="col-span-12 font-display mb-12"
            style={{ fontSize: "var(--text-d2)", lineHeight: 0.92 }}
          >
            Hey, I'm Sam.
          </h1>
          <div className="col-span-12 md:col-span-7 md:col-start-2 space-y-6 text-lg md:text-xl leading-relaxed">
            <p>
              I'm a visual communications designer working across brand,
              product, and editorial. I make things that are beautiful first
              and useful always.
            </p>
            <p className="text-[color:var(--ink-soft)]">
              About page in progress — the long version goes here, plus a
              downloadable PDF résumé.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
