import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "The Curator — AI Contract Review & Risk Analysis",
  description:
    "AI-powered contract review and risk analysis. Upload any contract, identify hidden risks, and get actionable rewrite suggestions in seconds. Supports 8 languages including Korean (계약서 검토 · 계약서 분석).",
  keywords: [
    "contract review",
    "AI contract analysis",
    "contract risk analysis",
    "contract review AI",
    "legal document review",
    "clause analysis",
    "contract management",
    "contract intelligence",
    "계약서 검토",
    "계약서 분석",
    "AI 계약서",
    "계약서 리스크",
    "contrato revisión",
    "analyse de contrat",
    "Vertragsanalyse",
    "契約書レビュー",
    "合同审查",
    "revisão de contrato",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  verification: {
    google: "NJ2kafGrDprHuIhJvbWsArGMh0jAoTG2p5LbvmPga-4",
  },
  openGraph: {
    title: "The Curator — AI Contract Review & Risk Analysis",
    description: "Upload any contract. Our AI reads every clause, flags hidden risks, and suggests rewrites in plain language. Free to start, 8 languages supported.",
    url: "https://thecurator.site",
    siteName: "The Curator",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Curator — AI Contract Review & Risk Analysis",
    description: "Upload any contract. AI identifies hidden risks, analyzes every clause, and suggests rewrites in seconds. Free to start.",
  },
  metadataBase: new URL("https://thecurator.site"),
  alternates: {
    canonical: "https://thecurator.site",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0&display=swap"
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
                "url": "https://thecurator.site",
                "description": "AI-powered contract review and risk analysis platform. Upload contracts, identify hidden risks, get rewrite suggestions. Supports English, Korean, Spanish, French, Japanese, Chinese, German, Portuguese.",
                "applicationCategory": "BusinessApplication",
                "applicationSubCategory": "Legal Technology",
                "operatingSystem": "Web",
                "author": {
                  "@type": "Organization",
                  "name": "The Curator",
                  "url": "https://thecurator.site",
                  "logo": "https://thecurator.site/icon.png"
                },
                "offers": [
                  { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Free — 10 analyses/month" },
                  { "@type": "Offer", "price": "29", "priceCurrency": "USD", "description": "Pro — 30 analyses/month" },
                  { "@type": "Offer", "price": "79", "priceCurrency": "USD", "description": "Business — Unlimited" }
                ]
              })
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "The Curator",
                "url": "https://thecurator.site",
                "logo": "https://thecurator.site/icon.png",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "email": "dlagywns9992@gmail.com",
                  "contactType": "customer support"
                }
              })
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "The Curator",
                "url": "https://thecurator.site",
                "description": "AI-powered contract review and risk analysis platform",
                "inLanguage": ["en", "ko", "es", "fr", "ja", "zh", "de", "pt"]
              })
            }}
          />
          {/* Sync html lang attribute with user language preference */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var m={English:'en',Korean:'ko',Spanish:'es',French:'fr',Japanese:'ja',Chinese:'zh',German:'de',Portuguese:'pt'};var l=localStorage.getItem('curator-ui-language');if(l&&m[l])document.documentElement.lang=m[l]}catch(e){}})();`
            }}
          />
          {/* Prevent Google Translate from translating Material Symbol icon ligatures */}
          <style dangerouslySetInnerHTML={{ __html: `.material-symbols-outlined{font-feature-settings:"liga"}` }} />
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
