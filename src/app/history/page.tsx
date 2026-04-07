"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import AppFooter from "@/components/layout/AppFooter";
import Link from "next/link";
import { PREDEFINED_TAGS, getTagColor } from "@/lib/tags";
import { useSubscription } from "@/hooks/useSubscription";
import { MVP_MODE } from "@/lib/config";
import { useTranslation } from "@/lib/i18n";
import type { Contract } from "@/types";

const SORT_KEYS = ["sortMostRecent", "sortHighestRisk", "sortLowestRisk", "sortAlphabetical"] as const;

const DATE_LOCALES: Record<string, string> = { en: "en-US", ko: "ko-KR", ja: "ja-JP", zh: "zh-CN", es: "es-ES", fr: "fr-FR", de: "de-DE", pt: "pt-BR" };

function formatDate(iso: string, locale = "en") {
  return new Date(iso).toLocaleDateString(DATE_LOCALES[locale] || "en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ──────────────────────── Skeleton Card ──────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-3 pr-6">
        <div className="w-10 h-10 rounded-xl bg-surface-container-high" />
        <div className="w-16 h-4 rounded bg-surface-container-high" />
      </div>
      <div className="h-4 w-3/4 rounded bg-surface-container-high mb-2" />
      <div className="h-3 w-1/2 rounded bg-surface-container-high mb-3" />
      <div className="flex gap-1 mb-3">
        <div className="h-4 w-12 rounded bg-surface-container-high" />
        <div className="h-4 w-14 rounded bg-surface-container-high" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-6 w-20 rounded bg-surface-container-high" />
        <div className="h-6 w-12 rounded bg-surface-container-high" />
      </div>
    </div>
  );
}

/* ──────────────────── Confirmation Dialog ──────────────────── */
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmColor = "bg-primary text-on-primary",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-sm p-6 mx-4 animate-in fade-in zoom-in-95">
        <h3 className="font-headline font-bold text-on-surface text-lg mb-2">{title}</h3>
        <p className="text-sm text-on-surface-variant mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── Main Page ──────────────────────── */
