import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div data-pair="butter-slate">
      <SiteHeader pageNo="C" />
      <main className="px-[var(--spacing-page)] py-20 md:py-32">
        <div className="grid grid-cols-12 gap-4">
          <h1
            className="col-span-12 font-display mb-12"
            style={{ fontSize: "var(--text-d2)", lineHeight: 0.92 }}
          >
            Say hi.
          </h1>
          <div className="col-span-12 md:col-span-6 md:col-start-2 space-y-6 text-lg md:text-xl leading-relaxed">
            <p>
              Best for: full-time design roles, brand-and-product engagements,
              and quietly weird side projects.
            </p>
            <p className="text-[color:var(--ink-soft)]">
              Email + form coming in the next pass.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
