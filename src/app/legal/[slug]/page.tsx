"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

const SECTION_KEYS: Record<string, { heading: string; text: string }[]> = {
  privacy: [
    { heading: "legal.privacy.infoCollect", text: "legal.privacy.infoCollectText" },
    { heading: "legal.privacy.howWeUse", text: "legal.privacy.howWeUseText" },
    { heading: "legal.privacy.dataRetention", text: "legal.privacy.dataRetentionText" },
    { heading: "legal.privacy.thirdParty", text: "legal.privacy.thirdPartyText" },
    { heading: "legal.privacy.dataSecurity", text: "legal.privacy.dataSecurityText" },
    { heading: "legal.privacy.yourRights", text: "legal.privacy.yourRightsText" },
  ],
  terms: [
    { heading: "legal.terms.acceptance", text: "legal.terms.acceptanceText" },
    { heading: "legal.terms.serviceDesc", text: "legal.terms.serviceDescText" },
    { heading: "legal.terms.noLegalAdvice", text: "legal.terms.noLegalAdviceText" },
    { heading: "legal.terms.userResp", text: "legal.terms.userRespText" },
    { heading: "legal.terms.billing", text: "legal.terms.billingText" },
    { heading: "legal.terms.liability", text: "legal.terms.liabilityText" },
  ],
  security: [
    { heading: "legal.security.encryption", text: "legal.security.encryptionText" },
    { heading: "legal.security.auth", text: "legal.security.authText" },
    { heading: "legal.security.dataIsolation", text: "legal.security.dataIsolationText" },
    { heading: "legal.security.apiSecurity", text: "legal.security.apiSecurityText" },
    { heading: "legal.security.envSecurity", text: "legal.security.envSecurityText" },
    { heading: "legal.security.reporting", text: "legal.security.reportingText" },
  ],
  api: [
    { heading: "legal.api.authHeading", text: "legal.api.authText" },
    { heading: "legal.api.postAnalyze", text: "legal.api.postAnalyzeText" },
    { heading: "legal.api.responseFormat", text: "legal.api.responseFormatText" },
    { heading: "legal.api.getContracts", text: "legal.api.getContractsText" },
    { heading: "legal.api.getContractById", text: "legal.api.getContractByIdText" },
    { heading: "legal.api.rateLimits", text: "legal.api.rateLimitsText" },
  ],
  refund: [
    { heading: "legal.refund.policy", text: "legal.refund.policyText" },
    { heading: "legal.refund.eligibility", text: "legal.refund.eligibilityText" },
    { heading: "legal.refund.process", text: "legal.refund.processText" },
    { heading: "legal.refund.exceptions", text: "legal.refund.exceptionsText" },
    { heading: "legal.refund.contact", text: "legal.refund.contactText" },
  ],
};

export default function LegalPage({ params }: { params: { slug: string } }) {
  const { t } = useTranslation();
  const slug = params.slug;
  const sections = SECTION_KEYS[slug];

  if (!sections) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center font-body">
        <div className="text-center">
          <p className="font-headline font-bold text-2xl text-on-surface">{t("legal.pageNotFound")}</p>
          <Link href="/" className="text-primary text-sm mt-3 block hover:underline">← {t("legal.backToHome")}</Link>
        </div>
      </div>
    );
  }

  const title = t(`legal.${slug}.title`);
  const updated = t(`legal.${slug}.updated`);

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <nav className="px-8 py-4 border-b border-outline-variant/10 flex items-center gap-4">
        <Link href="/" className="font-headline font-extrabold text-primary text-lg">The Curator</Link>
        <span className="text-on-surface-variant">/</span>
        <span className="text-sm text-on-surface-variant">{title}</span>
      </nav>
      <div className="max-w-3xl mx-auto px-8 py-16">
        <h1 className="font-headline font-extrabold text-3xl text-primary mb-3">{title}</h1>
        <p className="text-sm text-on-surface-variant mb-10">{t("legal.lastUpdated")}: {updated}</p>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <h2 className="font-headline font-bold text-on-surface mb-3">{t(section.heading)}</h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">{t(section.text)}</p>
            </div>
          ))}
        </div>

        <Link href="/" className="inline-flex items-center gap-2 mt-10 text-sm text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          {t("legal.backToHome")}
        </Link>
      </div>
    </div>
  );
}
