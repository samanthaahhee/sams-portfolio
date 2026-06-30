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
      <main className="relative px-[var(--spacing-page)] py-20 md:py-32 flex flex-col items-center text-center">
        <div className="mb-12">
          <CopyEmailButton
            email={EMAIL}
            variant="title"
            label="Let’s connect."
          />
        </div>
        <p className="max-w-xl text-lg md:text-xl leading-relaxed text-white/80">
          If you’ve got something brewing, a project to shape, an
          idea you’re still figuring out, a collaboration in mind,
          I’d love to hear about it. My inbox is open.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
