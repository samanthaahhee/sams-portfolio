import { getPortfolioContactStrips, getPortfolioSettings } from "@/lib/db-portfolio";
import { PortfolioNav } from "@/components/portfolio/portfolio-nav";
import { ContactPage as ContactPageComponent } from "@/components/portfolio/contact-page";

export const metadata = {
  title: "Contact — Sam Ahhee",
  description: "Get in touch with Sam Ahhee — visual communication designer based in Amsterdam.",
};

export default async function ContactPage() {
  const [strips, settings] = await Promise.all([
    getPortfolioContactStrips(),
    getPortfolioSettings(),
  ]);
  return (
    <div className="font-portfolio-sans">
      <PortfolioNav active="contact" />
      <div className="h-screen pt-20">
        <ContactPageComponent
          strips={strips}
          ambientLeft={settings["contact_ambient_left"] || undefined}
          ambientRight={settings["contact_ambient_right"] || undefined}
        />
      </div>
    </div>
  );
}
