import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CopyEmailButton } from "@/components/copy-email-button";

const EMAIL = "samantha.ahhee@gmail.com";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div
      data-pair="butter-slate"
      className="text-white"
      style={{
        background: "#000000",
        minHeight: "100vh",
      }}
    >
      <SiteHeader tone="dark" />
      <main className="relative px-[var(--spacing-page)] py-20 md:py-32">
        <div className="relative grid grid-cols-12 gap-4">
          <div className="col-span-12 mb-12">
            <CopyEmailButton
              email={EMAIL}
              variant="title"
              label="Let’s connect."
            />
          </div>
          <div className="col-span-12 md:col-span-7 md:col-start-2 text-lg md:text-xl leading-relaxed text-white/80">
            <p>
              If you’ve got something brewing, a project to shape, an
              idea you’re still figuring out, a collaboration in mind,
              I’d love to hear about it. My inbox is open.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
