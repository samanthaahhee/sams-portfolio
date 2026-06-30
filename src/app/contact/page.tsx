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
        // Same fixed warm-mahogany gradient the landing hero falls
        // back to when no card image is sampled.
        background:
          "linear-gradient(160deg, #3a1632 0%, #2a1626 55%, #170a0d 100%), #170a0d",
        minHeight: "100vh",
      }}
    >
      <SiteHeader tone="dark" />
      <main className="relative px-[var(--spacing-page)] py-20 md:py-32">
        {/* Soft vignette mirroring the hero so the centre stays
            slightly darker than the edges. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)",
          }}
        />
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
