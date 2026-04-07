import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "The Curator — AI Contract Intelligence",
  description:
    "AI-powered contract review that identifies hidden risks before they become liabilities.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "The Curator — AI Contract Intelligence",
    description: "Upload any contract. Our AI reads every clause, flags every risk, and explains every implication in plain language.",
    url: "https://the-curator-virid.vercel.app",
    siteName: "The Curator",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "The Curator — AI Contract Intelligence",
    description: "Upload any contract. Our AI reads every clause, flags every risk, and explains every implication in plain language.",
  },
  metadataBase: new URL("https://the-curator-virid.vercel.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className={`${inter.variable} ${manrope.variable} font-body bg-surface text-on-surface`}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "The Curator",
                "description": "AI-powered contract review and risk analysis platform",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "description": "Free contract analysis"
                }
              })
            }}
          />
          {/* Prevent Google Translate from translating Material Symbol icon ligatures */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){function f(){document.querySelectorAll('.material-symbols-outlined').forEach(function(e){e.setAttribute('translate','no');e.classList.add('notranslate')})};f();new MutationObserver(f).observe(document.body,{childList:true,subtree:true})})();`
            }}
          />
          <LanguageProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
              {children}
            </ThemeProvider>
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
