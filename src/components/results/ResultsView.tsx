"use client";

import { useState } from "react";
import Link from "next/link";
import type { AnalysisResult } from "@/types";
import { t } from "@/lib/i18n";
import SummaryCard from "./SummaryCard";
import RiskList from "./RiskList";
import KeyDatesCard from "./KeyDatesCard";
import FinancialCard from "./FinancialCard";
import MissingClausesCard from "./MissingClausesCard";
import FairnessCard from "./FairnessCard";
import ActionItemsCard from "./ActionItemsCard";

interface Props {
  result: AnalysisResult;
  onReset: () => void;
  plan?: string;
}

type PerspectiveView = "none" | "party_a" | "party_b";

export default function ResultsView({ result, onReset, plan = "free" }: Props) {
  const lang = result.language || "English";
  const isPro = plan === "pro" || plan === "business";
  const [toast, setToast] = useState<string | null>(null);
  const [perspective, setPerspective] = useState<PerspectiveView>("none");

  const partyA = result.parties?.find((p) => p.role === "party_a");
  const partyB = result.parties?.find((p) => p.role === "party_b");
  const activePartyName =
    perspective === "party_a" ? partyA?.name :
    perspective === "party_b" ? partyB?.name : undefined;

  const highCount = result.risks.filter((r) => r.severity === "high").length;
  // Use API-calculated score; fallback only if missing
  const riskScore = result.riskScore ?? Math.min(100, highCount * 20 + result.risks.filter((r) => r.severity === "medium").length * 10 + result.risks.length * 2);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleShare() {
    const text = [
      `=== ${t(lang, "pdfReportTitle")} ===`,
      "",
      t(lang, "pdfSummaryLabel"),
      result.summary,
      "",
      `${t(lang, "pdfRiskScoreLabel")} ${riskScore}/100`,
      "",
      t(lang, "pdfRisksIdentified"),
      ...result.risks.map(
        (r, i) =>
          `${i + 1}. [${r.severity.toUpperCase()}] ${r.title}\n   ${r.explanation}`
      ),
    ].join("\n");

    navigator.clipboard
      .writeText(text)
      .then(() => showToast(t(lang, "analysisCopied")))
      .catch(() => showToast(t(lang, "copyFailed")));
  }

  function escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function handleExportPDF() {
    const printStyles = `
      <style>
        body { font-family: Inter, sans-serif; color: #191c1e; padding: 40px; }
        h1 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
        .score { font-size: 48px; font-weight: 800; color: #00154f; }
        .summary { background: #f2f4f7; padding: 16px; border-radius: 8px; margin: 16px 0; }
        .risk { border-left: 4px solid #ba1a1a; padding: 12px 16px; margin: 12px 0; background: #fff8f7; border-radius: 0 8px 8px 0; }
        .risk.medium { border-color: #4c56af; background: #f2f2ff; }
        .risk.low { border-color: #4c56af; background: #f2f4f7; }
        .badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; }
        .badge.high { background: #ffdad6; color: #93000a; }
        .badge.medium { background: #e0e0ff; color: #27308a; }
        .badge.low { background: #dce1ff; color: #00154f; }
        blockquote { font-style: italic; color: #454652; font-size: 12px; background: #eceef1; padding: 10px; margin: 8px 0; border-radius: 4px; }
        .footer { margin-top: 40px; font-size: 11px; color: #767683; border-top: 1px solid #e0e3e6; padding-top: 16px; }
      </style>
    `;

    const body = `
      <h1>${t(lang, "pdfReportTitle")}</h1>
      <div class="score">${riskScore}<span style="font-size:20px;color:#767683">/100</span></div>
      <p style="color:#454652">${t(lang, "riskLevel")}: ${t(lang, highCount > 2 ? "high" : highCount > 0 ? "medium" : "low")} &bull; ${result.risks.length} ${t(lang, "clausesIdentified")}</p>

      <div class="summary">
        <strong>${t(lang, "summary")}</strong>
        <p style="margin-top:8px">${escapeHtml(result.summary)}</p>
      </div>

      <h2 style="margin-top:24px">${t(lang, "clauseBreakdown")}</h2>
      ${result.risks
        .map(
          (r) => `
        <div class="risk ${escapeHtml(r.severity)}">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
            <strong>${escapeHtml(r.title)}</strong>
            <span class="badge ${escapeHtml(r.severity)}">${escapeHtml(r.severity)}</span>
          </div>
          ${r.clause ? `<blockquote>"${escapeHtml(r.clause)}"</blockquote>` : ""}
          <p style="font-size:13px;color:#454652">${escapeHtml(r.explanation)}</p>
        </div>`
        )
        .join("")}

      <div class="footer">
        ${t(lang, "generatedBy")} &bull; ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}
        &bull; ${t(lang, "informationalOnly")}
      </div>
    `;

    const win = window.open("", "_blank");
    if (!win) {
      showToast(t(lang, "allowPopups"));
      return;
    }
    win.document.write(`<!DOCTYPE html><html><head>${printStyles}</head><body>${body}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 300);
  }

  return (
    <section id="results" className="mt-8 space-y-5 pb-20">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-on-surface text-surface text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
          {toast}
        </div>
      )}

      {/* View Full Analysis CTA */}
      {result.savedId && (
        <Link
          href={`/contracts/${result.savedId}`}
          className="w-full py-3.5 rounded-lg text-sm font-headline font-bold transition-all flex items-center justify-center gap-2 btn-primary-gradient text-white shadow-md hover:opacity-90"
        >
          {t(lang, "viewFullAnalysis")}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      )}

      {/* Contract Health Score */}
      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            {t(lang, "contractHealth")}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-extrabold text-4xl text-on-surface">{riskScore}</span>
            <span className="text-sm text-on-surface-variant">/100</span>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              highCount > 2
                ? "bg-error-container text-on-error-container"
                : highCount > 0
                ? "bg-tertiary-fixed text-tertiary"
                : "bg-primary-fixed text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {highCount > 2 ? "warning" : highCount > 0 ? "info" : "check_circle"}
            </span>
            {t(lang, "riskLevel")}: {t(lang, highCount > 2 ? "high" : highCount > 0 ? "medium" : "low")}
          </span>
          <div className="mt-2 flex gap-2 justify-end">
            {isPro ? (
              <>
                <button
                  onClick={handleShare}
                  title="Copy to clipboard"
                  className="text-xs font-bold text-on-surface-variant border border-outline-variant/30 px-3 py-1 rounded hover:bg-surface-container-low transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">share</span>
                  {t(lang, "share")}
                </button>
                <button
                  onClick={handleExportPDF}
                  title="Export as PDF"
                  className="text-xs font-bold btn-primary-gradient text-white px-3 py-1 rounded flex items-center gap-1 hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
                  {t(lang, "exportPdf")}
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

      <SummaryCard summary={result.summary} language={lang} />

      {/* Contract Type Badge */}
      {result.contractType && result.contractType !== "General Contract" && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-[16px] text-primary">description</span>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t(lang, "contractType")}</span>
          <span className="text-sm font-semibold text-on-surface">{result.contractType}</span>
        </div>
      )}

      {/* Fairness + Key Dates + Financial side by side on desktop */}
      <FairnessCard
        score={result.fairnessScore ?? 50}
        summary={result.fairnessSummary ?? ""}
        partyAName={partyA?.name}
        partyBName={partyB?.name}
        language={lang}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <KeyDatesCard dates={result.keyDates ?? []} language={lang} />
        <FinancialCard obligations={result.financialObligations ?? []} language={lang} />
      </div>

      <MissingClausesCard clauses={result.missingClauses ?? []} language={lang} />

      {/* Party Perspective Selector */}
      {result.parties && result.parties.length >= 2 && (
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
            <h3 className="font-headline font-bold text-on-surface text-sm">{t(lang, "whichParty")}</h3>
          </div>
          <p className="text-xs text-on-surface-variant mb-4">
            {t(lang, "partySelectDesc")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Neutral */}
            <button
              onClick={() => setPerspective("none")}
              className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl text-xs font-bold transition-all border ${
                perspective === "none"
                  ? "border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20"
                  : "border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${
                perspective === "none" ? "text-primary" : "text-on-surface-variant"
              }`}>balance</span>
              <span>{t(lang, "neutral")}</span>
              <span className={`text-[11px] font-normal ${
                perspective === "none" ? "text-primary/70" : "text-on-surface-variant/60"
              }`}>{t(lang, "generalView")}</span>
            </button>

            {/* Party A */}
            <button
              onClick={() => setPerspective("party_a")}
              className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl text-xs font-bold transition-all border ${
                perspective === "party_a"
                  ? "border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20"
                  : "border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${
                perspective === "party_a" ? "text-primary" : "text-on-surface-variant"
              }`}>shield_person</span>
              <span className="truncate max-w-full">{partyA?.name || "Party A"}</span>
              <span className={`text-[11px] font-normal ${
                perspective === "party_a" ? "text-primary/70" : "text-on-surface-variant/60"
              }`}>{partyA?.description || "갑"}</span>
            </button>

            {/* Party B */}
            <button
              onClick={() => setPerspective("party_b")}
              className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl text-xs font-bold transition-all border ${
                perspective === "party_b"
                  ? "border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20"
                  : "border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${
                perspective === "party_b" ? "text-primary" : "text-on-surface-variant"
              }`}>person</span>
              <span className="truncate max-w-full">{partyB?.name || "Party B"}</span>
              <span className={`text-[11px] font-normal ${
                perspective === "party_b" ? "text-primary/70" : "text-on-surface-variant/60"
              }`}>{partyB?.description || "을"}</span>
            </button>
          </div>

          {perspective !== "none" && (
            <div className="mt-3 flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-primary text-[14px]">person_pin</span>
              <span className="text-xs text-primary font-medium">
                {t(lang, "viewingAs")} <strong>{activePartyName}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      <RiskList risks={result.risks} perspective={perspective} partyName={activePartyName} language={lang} />

      <ActionItemsCard items={result.actionItems ?? []} language={lang} />

      <button
        onClick={onReset}
        className="w-full py-3 rounded-lg text-sm font-headline font-bold text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[16px]">refresh</span>
        {t(lang, "analyzeAnother")}
      </button>
    </section>
  );
}
