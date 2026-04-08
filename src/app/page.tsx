"use client";

import Link from "next/link";
import LandingNav from "@/components/layout/LandingNav";
import { useTranslation } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="bg-surface min-h-screen font-body text-on-surface transition-colors duration-200">

      {/* ── Navigation ── */}
      <LandingNav />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-widest uppercase text-primary mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
            {t("landing.aiPoweredBadge")}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-[88px] font-headline font-extrabold tracking-tighter leading-[0.88] mb-8">
            <span className="text-on-surface">{t("landing.heroTitle1")}</span>
            <br />
            <span className="gradient-text">{t("landing.heroTitle2")}</span>
          </h1>

          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-12 font-body">
            {t("landing.heroDesc")}
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Link
              href="/analyze"
              className="btn-hero inline-flex items-center gap-2 text-white px-8 py-4 rounded-xl font-headline font-bold text-base shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              {t("landing.analyzeContractFree")}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border border-outline-variant/40 bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high px-8 py-4 rounded-xl font-headline font-bold text-base transition-all"
            >
              {t("landing.viewDashboard")}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-outline-variant/20 pt-12 mb-20">
            {[
              { n: "< 60s", label: t("landing.avgAnalysisTime") },
              { n: "8", label: t("landing.supportedLanguages") },
              { n: "PDF & DOCX", label: t("landing.fileFormats") },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-headline font-extrabold text-on-surface mb-1">{s.n}</p>
                <p className="text-xs text-on-surface-variant/60 font-body uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Analysis Demo Mockup ── */}
          <div className="relative mx-auto max-w-2xl animate-float">
            <div
              className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden mockup-glow"
              style={{ transform: "perspective(1000px) rotateY(-2deg) rotateX(2deg)" }}
            >
              {/* Title bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-outline-variant/15 bg-surface-container">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-error/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary/40" />
                </div>
                <span className="text-xs font-headline font-bold text-on-surface-variant/60 ml-2">{t("landing.demoTitle")}</span>
              </div>

              <div className="p-6 space-y-5 text-left">
                {/* Analysis Result Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">{t("landing.demoClauseReview")}</span>
                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">{t("landing.demoAnalysisComplete")}</span>
                  </div>
                </div>

                {/* Clause Review Items */}
                <div className="space-y-2">
                  {[
                    { icon: "edit_note", label: t("landing.demoAutoRenewal"), action: t("landing.demoSuggestedModification") },
                    { icon: "edit_note", label: t("landing.demoUnlimitedLiability"), action: t("landing.demoSuggestedModification") },
                    { icon: "add_circle_outline", label: t("landing.demoNonCompete"), action: t("landing.demoSuggestedAddition") },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-surface-container/50">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">{r.icon}</span>
                        <span className="text-sm text-on-surface font-medium">{r.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-primary/70">{r.action}</span>
                    </div>
                  ))}
                </div>

                {/* Action Items Summary */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
                  <span className="material-symbols-outlined text-[16px] text-primary">checklist</span>
                  <span className="text-xs font-bold text-primary">{t("landing.demoActionItemsSummary")}</span>
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-tertiary-fixed-dim/5 border border-tertiary-fixed-dim/15">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary-fixed-dim block mb-1.5">{t("landing.demoSuggestedClauses")}</span>
                    <p className="text-xs text-on-surface-variant">{t("landing.demoForceMajeure")} · {t("landing.demoDataProtection")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/15">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-1.5">{t("landing.demoActionItems")}</span>
                    <div className="space-y-1">
                      <p className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-primary">check_box</span>
                        {t("landing.demoNegotiateLiability")}
                      </p>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-primary">check_box</span>
                        {t("landing.demoAddTermination")}
                      </p>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-on-surface-variant/40">check_box_outline_blank</span>
                        {t("landing.demoReviewIP")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="py-14 border-y border-outline-variant/15">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-on-surface/25 mb-8">
            {t("landing.poweredByAI")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {["Gemini AI", "Next.js", "TypeScript", "Secure Cloud"].map((name) => (
              <span key={name} className="text-on-surface/20 font-headline font-bold text-lg tracking-tight hover:text-on-surface/40 transition-colors">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — 6 Interactive Mini-Mockups ── */}
      <section id="features" className="py-40 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">{t("landing.features")}</span>
            <h2 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight text-on-surface mb-6">
              {t("landing.featuresTitle")}
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              {t("landing.featuresDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* 1. Smart Clause Analysis — 2-col span */}
            <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-10 group hover:border-outline-variant/30 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-primary">fact_check</span>
              </div>
              <h3 className="text-2xl font-headline font-bold text-on-surface mb-4">{t("landing.smartClauseAnalysis")}</h3>
              <p className="text-on-surface-variant text-base leading-relaxed mb-8">
                {t("landing.smartClauseDesc")}
              </p>
              {/* Document review icon + action chips */}
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Document with checkmarks */}
                <div className="relative w-32 h-32 flex-shrink-0 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                  <span className="material-symbols-outlined text-primary text-[48px]">grading</span>
                </div>
                {/* Action chips */}
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    <span className="material-symbols-outlined text-[14px]">edit_note</span>
                    {t("landing.demoModifications3")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-bold">
                    <span className="material-symbols-outlined text-[14px]">add_circle_outline</span>
                    {t("landing.demoAdditions2")}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Party-Specific Advice */}
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 hover:border-outline-variant/30 transition-all">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
              </div>
              <h4 className="text-lg font-headline font-bold text-on-surface mb-2">{t("landing.partyAdviceTitle")}</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                {t("landing.partyAdviceDesc")}
              </p>
              {/* Two-party advice mockup */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5">{t("landing.partyAView")}</p>
                  <p className="text-xs text-on-surface-variant">{t("landing.partyAAdvice")}</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/5 border border-secondary/15">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1.5">{t("landing.partyBView")}</p>
                  <p className="text-xs text-on-surface-variant">{t("landing.partyBAdvice")}</p>
                </div>
              </div>
            </div>

            {/* 3. Key Dates */}
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 hover:border-outline-variant/30 transition-all">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
              </div>
              <h4 className="text-lg font-headline font-bold text-on-surface mb-2">{t("landing.keyDatesTitle")}</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                {t("landing.keyDatesDesc")}
              </p>
              {/* Timeline mockup */}
              <div className="relative pl-5 space-y-4 border-l-2 border-outline-variant/20">
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-surface-container-lowest" />
                  <p className="text-xs font-bold text-on-surface">Jan 1, 2024</p>
                  <p className="text-[11px] text-on-surface-variant">{t("landing.effectiveDate")}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-surface-container-lowest" />
                  <p className="text-xs font-bold text-on-surface">Dec 31, 2024</p>
                  <p className="text-[11px] text-on-surface-variant">{t("landing.expiration")}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-tertiary-fixed-dim border-2 border-surface-container-lowest" />
                  <p className="text-xs font-bold text-on-surface flex items-center gap-1">
                    Nov 30, 2024
                    <span className="material-symbols-outlined text-tertiary-fixed-dim text-[14px]">warning</span>
                  </p>
                  <p className="text-[11px] text-tertiary-fixed-dim font-medium">{t("landing.renewalDeadline")}</p>
                </div>
              </div>
            </div>

            {/* 4. Missing Clauses */}
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 hover:border-outline-variant/30 transition-all">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-[20px]">search_off</span>
              </div>
              <h4 className="text-lg font-headline font-bold text-on-surface mb-2">{t("landing.missingClausesTitle")}</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                {t("landing.missingClausesDesc")}
              </p>
              {/* Warning items */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-tertiary-fixed-dim/8 border border-tertiary-fixed-dim/15">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px] mt-0.5">warning</span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t("landing.demoForceMajeure")}</p>
                    <p className="text-[11px] text-on-surface-variant">{t("landing.notFoundInContract")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-tertiary-fixed-dim/8 border border-tertiary-fixed-dim/15">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px] mt-0.5">warning</span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t("landing.demoDataProtection")}</p>
                    <p className="text-[11px] text-on-surface-variant">{t("landing.notFoundInContract")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Financial Obligations */}
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 hover:border-outline-variant/30 transition-all">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
              </div>
              <h4 className="text-lg font-headline font-bold text-on-surface mb-2">{t("landing.financialTitle")}</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                {t("landing.financialDesc")}
              </p>
              {/* Mini table */}
              <div className="rounded-xl border border-outline-variant/15 overflow-hidden text-xs">
                <div className="grid grid-cols-3 gap-0 bg-surface-container px-3 py-2 font-bold text-on-surface-variant/60 uppercase tracking-wider text-[10px]">
                  <span>{t("landing.tableType")}</span>
                  <span className="text-right">{t("landing.tableAmount")}</span>
                  <span className="text-right">{t("landing.tableParty")}</span>
                </div>
                <div className="grid grid-cols-3 gap-0 px-3 py-2.5 border-t border-outline-variant/10">
                  <span className="text-on-surface font-medium">{t("landing.monthlyFee")}</span>
                  <span className="text-right text-on-surface font-mono font-bold">$2,000</span>
                  <span className="text-right text-on-surface-variant">{t("landing.partyB")}</span>
                </div>
                <div className="grid grid-cols-3 gap-0 px-3 py-2.5 border-t border-outline-variant/10 bg-error/5">
                  <span className="text-on-surface font-medium">{t("landing.penalty")}</span>
                  <span className="text-right text-error font-mono font-bold">$5,000</span>
                  <span className="text-right text-on-surface-variant">{t("landing.partyB")}</span>
                </div>
              </div>
            </div>

            {/* 6. Action Items */}
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 hover:border-outline-variant/30 transition-all">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-[20px]">checklist</span>
              </div>
              <h4 className="text-lg font-headline font-bold text-on-surface mb-2">{t("landing.actionItemsTitle")}</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                {t("landing.actionItemsDesc")}
              </p>
              {/* Checklist */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0">edit_note</span>
                  <span className="text-sm text-on-surface">{t("landing.actionNegotiateLiability")}</span>
                  <span className="text-[10px] font-bold text-primary ml-auto">{t("landing.actionModify")}</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0">edit_note</span>
                  <span className="text-sm text-on-surface">{t("landing.actionAddTermination")}</span>
                  <span className="text-[10px] font-bold text-primary ml-auto">{t("landing.actionModify")}</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/5 border border-secondary/10">
                  <span className="material-symbols-outlined text-[16px] text-secondary flex-shrink-0">add_circle_outline</span>
                  <span className="text-sm text-on-surface">{t("landing.actionReviewPayment")}</span>
                  <span className="text-[10px] font-bold text-secondary ml-auto">{t("landing.actionAdd")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Multilingual Demo (CSS-only tabs) ── */}
          <div className="mt-5 bg-primary-container/20 border border-primary/15 rounded-2xl p-10">
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              <div className="md:w-1/3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-primary">translate</span>
                </div>
                <h3 className="text-2xl font-headline font-bold text-on-surface mb-4">{t("landing.eightLanguages")}</h3>
                <p className="text-on-surface-variant text-base leading-relaxed mb-6">
                  {t("landing.eightLanguagesDesc")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {["EN", "KO", "ES", "FR", "JA", "ZH", "DE", "PT"].map((l) => (
                    <span key={l} className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono border border-primary/15">{l}</span>
                  ))}
                </div>
              </div>

              {/* CSS-only tab switching demo */}
              <div className="md:w-2/3">
                <div className="lang-tabs bg-surface-container-lowest border border-outline-variant/15 rounded-xl overflow-hidden">
                  <input type="radio" name="lang-tab" id="tab-en" className="lang-tab-input" defaultChecked />
                  <input type="radio" name="lang-tab" id="tab-ko" className="lang-tab-input" />
                  <input type="radio" name="lang-tab" id="tab-ja" className="lang-tab-input" />

                  {/* Tab headers */}
                  <div className="lang-tab-headers flex border-b border-outline-variant/15">
                    <label htmlFor="tab-en" className="lang-tab-label flex-1 text-center py-3 text-sm font-headline font-bold cursor-pointer text-on-surface-variant hover:text-on-surface transition-colors border-b-2 border-transparent">
                      EN
                    </label>
                    <label htmlFor="tab-ko" className="lang-tab-label flex-1 text-center py-3 text-sm font-headline font-bold cursor-pointer text-on-surface-variant hover:text-on-surface transition-colors border-b-2 border-transparent">
                      KO
                    </label>
                    <label htmlFor="tab-ja" className="lang-tab-label flex-1 text-center py-3 text-sm font-headline font-bold cursor-pointer text-on-surface-variant hover:text-on-surface transition-colors border-b-2 border-transparent">
                      JA
                    </label>
                  </div>

                  {/* Tab content — EN */}
                  <div className="lang-tab-panel p-5">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-error/5 border border-error/10">
                      <span className="material-symbols-outlined text-error mt-0.5">warning</span>
                      <div>
                        <p className="text-sm font-bold text-on-surface mb-1">{t("landing.multilingualDemoTitle")}</p>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {t("landing.multilingualDemoEN")}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Tab content — KO */}
                  <div className="lang-tab-panel p-5">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-error/5 border border-error/10">
                      <span className="material-symbols-outlined text-error mt-0.5">warning</span>
                      <div>
                        <p className="text-sm font-bold text-on-surface mb-1">{t("landing.multilingualDemoTitle")}</p>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {t("landing.multilingualDemoKO")}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Tab content — JA */}
                  <div className="lang-tab-panel p-5">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-error/5 border border-error/10">
                      <span className="material-symbols-outlined text-error mt-0.5">warning</span>
                      <div>
                        <p className="text-sm font-bold text-on-surface mb-1">{t("landing.multilingualDemoTitle")}</p>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {t("landing.multilingualDemoJA")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section className="py-32 px-8 border-t border-outline-variant/15">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">{t("landing.transformation")}</span>
            <h2 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-4">
              {t("landing.beforeAfterTitle")}
            </h2>
            <p className="text-on-surface-variant text-lg">{t("landing.beforeAfterDesc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-6 md:gap-4 items-center">
            {/* Before — blurred contract */}
            <div className="relative bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/40 block mb-4">{t("landing.before")}</span>
              <div className="space-y-3 select-none" style={{ filter: "blur(1.5px)" }}>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {t("landing.beforeText1")}
                </p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {t("landing.beforeText2")}
                </p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {t("landing.beforeText3")}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Arrow divider */}
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[24px]">arrow_forward</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary whitespace-nowrap">{t("landing.aiAnalysis")}</span>
            </div>

            {/* After — clean analysis */}
            <div className="bg-surface-container-lowest border border-primary/20 rounded-2xl p-8 shadow-lg shadow-primary/5">
              <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-4">{t("landing.after")}</span>
              <div className="space-y-4">
                {/* Review summary */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 flex-shrink-0 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[28px]">fact_check</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t("landing.afterItemsReviewed")}</p>
                    <p className="text-xs text-on-surface-variant">{t("landing.afterModificationsNeeded")}</p>
                  </div>
                </div>
                {/* Key findings */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-primary text-[16px]">edit_note</span>
                    <span className="text-on-surface">{t("landing.afterIssue1")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-primary text-[16px]">edit_note</span>
                    <span className="text-on-surface">{t("landing.afterIssue2")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-secondary text-[16px]">add_circle_outline</span>
                    <span className="text-on-surface">{t("landing.afterIssue3")}</span>
                  </div>
                </div>
                {/* Action */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs font-bold text-primary mb-1">{t("landing.afterRecommended")}</p>
                  <p className="text-xs text-on-surface-variant">{t("landing.afterRecommendedText")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-40 px-8 border-t border-outline-variant/15">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">{t("landing.process")}</span>
            <h2 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-4">
              {t("landing.threeSteps")}
            </h2>
            <p className="text-on-surface-variant text-lg">{t("landing.threeStepsDesc")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 — Upload */}
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 hover:border-outline-variant/30 transition-all">
              <div className="flex items-start justify-between mb-8">
                <span className="text-6xl font-headline font-black text-on-surface/8 leading-none">01</span>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">cloud_upload</span>
                </div>
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-3">{t("landing.upload")}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{t("landing.uploadDesc")}</p>
              {/* Mini upload area */}
              <div className="border-2 border-dashed border-outline-variant/30 rounded-xl p-6 text-center bg-surface-container/30">
                <span className="material-symbols-outlined text-on-surface-variant/30 text-[32px] mb-2 block">description</span>
                <p className="text-xs text-on-surface-variant/50 font-medium">{t("landing.dropFileHere")}</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">.pdf</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">.docx</span>
                </div>
              </div>
            </div>

            {/* Step 2 — Analyze */}
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 hover:border-outline-variant/30 transition-all">
              <div className="flex items-start justify-between mb-8">
                <span className="text-6xl font-headline font-black text-on-surface/8 leading-none">02</span>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                </div>
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-3">{t("landing.analyzeStep")}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{t("landing.analyzeDesc")}</p>
              {/* Mini progress bars */}
              <div className="space-y-3 p-4 bg-surface-container/30 rounded-xl">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-on-surface-variant">{t("landing.riskScanning")}</span>
                    <span className="text-primary font-bold">{t("landing.done")}</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-on-surface-variant">{t("landing.clauseAnalysis")}</span>
                    <span className="text-primary font-bold">{t("landing.done")}</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-on-surface-variant">{t("landing.financialExtraction")}</span>
                    <span className="text-tertiary-fixed-dim font-bold">85%</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary-fixed-dim rounded-full animate-progress-85" style={{ width: "85%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-on-surface-variant">{t("landing.reportGeneration")}</span>
                    <span className="text-on-surface-variant/50 font-bold">42%</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 rounded-full animate-pulse-bar" style={{ width: "42%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 — Act */}
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-8 hover:border-outline-variant/30 transition-all">
              <div className="flex items-start justify-between mb-8">
                <span className="text-6xl font-headline font-black text-on-surface/8 leading-none">03</span>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
                </div>
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-3">{t("landing.act")}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{t("landing.actDesc")}</p>
              {/* Mini dashboard */}
              <div className="p-4 bg-surface-container/30 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex-shrink-0 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">grading</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">{t("landing.mockClausesReviewed")}</p>
                    <p className="text-[10px] text-on-surface-variant">{t("landing.mockModificationsSuggested")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-primary/5">
                  <span className="material-symbols-outlined text-[12px] text-primary">edit_note</span>
                  <span className="text-on-surface">{t("landing.mockLiabilityClause")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-secondary/5">
                  <span className="material-symbols-outlined text-[12px] text-secondary">add_circle_outline</span>
                  <span className="text-on-surface">{t("landing.mockAutoRenewal")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-40 px-8 border-t border-outline-variant/15">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">{t("landing.pricing")}</span>
            <h2 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-4">
              {t("landing.pricingTitle")}
            </h2>
            <p className="text-on-surface-variant text-lg">{t("landing.pricingDesc")}</p>
          </div>

          {/* Beta Banner */}
          <div className="mb-10 p-5 rounded-2xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-base font-headline font-bold text-primary mb-1">
              {t("landing.betaBanner")}
            </p>
            <p className="text-sm text-on-surface-variant">
              {t("landing.betaBannerDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: t("landing.starter"), price: t("landing.starterPrice"), sub: t("landing.starterSub"), features: t("landing.starterFeatures") as unknown as string[], cta: t("landing.getStarted"), href: "/sign-up", featured: false },
              { name: t("landing.proName"), price: t("landing.proPrice"), sub: t("landing.proSub"), features: t("landing.proFeatures") as unknown as string[], cta: t("landing.startFreeTrial"), href: "/sign-up", featured: true },
              { name: t("landing.businessName"), price: t("landing.businessPrice"), sub: t("landing.businessSub"), features: t("landing.businessFeatures") as unknown as string[], cta: t("landing.getBusiness"), href: "/sign-up", featured: false },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col ${
                  plan.featured
                    ? "bg-surface-container-lowest border-2 border-primary shadow-2xl shadow-primary/10 relative"
                    : "bg-surface-container-lowest border border-outline-variant/15"
                }`}
              >
                <div className="mb-8">
                  {plan.featured && (
                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">{t("landing.mostPopular")}</span>
                  )}
                  <p className={`text-sm font-bold mb-3 ${plan.featured ? "text-primary" : "text-on-surface-variant"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-headline font-extrabold text-on-surface">
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && plan.price !== t("landing.starterPrice") && (
                      <span className="text-sm text-on-surface-variant">{t("landing.perMonth")}</span>
                    )}
                  </div>
                  <p className="text-sm mt-1 text-on-surface-variant">{plan.sub}</p>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] flex-shrink-0 text-secondary">check</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold text-center transition-all font-headline ${
                    plan.featured
                      ? "btn-primary-gradient text-white hover:opacity-90 shadow-md"
                      : "bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-40 px-8 border-t border-outline-variant/15">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight text-on-surface mb-6 leading-[0.95]">
            {t("landing.ctaTitle1")}{" "}
            <span className="gradient-text">{t("landing.ctaTitle2")}</span>
          </h2>
          <p className="text-on-surface-variant text-lg mb-12 leading-relaxed">
            {t("landing.ctaDesc")}
          </p>
          <Link
            href="/analyze"
            className="btn-hero inline-flex items-center gap-3 text-white px-10 py-5 rounded-xl font-headline font-bold text-lg shadow-2xl hover:-translate-y-0.5 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
            {t("landing.ctaButton")}
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-outline-variant/15 py-16 px-8 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div>
              <span className="text-lg font-headline font-black text-on-surface mb-4 block">{t("common.appName")}</span>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {t("landing.footerDesc")}
              </p>
            </div>
            {[
              { title: t("landing.product"), links: [[t("landing.features"), "#features"], [t("landing.pricing"), "#pricing"], [t("landing.process"), "#how-it-works"], [t("landing.viewDashboard"), "/dashboard"]] },
              { title: t("landing.resources"), links: [[t("landing.viewDashboard"), "/dashboard"], [t("sidebar.newAnalysis"), "/analyze"], [t("landing.signIn"), "/sign-in"], [t("landing.signUp"), "/sign-up"]] },
              { title: t("landing.legal"), links: [[t("support.privacyPolicy"), "/legal/privacy"], [t("support.termsOfService"), "/legal/terms"], [t("support.securityLink"), "/legal/security"]] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/50 mb-5">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-on-surface-variant text-sm hover:text-on-surface transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-outline-variant/15 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-on-surface-variant/40 text-xs">&copy; {new Date().getFullYear()} {t("common.copyright")}. {t("common.allRightsReserved")}</p>
            <p className="text-on-surface-variant/40 text-xs">{t("common.builtWithAI")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
