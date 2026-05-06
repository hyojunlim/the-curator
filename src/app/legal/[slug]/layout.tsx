import type { Metadata } from "next";

const TITLES: Record<string, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  security: "Security",
  api: "API Documentation",
  refund: "Refund Policy",
};

const DESCRIPTIONS: Record<string, string> = {
  privacy: "Learn how The Curator collects, uses, and protects your data during AI-powered contract review.",
  terms: "Read the terms and conditions for using The Curator AI contract analysis service.",
  security: "Learn about the security measures we use to protect your contracts and data.",
  api: "API documentation for integrating with The Curator contract analysis platform.",
  refund: "Our refund policy for subscription plans. 7-day refund window for new subscriptions.",
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const title = TITLES[params.slug] || "Legal";
  const description = DESCRIPTIONS[params.slug] || "Legal information for The Curator.";

  return {
    title: `${title} — The Curator`,
    description,
    alternates: {
      canonical: `https://thecurator.site/legal/${params.slug}`,
    },
  };
}

export default function LegalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const title = TITLES[params.slug] || "Legal";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://thecurator.site",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: title,
                item: `https://thecurator.site/legal/${params.slug}`,
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
