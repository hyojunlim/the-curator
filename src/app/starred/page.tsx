"use client";

import { useState, useEffect } from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import AppFooter from "@/components/layout/AppFooter";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import type { Contract } from "@/types";

const DATE_LOCALES: Record<string, string> = { en: "en-US", ko: "ko-KR", ja: "ja-JP", zh: "zh-CN", es: "es-ES", fr: "fr-FR", de: "de-DE", pt: "pt-BR" };

function formatDate(iso: string, locale = "en") {
  return new Date(iso).toLocaleDateString(DATE_LOCALES[locale] || "en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function StarredPage() {
  const { t, locale } = useTranslation();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contracts")
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        setContracts(all.filter((c: Contract) => c.starred));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleUnstar(id: string) {
    await fetch(`/api/contracts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starred: false }),
    });
    setContracts((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">
      <AppSidebar />

      <div className="ml-0 lg:ml-64 flex-1 p-6 pt-16 lg:pt-6 lg:p-10 pb-24">
        <div className="mb-8">
          <h1 className="font-headline font-extrabold text-2xl text-on-surface">{t("starred.title")}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{t("starred.description")}</p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high mb-4" />
                <div className="h-4 bg-surface-container-high rounded w-3/4 mb-2" />
                <div className="h-3 bg-surface-container-high rounded w-1/3 mb-4" />
                <div className="flex justify-between">
                  <div className="h-3 bg-surface-container-high rounded w-20" />
                  <div className="h-3 bg-surface-container-high rounded w-12" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && contracts.length === 0 && (
          <div className="text-center py-24 text-on-surface-variant">
            <span className="material-symbols-outlined text-[56px] block mb-3 opacity-30">star</span>
            <p className="font-headline font-bold text-on-surface">{t("starred.noStarredTitle")}</p>
            <p className="text-sm mt-1 mb-4">{t("starred.noStarredDesc")}</p>
            <Link href="/history" className="text-sm text-primary font-medium hover:underline">
              {t("starred.goToContracts")} →
            </Link>
          </div>
        )}

        {!loading && contracts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
            {contracts.map((c) => (
              <div key={c.id} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-all group relative">
                <button
                  onClick={() => handleUnstar(c.id)}
                  className="absolute top-4 right-4 text-yellow-400 hover:text-on-surface-variant transition-colors"
                  title={t("starred.removeStar")}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </button>
                <Link href={`/contracts/${c.id}`} className="block">
                  <div className="flex items-start mb-3 pr-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-fixed/30">
                      <span className="material-symbols-outlined text-[20px] text-primary">description</span>
                    </div>
                  </div>
                  <h3 className="font-headline font-bold text-on-surface text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-4">{c.type}</p>
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                    <div>
                      <span className="uppercase tracking-wider">{t("starred.analyzed")}</span>
                      <p className="font-medium text-on-surface">{formatDate(c.created_at, locale)}</p>
                    </div>
                    <div className="text-right">
                      <span className="uppercase tracking-wider">{t("starred.riskScore")}</span>
                      <p className={`font-headline font-bold text-sm ${c.risk_high ? "text-error" : "text-secondary"}`}>
                        {c.risk_score}/100
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <AppFooter />
    </div>
  );
}
