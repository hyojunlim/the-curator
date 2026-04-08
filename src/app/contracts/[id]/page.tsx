"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppSidebar from "@/components/layout/AppSidebar";
import AppFooter from "@/components/layout/AppFooter";
import TagSelector from "@/components/ui/TagSelector";
import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";
import KeyDatesCard from "@/components/results/KeyDatesCard";
import FinancialCard from "@/components/results/FinancialCard";
import MissingClausesCard from "@/components/results/MissingClausesCard";
import FairnessCard from "@/components/results/FairnessCard";
import ActionItemsCard from "@/components/results/ActionItemsCard";
import { t } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n";
import type { AnalysisResult } from "@/types";

interface ContractDetail {
  id: string;
  title: string;
  parties: string;
  type: string;
  status: string;
  risk_score: number;
  risk_high: boolean;
  result: AnalysisResult | null;
  created_at: string;
  tags: string[];
  error_message?: string;
}

type PerspectiveView = "none" | "party_a" | "party_b";

export default function ContractDetailPage() {
  const { t: tr, locale: uiLocale } = useTranslation();
  const dateLocale = ({ en: "en-US", ko: "ko-KR", ja: "ja-JP", zh: "zh-CN", es: "es-ES", fr: "fr-FR", de: "de-DE", pt: "pt-BR" } as Record<string, string>)[uiLocale] || "en-US";
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [perspective, setPerspective] = useState<PerspectiveView>("none");
  const [retrying, setRetrying] = useState(false);
  const { sub } = useSubscription();
  const isPro = sub?.plan === "pro" || sub?.plan === "business";

  useEffect(() => {
    fetch(`/api/contracts/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setContract(data); setTags(data.tags ?? []); setLoading(false); })
      .catch(() => { setLoading(false); setNotFound(true); });
  }, [id, router]);

  // Poll for status updates when PENDING or PROCESSING
  useEffect(() => {
    if (!contract || (contract.status !== "PENDING" && contract.status !== "PROCESSING")) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/contracts/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        setContract(data);
        setTags(data.tags ?? []);
        if (data.status === "COMPLETE" || data.status === "FAILED") {
          clearInterval(interval);
        }
      } catch {
        // ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [contract?.status, id]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleShare() {
    if (!contract || !contract.result) return;
    const lang = contract.result.language || "English";
    const text = [
      `=== ${t(lang, "pdfReportTitle")}: ${contract.title} ===`,
      "",
      t(lang, "pdfSummaryLabel"),
      contract.result.summary,
      "",
      `${t(lang, "pdfRiskScoreLabel")} ${contract.risk_score}/100`,
      "",
      t(lang, "pdfRisksIdentified"),
      ...contract.result.risks.map((r, i) => `${i + 1}. [${r.severity.toUpperCase()}] ${r.title}\n   ${r.explanation}`),
    ].join("\n");
    navigator.clipboard.writeText(text)
      .then(() => showToast(tr("contractDetail.analysisCopied")))
      .catch(() => showToast(tr("contractDetail.copyFailed")));
  }

  async function handleTagChange(newTags: string[]) {
    setTags(newTags);
    try {
      await fetch(`/api/contracts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      });
      showToast(tr("contractDetail.tagsUpdated"));
    } catch {
      showToast(tr("contractDetail.tagsUpdateFailed"));
    }
  }

  function escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  const [exporting, setExporting] = useState(false);

  async function handleExportPDF() {
    if (!contract) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/export-pdf?id=${contract.id}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${contract.title || "contract-analysis"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("PDF export failed. Please try again.");
    }
    setExporting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-surface font-body text-on-surface">
        <AppSidebar />
        <div className="ml-0 lg:ml-64 flex-1 p-6 pt-16 lg:pt-6 lg:p-10 pb-24 animate-pulse">
          <div className="h-3 bg-surface-container-high rounded w-40 mb-6" />
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high" />
              <div>
                <div className="h-5 bg-surface-container-high rounded w-48 mb-2" />
                <div className="h-3 bg-surface-container-high rounded w-24" />
              </div>
            </div>
            <div className="text-right">
              <div className="h-3 bg-surface-container-high rounded w-28 mb-2" />
              <div className="h-4 bg-surface-container-high rounded w-16 ml-auto" />
            </div>
          </div>
          <div className="max-w-2xl space-y-5">
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm h-24" />
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm h-40" />
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm h-32" />
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !contract) {
    return (
      <div className="flex min-h-screen bg-surface font-body text-on-surface">
        <AppSidebar />
        <div className="ml-0 lg:ml-64 flex-1 flex items-center justify-center p-6 pt-16 lg:pt-6 lg:p-10 pb-24">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-on-surface-variant text-[32px]">search_off</span>
            </div>
            <h2 className="font-headline font-extrabold text-xl text-on-surface mb-2">{tr("contractDetail.contractNotFound")}</h2>
            <p className="text-sm text-on-surface-variant mb-6">
              {tr("contractDetail.contractNotFoundDesc")}
            </p>
            <Link
              href="/history"
              className="inline-flex items-center gap-2 btn-primary-gradient text-white px-6 py-3 rounded-lg font-headline font-bold text-sm hover:opacity-90 transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              {tr("contractDetail.backToHistory")}
            </Link>
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  const { risk_score, risk_high, title, status: contractStatus, type, created_at } = contract;
  const result = contract.result;
  const lang = result?.language || "English";

  // Handle retry for failed analyses
  async function handleRetry() {
    if (!contract) return;
    setRetrying(true);
    try {
      const res = await fetch("/api/analyze/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: contract.id, language: lang }),
      });
      if (res.ok) {
        setContract({ ...contract, status: "PROCESSING", error_message: undefined });
      }
    } catch {
      // ignore
    }
    setRetrying(false);
  }

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">
      <AppSidebar />

      <div className="ml-0 lg:ml-64 flex-1 p-6 pt-16 lg:pt-6 lg:p-10 pb-24">
        {/* Toast */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 bg-on-surface text-surface text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
            {toast}
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
          <Link href="/history" className="hover:text-primary transition-colors">{tr("contractDetail.reviewHistory")}</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-medium">{title}</span>
        </div>

        {/* PENDING / PROCESSING state */}
        {(contractStatus === "PENDING" || contractStatus === "PROCESSING") && (
          <div className="max-w-lg mx-auto text-center py-20">
            <div className="w-20 h-20 bg-primary-fixed/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h2 className="font-headline font-extrabold text-xl text-on-surface mb-2">
              {tr("contractDetail.analyzingTitle") || "Analyzing your contract..."}
            </h2>
            <p className="text-sm text-on-surface-variant mb-8">
              {tr("contractDetail.analyzingDesc") || "Our AI is reviewing clauses, identifying risks, and generating recommendations. This usually takes 30-60 seconds."}
            </p>

            {/* Animated step indicators */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm text-left max-w-sm mx-auto">
              <AnalysisSteps status={contractStatus} />
            </div>
          </div>
        )}

        {/* FAILED state */}
        {contractStatus === "FAILED" && (
          <div className="max-w-lg mx-auto text-center py-20">
            <div className="w-20 h-20 bg-error-container/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-error text-[40px]">error</span>
            </div>
            <h2 className="font-headline font-extrabold text-xl text-on-surface mb-2">
              {tr("contractDetail.analysisFailed") || "Analysis Failed"}
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">
              {contract.error_message || tr("contractDetail.analysisFailedDesc") || "Something went wrong during analysis. Please try again."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="btn-primary-gradient text-white px-6 py-3 rounded-lg font-headline font-bold text-sm hover:opacity-90 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {retrying ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {tr("contractDetail.retrying") || "Retrying..."}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    {tr("contractDetail.tryAgain") || "Try Again"}
                  </>
                )}
              </button>
              <Link
                href="/analyze"
                className="border border-outline-variant/30 text-on-surface-variant px-6 py-3 rounded-lg font-headline font-bold text-sm hover:bg-surface-container-low transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                {tr("contractDetail.reAnalyze") || "New Analysis"}
              </Link>
            </div>
          </div>
        )}

        {/* COMPLETE state — full results */}
        {contractStatus === "COMPLETE" && result && (
          <>
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-fixed/30">
              <span className="material-symbols-outlined text-[22px] text-primary">description</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline font-extrabold text-xl text-on-surface">{title}</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-fixed/30 text-primary">
                  {contractStatus}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mt-0.5">{type}</p>
            </div>
          </div>
          <div className="text-right text-xs text-on-surface-variant">
            <p>{tr("contractDetail.analyzed")} <span className="font-medium text-on-surface">
              {new Date(created_at).toLocaleDateString(dateLocale, { month: "short", day: "numeric", year: "numeric" })}
            </span></p>
            <p className="mt-1">{tr("contractDetail.riskScoreLabel")}{" "}
              <span className={`font-headline font-bold text-sm ${risk_high ? "text-error" : "text-secondary"}`}>
                {risk_score}/100
              </span>
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{tr("contractDetail.labels")}</p>
          <TagSelector tags={tags} onChange={handleTagChange} />
        </div>

        {/* Results */}
        <div className="max-w-2xl space-y-5">
          {/* Score card */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t(lang, "contractHealth")}</p>
              <div className="flex items-baseline gap-2">
                <span className={`font-headline font-extrabold text-4xl ${risk_high ? "text-error" : "text-secondary"}`}>{risk_score}</span>
                <span className="text-sm text-on-surface-variant">/100</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                risk_score >= 70 ? "bg-error-container text-on-error-container"
                : risk_score >= 40 ? "bg-tertiary-fixed text-tertiary"
                : "bg-primary-fixed text-primary"
              }`}>
                <span className="material-symbols-outlined text-[14px]">
                  {risk_score >= 70 ? "warning" : risk_score >= 40 ? "info" : "check_circle"}
                </span>
                {t(lang, "riskLevel")}: {t(lang, risk_score >= 70 ? "high" : risk_score >= 40 ? "medium" : "low")}
              </span>
              <div className="mt-2 flex gap-2 justify-end">
                {isPro ? (
                  <>
                    <button onClick={handleShare} className="text-xs font-bold text-on-surface-variant border border-outline-variant/30 px-3 py-1 rounded hover:bg-surface-container-low transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">share</span>{t(lang, "share")}
                    </button>
                    <button onClick={handleExportPDF} disabled={exporting} className="text-xs font-bold btn-primary-gradient text-white px-3 py-1 rounded flex items-center gap-1 hover:opacity-90 transition-opacity disabled:opacity-50">
                      <span className="material-symbols-outlined text-[14px]">{exporting ? "hourglass_empty" : "picture_as_pdf"}</span>{exporting ? "Exporting..." : t(lang, "exportPdf")}
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/60">
                    <span className="material-symbols-outlined text-[12px]">lock</span>
                    {t(lang, "pdfProOnly")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-primary-fixed rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[18px]">summarize</span>
              </div>
              <h3 className="font-headline font-bold text-on-surface">{t(lang, "summary")}</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">{result.summary}</p>
          </div>

          {/* Contract Type Badge */}
          {result.contractType && result.contractType !== "General Contract" && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-primary">description</span>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t(lang, "contractType")}</span>
              <span className="text-sm font-semibold text-on-surface">{result.contractType}</span>
            </div>
          )}

          {/* Fairness */}
          <FairnessCard
            score={result.fairnessScore ?? 50}
            summary={result.fairnessSummary ?? ""}
            partyAName={result.parties?.find(p => p.role === "party_a")?.name}
            partyBName={result.parties?.find(p => p.role === "party_b")?.name}
            language={lang}
          />

          {/* Key Dates + Financial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <KeyDatesCard dates={result.keyDates ?? []} language={lang} />
            <FinancialCard obligations={result.financialObligations ?? []} language={lang} />
          </div>

          {/* Missing Clauses */}
          <MissingClausesCard clauses={result.missingClauses ?? []} language={lang} />

          {/* Party Perspective Selector */}
          {result.parties && result.parties.length >= 2 && (() => {
            const partyA = result.parties.find((p) => p.role === "party_a");
            const partyB = result.parties.find((p) => p.role === "party_b");
            const activePartyName = perspective === "party_a" ? partyA?.name : perspective === "party_b" ? partyB?.name : undefined;
            return (
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
                  <h3 className="font-headline font-bold text-on-surface text-sm">{t(lang, "whichParty")}</h3>
                </div>
                <p className="text-xs text-on-surface-variant mb-4">{t(lang, "partySelectDesc")}</p>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setPerspective("none")} className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl text-xs font-bold transition-all border ${perspective === "none" ? "border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20" : "border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-on-surface"}`}>
                    <span className={`material-symbols-outlined text-[22px] ${perspective === "none" ? "text-primary" : "text-on-surface-variant"}`}>balance</span>
                    <span>{t(lang, "neutral")}</span>
                    <span className={`text-[11px] font-normal ${perspective === "none" ? "text-primary/70" : "text-on-surface-variant/60"}`}>{t(lang, "generalView")}</span>
                  </button>
                  <button onClick={() => setPerspective("party_a")} className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl text-xs font-bold transition-all border ${perspective === "party_a" ? "border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20" : "border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-on-surface"}`}>
                    <span className={`material-symbols-outlined text-[22px] ${perspective === "party_a" ? "text-primary" : "text-on-surface-variant"}`}>shield_person</span>
                    <span className="truncate max-w-full">{partyA?.name || "Party A"}</span>
                    <span className={`text-[11px] font-normal ${perspective === "party_a" ? "text-primary/70" : "text-on-surface-variant/60"}`}>{partyA?.description || "갑"}</span>
                  </button>
                  <button onClick={() => setPerspective("party_b")} className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl text-xs font-bold transition-all border ${perspective === "party_b" ? "border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20" : "border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-on-surface"}`}>
                    <span className={`material-symbols-outlined text-[22px] ${perspective === "party_b" ? "text-primary" : "text-on-surface-variant"}`}>person</span>
                    <span className="truncate max-w-full">{partyB?.name || "Party B"}</span>
                    <span className={`text-[11px] font-normal ${perspective === "party_b" ? "text-primary/70" : "text-on-surface-variant/60"}`}>{partyB?.description || "을"}</span>
                  </button>
                </div>
                {perspective !== "none" && activePartyName && (
                  <div className="mt-3 flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2">
                    <span className="material-symbols-outlined text-primary text-[14px]">person_pin</span>
                    <span className="text-xs text-primary font-medium">{t(lang, "viewingAs")} <strong>{activePartyName}</strong></span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Clause Breakdown */}
          {(() => {
            const partyA = result.parties?.find((p) => p.role === "party_a");
            const partyB = result.parties?.find((p) => p.role === "party_b");
            const activePartyName = perspective === "party_a" ? partyA?.name : perspective === "party_b" ? partyB?.name : undefined;
            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">policy</span>
                    {t(lang, "clauseBreakdown")}
                    <span className="text-[10px] font-bold bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">
                      {result.risks.length} {t(lang, "total")}
                    </span>
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    {result.risks.filter((r) => r.severity === "high").length > 0 && (
                      <span className="text-error">{result.risks.filter((r) => r.severity === "high").length} {t(lang, "critical")}</span>
                    )}
                    {result.risks.filter((r) => r.severity === "medium").length > 0 && (
                      <span className="text-secondary">{result.risks.filter((r) => r.severity === "medium").length} {t(lang, "caution")}</span>
                    )}
                    {result.risks.filter((r) => r.severity === "low").length > 0 && (
                      <span className="text-on-surface-variant">{result.risks.filter((r) => r.severity === "low").length} {t(lang, "advisory")}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {[...result.risks]
                    .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]))
                    .map((risk, i) => {
                      const cfg = {
                        high: { label: t(lang, "critical"), badge: "bg-error-container text-on-error-container", border: "border-l-error" },
                        medium: { label: t(lang, "caution"), badge: "bg-tertiary-fixed text-tertiary", border: "border-l-secondary" },
                        low: { label: t(lang, "advisory"), badge: "bg-primary-fixed text-primary", border: "border-l-secondary" },
                      }[risk.severity];
                      const activeSuggestion = perspective === "party_a" ? (risk.suggestion_party_a || risk.suggestion) : perspective === "party_b" ? (risk.suggestion_party_b || risk.suggestion) : risk.suggestion;
                      return (
                        <div key={i} className={`bg-surface-container-lowest rounded-xl border-l-4 ${cfg.border} shadow-sm p-5`}>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-headline font-bold text-on-surface text-sm">{risk.title}</h3>
                            <span className={`shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${cfg.badge}`}>{cfg.label}</span>
                          </div>
                          {risk.clause && (
                            <div className="bg-surface-container-low rounded-lg p-3 mb-3 border-l-2 border-outline-variant">
                              <p className="text-xs text-on-surface-variant italic leading-relaxed">&ldquo;{risk.clause}&rdquo;</p>
                            </div>
                          )}
                          <p className="text-xs text-on-surface-variant leading-relaxed">{risk.explanation}</p>
                          {activeSuggestion && (
                            <div className={`mt-3 rounded-lg p-3 ${perspective !== "none" ? "bg-primary/5 border border-primary/20" : "bg-surface-container-low"}`}>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className={`material-symbols-outlined text-[14px] ${perspective !== "none" ? "text-primary" : "text-on-surface-variant"}`}>
                                  {perspective !== "none" ? "person_pin" : "lightbulb"}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${perspective !== "none" ? "text-primary" : "text-on-surface-variant"}`}>
                                  {perspective !== "none" && activePartyName ? `${activePartyName} ${t(lang, "advice")}` : t(lang, "suggestion")}
                                </span>
                              </div>
                              <p className={`text-xs leading-relaxed ${perspective !== "none" ? "text-on-surface" : "text-on-surface-variant"}`}>{activeSuggestion}</p>
                            </div>
                          )}
                          {/* Rewrite: Before → After */}
                          {risk.rewrite && risk.clause && (
                            <div className="mt-3 rounded-lg border border-secondary/20 overflow-hidden">
                              <div className="flex items-center gap-1.5 px-3 py-2 bg-secondary/5">
                                <span className="material-symbols-outlined text-[14px] text-secondary">edit_note</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">{t(lang, "suggestedRewrite")}</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant/15">
                                <div className="p-3 bg-error/3">
                                  <div className="flex items-center gap-1 mb-1.5">
                                    <span className="material-symbols-outlined text-[12px] text-error/60">close</span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-error/60">{t(lang, "before")}</span>
                                  </div>
                                  <p className="text-xs text-on-surface-variant/70 leading-relaxed line-through decoration-error/30">{risk.clause}</p>
                                </div>
                                <div className="p-3 bg-secondary/3">
                                  <div className="flex items-center gap-1 mb-1.5">
                                    <span className="material-symbols-outlined text-[12px] text-secondary">check</span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-secondary">{t(lang, "after")}</span>
                                  </div>
                                  <p className="text-xs text-on-surface leading-relaxed font-medium">{risk.rewrite}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })()}

          {/* Action Items */}
          <ActionItemsCard items={result.actionItems ?? []} language={lang} />

          <div className="flex gap-3">
            <Link href="/history" className="flex-1 py-3 rounded-lg text-sm font-headline font-bold text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              {tr("contractDetail.backToHistory")}
            </Link>
            <Link
              href="/analyze"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-surface-container-high/50 hover:bg-surface-container-high transition-colors text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              {tr("contractDetail.reAnalyze")}
            </Link>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-error-container/20 border border-error/20">
                <span className="text-sm text-on-surface">{tr("contractDetail.deleteThisContract")}</span>
                <button
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      const res = await fetch(`/api/contracts/${id}`, { method: "DELETE" });
                      if (res.ok) {
                        showToast(tr("contractDetail.contractDeleted"));
                        setTimeout(() => router.push("/history"), 500);
                      } else showToast(tr("contractDetail.deleteContractFailed"));
                    } catch {
                      showToast(tr("contractDetail.deleteContractFailed"));
                    }
                    setDeleting(false);
                    setShowDeleteConfirm(false);
                  }}
                  disabled={deleting}
                  className="px-3 py-1.5 rounded-lg bg-error text-on-error text-sm font-semibold"
                >
                  {deleting ? tr("contractDetail.deleting") : tr("common.delete")}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-sm font-semibold"
                >
                  {tr("common.cancel")}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="py-3 px-5 rounded-lg text-sm font-headline font-bold text-error border border-error/30 hover:bg-error/5 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                {tr("common.delete")}
              </button>
            )}
          </div>
        </div>
          </>
        )}
      </div>

      <AppFooter />
    </div>
  );
}

/** Animated analysis steps for PENDING/PROCESSING */
function AnalysisSteps({ status }: { status: string }) {
  const { t: tr } = useTranslation();
  const STEPS = [
    { label: tr("contractDetail.stepUploading") || "Uploading document", icon: "upload_file" },
    { label: tr("contractDetail.stepExtracting") || "Extracting text", icon: "text_snippet" },
    { label: tr("contractDetail.stepAnalyzing") || "Analyzing clauses", icon: "policy" },
    { label: tr("contractDetail.stepScoring") || "Scoring risks", icon: "assessment" },
    { label: tr("contractDetail.stepGenerating") || "Generating report", icon: "summarize" },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Start at step 1 if already processing
    if (status === "PROCESSING") setCurrentStep(2);

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="space-y-3">
      {STEPS.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div key={i} className="flex items-center gap-3">
            {isDone ? (
              <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            ) : isActive ? (
              <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant/30 text-[20px]">radio_button_unchecked</span>
            )}
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[16px] ${isDone ? "text-secondary" : isActive ? "text-primary" : "text-on-surface-variant/40"}`}>
                {step.icon}
              </span>
              <span className={`text-sm ${isDone ? "text-secondary font-medium" : isActive ? "text-on-surface font-semibold" : "text-on-surface-variant/50"}`}>
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
      <div className="mt-4 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