export default function HistoryPage() {
  const { t, locale } = useTranslation();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { sub } = useSubscription();

  // Confirmation dialogs
  const [unstarConfirm, setUnstarConfirm] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("sortMostRecent");
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    fetch("/api/contracts")
      .then((r) => r.json())
      .then((data) => { setContracts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* ---- Star / Unstar ---- */
  const handleStarClick = useCallback((id: string, currentlyStarred: boolean) => {
    if (currentlyStarred) {
      setUnstarConfirm(id);
    } else {
      performToggleStar(id, true);
    }
  }, []);

  async function performToggleStar(id: string, starringOn: boolean) {
    setContracts((prev) => prev.map((c) => c.id === id ? { ...c, starred: starringOn } : c));
    await fetch(`/api/contracts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starred: starringOn }),
    });
  }

  function confirmUnstar() {
    if (unstarConfirm) {
      performToggleStar(unstarConfirm, false);
      setUnstarConfirm(null);
    }
  }

  /* ---- Delete ---- */
  async function confirmDelete() {
    if (!deleteConfirm) return;
    const id = deleteConfirm;
    setDeleteConfirm(null);
    setContracts((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/contracts/${id}`, { method: "DELETE" });
  }

  /* ---- Tag click from card ---- */
  function handleTagClick(tag: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setActiveTag((prev) => (prev === tag ? null : tag));
  }

  /* ---- Filtering & sorting ---- */
  const filtered = useMemo(() => {
    let list = contracts;

    if (activeTag) {
      list = list.filter((c) => (c.tags ?? []).includes(activeTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.type.toLowerCase().includes(q));
    }

    if (riskFilter !== "all") {
      list = list.filter((c) => {
        if (riskFilter === "high") return c.risk_score >= 70;
        if (riskFilter === "medium") return c.risk_score >= 40 && c.risk_score < 70;
        return c.risk_score < 40; // low
      });
    }

    switch (sortBy) {
      case "sortHighestRisk":
        list = [...list].sort((a, b) => b.risk_score - a.risk_score);
        break;
      case "sortLowestRisk":
        list = [...list].sort((a, b) => a.risk_score - b.risk_score);
        break;
      case "sortAlphabetical":
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return list;
  }, [contracts, activeTag, riskFilter, searchQuery, sortBy]);

  const isFiltered = activeTag !== null || riskFilter !== "all" || searchQuery.trim() !== "";

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">
      <AppSidebar />

      {/* Unstar confirmation */}
      <ConfirmDialog
        open={unstarConfirm !== null}
        title={t("history.removeFromStarred")}
        message={t("history.unstarMessage")}
        confirmLabel={t("history.unstar")}
        cancelLabel={t("common.cancel")}
        onConfirm={confirmUnstar}
        onCancel={() => setUnstarConfirm(null)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        title={t("history.deleteContract")}
        message={t("history.deleteMessage")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        confirmColor="bg-error text-on-error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      <div className="ml-0 lg:ml-64 flex-1 p-6 pt-16 lg:pt-6 lg:p-10 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-headline font-extrabold text-2xl text-on-surface">{t("history.title")}</h1>
            <div className="flex items-center gap-6 mt-2">
              <Link href="/dashboard" className="text-sm font-medium pb-1 transition-colors text-on-surface-variant hover:text-on-surface">
                {t("history.dashboard")}
              </Link>
              <span className="text-sm font-medium pb-1 text-primary border-b-2 border-primary cursor-default">
                {t("history.historyTab")}
              </span>
              <Link href="/analyze" className="text-sm font-medium pb-1 transition-colors text-on-surface-variant hover:text-on-surface">
                {t("history.newAnalysis")}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${MVP_MODE || sub?.plan !== "free" ? "bg-surface-container-low" : "bg-surface-container-high/30 cursor-not-allowed"}`}>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">search</span>
              {MVP_MODE || sub?.plan !== "free" ? (
                <input
                  type="text"
                  placeholder={t("history.searchContracts")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-on-surface placeholder-on-surface-variant/50 outline-none w-44"
                />
              ) : (
                <span className="text-sm text-on-surface-variant/40 w-44">{t("history.searchPro")}</span>
              )}
              {searchQuery && (MVP_MODE || sub?.plan !== "free") && (
                <button onClick={() => setSearchQuery("")} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
              {!MVP_MODE && sub?.plan === "free" && (
                <span className="material-symbols-outlined text-[12px] text-on-surface-variant/40">lock</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Main grid */}
          <div className="flex-1">
            {/* Stats */}
            <div className="bg-surface-container-lowest rounded-xl p-5 mb-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                {t("history.totalAnalyzed")}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-headline font-extrabold text-4xl text-on-surface">
                  {loading ? "---" : contracts.length}
                </span>
                <span className="text-sm text-on-surface-variant">{t("history.contracts")}</span>
                {!loading && isFiltered && (
                  <span className="text-sm text-on-surface-variant ml-2">
                    ({t("history.showing", { filtered: filtered.length, total: contracts.length })})
                  </span>
                )}
              </div>
            </div>

            {/* Plan history limit notice */}
            {!loading && sub?.plan === "free" && (
              <div className="flex items-center gap-3 bg-tertiary-fixed/20 rounded-lg px-4 py-3 mb-4">
                <span className="material-symbols-outlined text-tertiary text-[18px]">schedule</span>
                <p className="text-xs text-on-surface-variant">
                  {t("history.freeHistoryNotice")}
                  <Link href="/settings" className="text-primary font-bold ml-1 hover:underline">{t("history.upgradeToProHistory")}</Link> {t("history.forNineDayHistory")}
                </p>
              </div>
            )}
            {!loading && sub?.plan === "pro" && (
              <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-4 py-2.5 mb-4">
                <span className="material-symbols-outlined text-primary text-[14px]">verified</span>
                <p className="text-xs text-on-surface-variant">
                  {t("history.proHistoryNotice")}
                </p>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Empty state: no contracts at all */}
            {!loading && filtered.length === 0 && contracts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-primary-fixed/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[40px] text-primary/60">description</span>
                </div>
                <p className="font-headline font-bold text-on-surface text-lg mb-2">{t("history.noContractsTitle")}</p>
                <p className="text-sm text-on-surface-variant max-w-xs mb-6">
                  {t("history.noContractsDesc")}
                </p>
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  {t("history.startFirstAnalysis")}
                </Link>
              </div>
            )}

            {/* Empty state: no results from filter */}
            {!loading && filtered.length === 0 && contracts.length > 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">search_off</span>
                </div>
                <p className="font-headline font-bold text-on-surface text-lg mb-2">{t("history.noMatchTitle")}</p>
                <p className="text-sm text-on-surface-variant max-w-xs mb-6">
                  {t("history.noMatchDesc")}
                </p>
                <button
                  onClick={() => { setSearchQuery(""); setActiveTag(null); setRiskFilter("all"); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-sm font-medium hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                  {t("history.clearAllFilters")}
                </button>
              </div>
            )}

            {/* Cards grid */}
            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    className="bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-all group relative"
                  >
                    {/* Star button */}
                    <button
                      onClick={() => handleStarClick(c.id, c.starred)}
                      aria-label={c.starred ? t("history.unstarContract") : t("history.starContract")}
                      title={c.starred ? t("history.unstarContract") : t("history.starContract")}
                      className={`absolute top-4 right-4 transition-colors ${c.starred ? "text-yellow-400" : "text-on-surface-variant/30 hover:text-yellow-400"}`}
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: c.starred ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setDeleteConfirm(c.id)}
                      aria-label="Delete contract"
                      title="Delete contract"
                      className="absolute top-4 right-12 text-on-surface-variant/0 group-hover:text-on-surface-variant/40 hover:!text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>

                    <Link href={`/contracts/${c.id}`} className="block">
                      <div className="flex items-start justify-between mb-3 pr-14">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-fixed/30">
                          <span className="material-symbols-outlined text-[20px] text-primary">description</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-fixed/30 text-primary">
                          {c.status}
                        </span>
                      </div>
                      <h3 className="font-headline font-bold text-on-surface text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {c.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant mb-2">{c.type}</p>
                    </Link>

                    {/* Tags -- clickable to filter */}
                    {(c.tags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(c.tags ?? []).slice(0, 3).map((tag) => (
                          <button
                            key={tag}
                            onClick={(e) => handleTagClick(tag, e)}
                            className={`text-[11px] px-1.5 py-0.5 rounded border font-medium cursor-pointer hover:opacity-80 transition-opacity ${getTagColor(tag)} ${activeTag === tag ? "ring-1 ring-primary" : ""}`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}

                    <Link href={`/contracts/${c.id}`} className="block">
                      <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                        <div>
                          <span className="uppercase tracking-wider">{t("history.analyzed")}</span>
                          <p className="font-medium text-on-surface">{formatDate(c.created_at, locale)}</p>
                        </div>
                        <div className="text-right">
                          <span className="uppercase tracking-wider">{t("history.riskScore")}</span>
                          <p className={`font-headline font-bold text-sm ${c.risk_high ? "text-error" : "text-secondary"}`}>
                            {c.risk_score}/100
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}

                <Link
                  href="/analyze"
                  className="bg-surface-container-low rounded-xl p-5 border-2 border-dashed border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container-lowest transition-all flex flex-col items-center justify-center text-center min-h-[160px] group"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center mb-3 group-hover:bg-primary-fixed transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px] group-hover:text-primary transition-colors">add</span>
                  </div>
                  <p className="font-headline font-bold text-on-surface text-sm mb-1">{t("history.newAnalysis")}</p>
                  <p className="text-xs text-on-surface-variant">{t("history.uploadPdfDocx")}</p>
                </Link>
              </div>
            )}
          </div>

          {/* Filters panel */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                {t("history.filterByLabel")}
              </p>
              <div className="flex flex-col gap-1.5 mb-4">
                <button
                  onClick={() => setActiveTag(null)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium text-left transition-colors ${
                    !activeTag
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {t("history.allContracts")}
                </button>
                {PREDEFINED_TAGS.map(({ label, color }) => {
                  const count = contracts.filter((c) => (c.tags ?? []).includes(label)).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={label}
                      onClick={() => setActiveTag(activeTag === label ? null : label)}
                      className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                        activeTag === label ? color + " border" : "text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      <span>{label}</span>
                      <span className="text-[10px] opacity-60">{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-outline-variant/10 pt-3 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  {t("history.riskLevel")}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(["all", "high", "medium", "low"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setRiskFilter(level)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                        riskFilter === level
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-high/50 text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-outline-variant/10 pt-3 relative">
                <button
                  onClick={() => setSortOpen((o) => !o)}
                  className="flex items-center justify-between w-full text-xs text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span>{t("history.sort")}: <span className="font-medium text-on-surface">{t(`history.${sortBy}`)}</span></span>
                  <span className={`material-symbols-outlined text-[16px] transition-transform ${sortOpen ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                {sortOpen && (
                  <div className="absolute top-full right-0 mt-1 min-w-[200px] max-h-60 overflow-y-auto bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 z-10">
                    {SORT_KEYS.map((key) => (
                      <button
                        key={key}
                        onClick={() => { setSortBy(key); setSortOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                          sortBy === key ? "bg-primary-fixed text-primary font-bold" : "text-on-surface-variant hover:bg-surface-container-low"
                        }`}
                      >
                        {t(`history.${key}`)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
