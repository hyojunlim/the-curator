import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className={`${inter.variable} ${manrope.variable} font-body bg-surface text-on-surface`}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
