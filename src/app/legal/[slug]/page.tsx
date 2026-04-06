import Link from "next/link";

interface Section {
  heading: string;
  text: string;
}

const CONTENT: Record<string, { title: string; updated: string; sections: Section[] }> = {
  privacy: {
    title: "Privacy Policy",
    updated: "April 1, 2026",
    sections: [
      { heading: "Information We Collect", text: "We collect account information (name, email) via Clerk authentication, and contract documents you upload for analysis. We also collect usage data such as analysis counts and timestamps." },
      { heading: "How We Use Your Data", text: "Your documents are processed by Google Gemini AI for risk analysis. Documents are sent to the AI model in real-time and are not permanently stored by the AI provider. Analysis results are stored in your personal Supabase database, accessible only to your account." },
      { heading: "Data Retention", text: "Your analysis results and contract metadata are retained in your account until you delete them. You may delete individual contracts or request complete account deletion at any time through Settings." },
      { heading: "Third-Party Services", text: "We use Clerk for authentication, Supabase for data storage, Google Gemini for AI analysis, and PayPal for payment processing. Each service has its own privacy policy governing their handling of data." },
      { heading: "Data Security", text: "All data in transit is encrypted with TLS 1.3. Database access is restricted via Row Level Security policies. API keys and secrets are stored as server-side environment variables and never exposed to clients." },
      { heading: "Your Rights", text: "You may access, export, or delete your data at any time. For GDPR or CCPA requests, contact us at privacy@thecurator.ai." },
    ],
  },
  terms: {
    title: "Terms of Service",
    updated: "April 1, 2026",
    sections: [
      { heading: "Acceptance of Terms", text: "By creating an account or using The Curator, you agree to these Terms of Service. If you do not agree, you must not use the service." },
      { heading: "Service Description", text: "The Curator provides AI-powered contract risk analysis. The service identifies potential risks, summarizes clauses, and provides suggestions. This is an assistive tool and does not constitute legal advice." },
      { heading: "No Legal Advice", text: "The Curator is not a law firm and does not provide legal advice. All analysis output is for informational purposes only. You should consult a qualified attorney before making legal decisions based on any analysis." },
      { heading: "User Responsibilities", text: "You are responsible for the content you upload. You must have the legal right to upload and analyze any documents submitted. You must not upload illegal, malicious, or unauthorized content." },
      { heading: "Subscription & Billing", text: "Free tier includes 5 analyses per month. Pro plan ($29/month) provides unlimited analyses. Payments are processed via PayPal. You may cancel at any time through your account settings." },
      { heading: "Limitation of Liability", text: "The Curator is provided 'as is' without warranties of any kind. We are not liable for any damages arising from the use of or inability to use the service, including missed risks or incorrect analysis." },
    ],
  },
  security: {
    title: "Security Architecture",
    updated: "April 1, 2026",
    sections: [
      { heading: "Encryption", text: "All data in transit is protected with TLS 1.3 encryption. Database connections use SSL. No sensitive data is stored in plain text." },
      { heading: "Authentication", text: "User authentication is managed by Clerk, which provides enterprise-grade security including session management, MFA support, and bot detection." },
      { heading: "Data Isolation", text: "Each user's data is isolated using Supabase Row Level Security (RLS) policies. Server-side operations use service role keys that bypass RLS only for authorized operations." },
      { heading: "API Security", text: "All API endpoints require authentication via Clerk middleware. Rate limiting (20 requests/hour) prevents abuse. File upload is limited to 10MB with type validation." },
      { heading: "Environment Security", text: "All secrets (API keys, database credentials) are stored as environment variables, never committed to source control. A .env.example file documents required variables without values." },
      { heading: "Reporting Vulnerabilities", text: "If you discover a security vulnerability, please report it to security@thecurator.ai. We take all reports seriously and will respond within 48 hours." },
    ],
  },
  api: {
    title: "API Documentation",
    updated: "April 1, 2026",
    sections: [
      { heading: "Authentication", text: "All API requests require a valid Clerk session. Include your session token in the request headers. Unauthenticated requests return 401." },
      { heading: "POST /api/analyze", text: "Analyze a contract. Accepts multipart/form-data with a 'file' field (PDF or DOCX, max 10MB) and optional 'language' field (English, Korean, Spanish, French, Japanese, Chinese, German, Portuguese). Alternatively, send JSON with 'text' and 'language' fields." },
      { heading: "Response Format", text: "Returns JSON with: summary (string), risks (array of {title, clause, explanation, severity, suggestion}), riskScore (0-100), riskHigh (boolean), and savedId (UUID of saved contract)." },
      { heading: "GET /api/contracts", text: "List all contracts for the authenticated user. Returns an array of contract objects sorted by creation date (newest first)." },
      { heading: "GET /api/contracts/:id", text: "Get a single contract by ID. Returns 404 if not found or not owned by the authenticated user." },
      { heading: "Rate Limits", text: "Free tier: 5 analyses per month, 20 requests per hour. Pro tier: unlimited analyses, 20 requests per hour. Rate limit headers are included in responses." },
    ],
  },
};

export default function LegalPage({ params }: { params: { slug: string } }) {
  const content = CONTENT[params.slug];

  if (!content) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center font-body">
        <div className="text-center">
          <p className="font-headline font-bold text-2xl text-on-surface">Page not found</p>
          <Link href="/" className="text-primary text-sm mt-3 block hover:underline">← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <nav className="px-8 py-4 border-b border-outline-variant/10 flex items-center gap-4">
        <Link href="/" className="font-headline font-extrabold text-primary text-lg">The Curator</Link>
        <span className="text-on-surface-variant">/</span>
        <span className="text-sm text-on-surface-variant">{content.title}</span>
      </nav>
      <div className="max-w-3xl mx-auto px-8 py-16">
        <h1 className="font-headline font-extrabold text-3xl text-primary mb-3">{content.title}</h1>
        <p className="text-sm text-on-surface-variant mb-10">Last updated: {content.updated}</p>

        <div className="space-y-6">
          {content.sections.map((section, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <h2 className="font-headline font-bold text-on-surface mb-3">{section.heading}</h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">{section.text}</p>
            </div>
          ))}
        </div>

        <Link href="/" className="inline-flex items-center gap-2 mt-10 text-sm text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to home
        </Link>
      </div>
    </div>
  );
}
