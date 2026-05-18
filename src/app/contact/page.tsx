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
          <div className="col-span-12 mb-12">
            <CopyEmailButton
              email={EMAIL}
              variant="title"
              label="Let’s connect."
            />
          </div>
          <div className="col-span-12 md:col-span-7 md:col-start-2 text-lg md:text-xl leading-relaxed">
            <p>
              I thrive in start up and scale up environments and am always
              on the lookout for interesting projects and freelance gigs.
              Please feel free to reach out to me anytime.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
