import type { Metadata } from "next";
import { jacquard, jakarta, sometype } from "@/lib/fonts";
import { lore, jakarta as jakartaPortfolio, dmMono, dmSans } from "@/lib/fonts-portfolio";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://samahhee.com"),
  title: {
    default: "Sam Ahhee Schneider — Multidisciplinary Designer",
    template: "%s · Sam Ahhee Schneider",
  },
  description:
    "Sam Ahhee Schneider is a multidisciplinary designer working across brand, product, illustration, and visual communication.",
  openGraph: {
    title: "Sam Ahhee Schneider — Multidisciplinary Designer",
    description:
      "Brand, product, illustration, and visual communication. Currently building HeyOtis at Ten 8 City in Amsterdam.",
    type: "website",
    images: [
      {
        url: "/og-storefront.png",
        width: 1895,
        height: 1296,
        alt: "Smallstitch — 3D illustration of the storefront with pink and green striped awning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sam Ahhee Schneider — Multidisciplinary Designer",
    description:
      "Brand, product, illustration, and visual communication. Currently building HeyOtis at Ten 8 City in Amsterdam.",
    images: ["/og-storefront.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${sometype.variable} ${jacquard.variable} ${lore.variable} ${jakartaPortfolio.variable} ${dmMono.variable} ${dmSans.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            /* Light unless dark was explicitly chosen — must match
               ThemeProvider's rule exactly or the page flashes the other
               theme before hydration. */
            /* The homepage loading sequence runs once a visit. React only
               learns that after hydration, so a returning visitor would
               otherwise watch the white veil mount and fade — most of the
               effect the flag exists to skip. Deciding it here, before
               first paint, removes the flash; React unmounts the elements
               a moment later. The rule ships inline rather than in the
               stylesheet so it cannot arrive after the markup it hides. */
            __html: `(()=>{try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark');}catch{}var s=document.createElement('style');s.textContent='.intro-seen [data-intro]{display:none!important}';document.head.appendChild(s);try{if(sessionStorage.getItem('samahhee:intro-seen')==='1')document.documentElement.classList.add('intro-seen');}catch{}})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
