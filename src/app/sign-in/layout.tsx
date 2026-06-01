import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — The Curator | AI Contract Review",
  description:
    "Sign in to The Curator to analyze contracts, identify hidden risks, and get AI-powered rewrite suggestions in seconds.",
  alternates: {
    canonical: "https://thecurator.site/sign-in",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
