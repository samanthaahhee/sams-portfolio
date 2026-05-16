import type { Metadata } from "next";
import { jakarta, sometype } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://samahhee.com"),
  title: {
    default: "Sam Ahhee — Visual Communications Designer",
    template: "%s · Sam Ahhee",
  },
  description:
    "Sam Ahhee is a visual communications designer working across brand, product, and editorial. A swiss-army-knife, full-stack designer.",
  openGraph: {
    title: "Sam Ahhee — Visual Communications Designer",
    description: "Brand, product, and editorial design — a portfolio in print form.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${sometype.variable}`}
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
