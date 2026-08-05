import type { Metadata } from "next";
import { jacquard, jakarta, sometype } from "@/lib/fonts";
import { lore, jakarta as jakartaPortfolio, dmMono } from "@/lib/fonts-portfolio";
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
      className={`${jakarta.variable} ${sometype.variable} ${jacquard.variable} ${lore.variable} ${jakartaPortfolio.variable} ${dmMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{const t=localStorage.getItem('theme');const s=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';const x=t||s;if(x==='dark')document.documentElement.classList.add('dark');}catch{}})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
