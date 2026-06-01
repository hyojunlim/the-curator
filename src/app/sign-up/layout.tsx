import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — The Curator | AI Contract Review",
  description:
    "Create a free account on The Curator. Analyze contracts, identify hidden risks, and get AI-powered rewrite suggestions in 8 languages.",
  alternates: {
    canonical: "https://thecurator.site/sign-up",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
