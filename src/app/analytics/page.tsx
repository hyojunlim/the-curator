"use client";

import { useEffect, useState } from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import AppFooter from "@/components/layout/AppFooter";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import type { Contract } from "@/types";

export default function AnalyticsPage() {
  const { t, locale } = useTranslation();
  const dateLocale = ({ en: "en-US", ko: "ko-KR", ja: "ja-JP", zh: "zh-CN", es: "es-ES", fr: "fr-FR", de: "de-DE", pt: "pt-BR" } as Record<string, string>)[locale] || "en-US";
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contracts")
      .then((r) => r.json())
      .then((data) => { setContracts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const total = contracts.length;
  const high = contracts.filter((c) => c.risk_score >= 70).length;
  const medium = contracts.filter((c) => c.risk_score >= 40 && c.risk_score < 70).length;
  const low = contracts.filter((c) => c.risk_score < 40).length;
  const avgScore = total > 0 ? Math.round(contracts.reduce((s, c) => s + c.risk_score, 0) / total) : 0;
  const highestRisk = [...contracts].sort((a, b) => b.risk_score - a.risk_score).slice(0, 3);

  // Group by month for the bar chart (last 6 months)
  const monthlyData = (() => {
    const months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString(dateLocale, { month: "short" });
      const count = contracts.filter((c) => {
        const cd = new Date(c.created_at);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      }).length;
      months.push({ label, count });
    }
    return months;
  })();

  const maxMonthly = Math.max(...monthlyData.map((m) => m.count), 1);

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">
      <AppSidebar />

      <div className="ml-0 lg:ml-64 flex-1 p-6 pt-16 lg:pt-6 lg:p-10 pb-24">
        <div className="mb-8">
          <h1 className="font-headline font-extrabold text-2xl text-on-surface">{t("analytics.title")}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{t("analytics.description")}</p>
        </div>

        {loading ? (
          <div className="space-y-6 max-w-4xl animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                  <div className="h-3 bg-surface-container-high rounded w-20 mb-3" />
                  <div className="h-8 bg-surface-container-high rounded w-16" />
                </div>
              ))}
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <div className="h-4 bg-surface-container-high rounded w-32 mb-5" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <div className="h-3 bg-surface-container-high rounded w-24 mb-2" />
                    <div className="h-2.5 bg-surface-container-high rounded-full" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <div className="h-4 bg-surface-container-high rounded w-32 mb-5" />
              <div className="flex items-end gap-3 h-32">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-1 bg-surface-container-high rounded-t-md" style={{ height: `${30 + Math.random() * 50}%` }} />
                ))}
              </div>
            </div>
          </div>
        ) : total === 0 ? (
          <div className="text-center py-24 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] block mb-3 opacity-30">bar_chart</span>
            <p className="font-headline font-bold text-on-surface">{t("analytics.noDataTitle")}</p>
            <p className="text-sm mt-1 mb-4">{t("analytics.noDataDesc")}</p>
            <Link href="/analyze" className="inline-flex items-center gap-2 btn-primary-gradient text-white px-5 py-2 rounded-lg text-sm font-bold">
              <span className="material-symbols-outlined text-[16px]">add</span>{t("analytics.startAnalysis")}
            </Link>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t("analytics.totalContracts"), value: total, color: "text-on-surface" },
                { label: t("analytics.avgRiskScore"), value: avgScore, color: avgScore >= 60 ? "text-error" : "text-secondary" },
                { label: t("analytics.highRisk"), value: high, color: "text-error" },
                { label: t("analytics.lowRisk"), value: low, color: "text-secondary" },
              ].map((s) => (
                <div key={s.label} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{s.label}</p>
                  <span className={`font-headline font-extrabold text-4xl ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Risk distribution */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <h2 className="font-headline font-bold text-on-surface mb-5">{t("analytics.riskDistribution")}</h2>
              <div className="space-y-3">
                {[
                  { label: t("analytics.highRiskLabel"), count: high, color: "bg-error", textColor: "text-error" },
                  { label: t("analytics.mediumRiskLabel"), count: medium, color: "bg-tertiary", textColor: "text-tertiary" },
                  { label: t("analytics.lowRiskLabel"), count: low, color: "bg-secondary", textColor: "text-secondary" },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-on-surface-variant">{r.label}</span>
                      <span className={`font-bold ${r.textColor}`}>{total > 0 ? Math.round((r.count / total) * 100) : 0}% ({r.count})</span>
                    </div>
                    <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${r.color} transition-all duration-700`}
                        style={{ width: total > 0 ? `${(r.count / total) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly activity */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <h2 className="font-headline font-bold text-on-surface mb-5">{t("analytics.monthlyActivity")}</h2>
              <div className="flex items-end gap-3 h-32">
                {monthlyData.map((m) => (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-on-surface-variant">{m.count > 0 ? m.count : ""}</span>
                    <div className="w-full rounded-t-md bg-surface-container-high overflow-hidden" style={{ height: "80px" }}>
                      <div
                        className="w-full bg-primary rounded-t-md transition-all duration-700"
                        style={{ height: `${(m.count / maxMonthly) * 100}%`, marginTop: `${100 - (m.count / maxMonthly) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-on-surface-variant">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Highest risk contracts */}
            {highestRisk.length > 0 && (
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                <h2 className="font-headline font-bold text-on-surface mb-4">{t("analytics.highestRiskContracts")}</h2>
                <div className="space-y-3">
                  {highestRisk.map((c, i) => (
                    <Link
                      key={c.id}
                      href={`/contracts/${c.id}`}
                      className="flex items-center justify-between hover:bg-surface-container-low rounded-lg p-2 -mx-2 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-on-surface-variant w-4">{i + 1}</span>
                        <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-1">{c.title}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="h-1.5 w-20 bg-surface-container-high rounded-full overflow-hidden">
                          <div className="h-full bg-error rounded-full" style={{ width: `${c.risk_score}%` }} />
                        </div>
                        <span className="text-xs font-bold text-error w-12 text-right">{c.risk_score}/100</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AppFooter />
    </div>
  );
}
