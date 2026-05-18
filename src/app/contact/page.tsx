import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CopyEmailButton } from "@/components/copy-email-button";

const EMAIL = "samantha.ahhee@gmail.com";

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
          <div className="col-span-12 md:col-span-7 md:col-start-2 space-y-8 text-lg md:text-xl leading-relaxed">
            <p>
              I thrive in start up and scale up environments and am always
              on the lookout for interesting projects and freelance gigs.
              Please feel free to reach out to me anytime.
            </p>

            <div className="space-y-2">
              <CopyEmailButton email={EMAIL} />
              <p className="text-[color:var(--ink-soft)]">
                South African based in Amsterdam.
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
