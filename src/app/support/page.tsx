"use client";

import { useState } from "react";
import Link from "next/link";
import AppSidebar from "@/components/layout/AppSidebar";
import AppFooter from "@/components/layout/AppFooter";
import { useTranslation } from "@/lib/i18n";

/* ── FAQ Keys ── */
const FAQ_KEYS = [
  { questionKey: "faqFileTypes", answerKey: "faqFileTypesAnswer", icon: "upload_file" },
  { questionKey: "faqAccuracy", answerKey: "faqAccuracyAnswer", icon: "psychology" },
  { questionKey: "faqLanguages", answerKey: "faqLanguagesAnswer", icon: "translate" },
  { questionKey: "faqSecurity", answerKey: "faqSecurityAnswer", icon: "shield" },
  { questionKey: "faqDeleteData", answerKey: "faqDeleteDataAnswer", icon: "delete" },
  { questionKey: "faqPlans", answerKey: "faqPlansAnswer", icon: "credit_card" },
  { questionKey: "faqExport", answerKey: "faqExportAnswer", icon: "picture_as_pdf" },
];

/* ── Accordion Item ── */
function AccordionItem({
  question,
  answer,
  icon,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-container-low/40 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-[18px]">
            {icon}
          </span>
        </div>
        <span className="flex-1 font-headline font-bold text-sm text-on-surface">
          {question}
        </span>
        <span
          className={`material-symbols-outlined text-[20px] text-on-surface-variant transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>
      <div
        className={`grid transition-all duration-200 ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 pl-[4.25rem] text-sm text-on-surface-variant leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function SupportPage() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">
      <AppSidebar />

      <div className="ml-0 lg:ml-64 flex-1 p-6 pt-16 lg:pt-6 lg:p-10 pb-24">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-headline font-extrabold text-2xl text-on-surface">
            {t("support.title")}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t("support.description")}
          </p>
        </div>

        {/* ── Getting Started ── */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[22px]">
              rocket_launch
            </span>
            <h2 className="font-headline font-bold text-lg text-on-surface">
              {t("support.gettingStarted")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                icon: "upload_file",
                title: t("support.step1Title"),
                desc: t("support.step1Desc"),
              },
              {
                step: "2",
                icon: "psychology",
                title: t("support.step2Title"),
                desc: t("support.step2Desc"),
              },
              {
                step: "3",
                icon: "task_alt",
                title: t("support.step3Title"),
                desc: t("support.step3Desc"),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-surface-container-lowest rounded-xl p-6 shadow-sm relative"
              >
                <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-headline font-extrabold text-xs text-primary">
                    {item.step}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    {item.icon}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-on-surface mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 btn-primary-gradient text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">
                add
              </span>
              {t("support.startFirstAnalysis")}
            </Link>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[22px]">
              quiz
            </span>
            <h2 className="font-headline font-bold text-lg text-on-surface">
              {t("support.faq")}
            </h2>
          </div>
          <div className="space-y-2">
            {FAQ_KEYS.map((item, i) => (
              <AccordionItem
                key={i}
                question={t(`support.${item.questionKey}`)}
                answer={t(`support.${item.answerKey}`)}
                icon={item.icon}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </section>

        {/* ── Keyboard Shortcuts ── */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[22px]">
              keyboard
            </span>
            <h2 className="font-headline font-bold text-lg text-on-surface">
              {t("support.keyboardShortcuts")}
            </h2>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                  search
                </span>
                <span className="text-sm text-on-surface">
                  {t("support.searchContracts")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 text-xs font-mono rounded-md bg-surface-container-high text-on-surface-variant border border-outline-variant/15">
                  Ctrl
                </kbd>
                <span className="text-on-surface-variant text-xs">+</span>
                <kbd className="px-2 py-1 text-xs font-mono rounded-md bg-surface-container-high text-on-surface-variant border border-outline-variant/15">
                  K
                </kbd>
              </div>
            </div>
          </div>
        </section>

        {/* ── Contact / Feedback ── */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[22px]">
              mail
            </span>
            <h2 className="font-headline font-bold text-lg text-on-surface">
              {t("support.contactFeedback")}
            </h2>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  support_agent
                </span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-on-surface mb-1">
                  {t("support.getInTouch")}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                  {t("support.contactDesc")}
                </p>
                <a
                  href={`mailto:${t("support.contactEmail")}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    mail
                  </span>
                  {t("support.contactEmail")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Legal Links ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[22px]">
              gavel
            </span>
            <h2 className="font-headline font-bold text-lg text-on-surface">
              {t("support.legalPolicies")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: t("support.privacyPolicy"),
                href: "/legal/privacy",
                icon: "policy",
              },
              {
                label: t("support.termsOfService"),
                href: "/legal/terms",
                icon: "description",
              },
              {
                label: t("support.securityLink"),
                href: "/legal/security",
                icon: "shield",
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 bg-surface-container-lowest rounded-xl px-5 py-4 shadow-sm hover:shadow-md hover:bg-surface-container-low/40 transition-all group"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] group-hover:text-primary transition-colors">
                  {link.icon}
                </span>
                <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                  {link.label}
                </span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant/40 group-hover:text-primary ml-auto transition-colors">
                  arrow_forward
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <AppFooter />
    </div>
  );
}
