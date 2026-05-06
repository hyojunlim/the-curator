import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center & FAQ — The Curator | AI Contract Review",
  description:
    "Get help with The Curator AI contract review platform. FAQ about file types, AI accuracy, supported languages, data security, pricing plans, and contract export features.",
  alternates: {
    canonical: "https://thecurator.site/support",
  },
};

const FAQ_ITEMS = [
  {
    question: "What file types are supported?",
    answer:
      "The Curator supports PDF and DOCX files up to 10 MB. Simply drag and drop your contract or click to browse. The AI will extract and analyze the full text automatically.",
  },
  {
    question: "How accurate is the AI analysis?",
    answer:
      "The Curator uses Google Gemini AI (2.5 Flash) to identify risks, summarize clauses, and highlight key terms. While the AI is highly capable, its output is for informational purposes only and does not constitute legal advice. Always consult a qualified attorney before making legal decisions.",
  },
  {
    question: "What languages are supported?",
    answer:
      "The Curator supports 8 languages: English, Korean, Spanish, French, Japanese, Chinese, German, and Portuguese. You can select your preferred language in Settings, and the AI will generate analysis results in that language.",
  },
  {
    question: "Is my contract data secure?",
    answer:
      "Yes. All data in transit is encrypted with TLS 1.3. Your contracts are stored in a Supabase database protected by Row Level Security (RLS), ensuring complete data isolation between users. Documents sent to the AI model are processed ephemerally and are not retained by the AI provider.",
  },
  {
    question: "How do I delete my data?",
    answer:
      "You can delete individual contracts from the Review History page by clicking the delete icon on any contract card. To manage your account or request full data deletion, visit the Settings page.",
  },
  {
    question: "What's included in each plan?",
    answer:
      "Free plan: 10 analyses/month with 7-day history. Pro ($29/month): 30 analyses/month, 90-day history, PDF export, search, and priority support. Business ($79/month): Unlimited analyses, unlimited history, all Pro features, and dedicated support.",
  },
  {
    question: "Can I export my analysis results?",
    answer:
      "Yes. PDF export is available on Pro and Business plans. From any contract detail page, click the export button to download a formatted PDF report of the full analysis, including risk scores, clause summaries, and recommendations.",
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />
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
                name: "Help Center",
                item: "https://thecurator.site/support",
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
