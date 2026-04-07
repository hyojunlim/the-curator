"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import AppFooter from "@/components/layout/AppFooter";
import Link from "next/link";
import { PREDEFINED_TAGS, getTagColor } from "@/lib/tags";
import { useSubscription } from "@/hooks/useSubscription";
import type { Contract } from "@/types";

const SORT_OPTIONS = ["Most Recent", "Highest Risk", "Lowest Risk", "Alphabetical"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
  confirmColor = "bg-primary text-on-primary",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
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
            Cancel
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
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { sub } = useSubscription();

  // Confirmation dialogs
  const [unstarConfirm, setUnstarConfirm] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Most Recent");
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

    switch (sortBy) {
      case "Highest Risk":
        list = [...list].sort((a, b) => b.risk_score - a.risk_score);
        break;
      case "Lowest Risk":
        list = [...list].sort((a, b) => a.risk_score - b.risk_score);
        break;
      case "Alphabetical":
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return list;
  }, [contracts, activeTag, searchQuery, sortBy]);

  const isFiltered = activeTag !== null || searchQuery.trim() !== "";

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">
      <AppSidebar />

      {/* Unstar confirmation */}
      <ConfirmDialog
        open={unstarConfirm !== null}
        title="Remove from Starred"
        message="Are you sure you want to unstar this contract? You can always star it again later."
        confirmLabel="Unstar"
        onConfirm={confirmUnstar}
        onCancel={() => setUnstarConfirm(null)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Delete Contract"
        message="This action cannot be undone. The contract and its analysis results will be permanently deleted."
        confirmLabel="Delete"
        confirmColor="bg-error text-on-error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      <div className="ml-0 lg:ml-64 flex-1 p-6 pt-16 lg:pt-6 lg:p-10 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-headline font-extrabold text-2xl text-on-surface">Review History</h1>
            <div className="flex items-center gap-6 mt-2">
              <Link href="/dashboard" className="text-sm font-medium pb-1 transition-colors text-on-surface-variant hover:text-on-surface">
                Dashboard
              </Link>
              <span className="text-sm font-medium pb-1 text-primary border-b-2 border-primary cursor-default">
                History
              </span>
              <Link href="/analyze" className="text-sm font-medium pb-1 transition-colors text-on-surface-variant hover:text-on-surface">
                New Analysis
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${sub?.plan !== "free" ? "bg-surface-container-low" : "bg-surface-container-high/30 cursor-not-allowed"}`}>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">search</span>
              {sub?.plan !== "free" ? (
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-on-surface placeholder-on-surface-variant/50 outline-none w-44"
                />
              ) : (
                <span className="text-sm text-on-surface-variant/40 w-44">Search (Pro)</span>
              )}
              {searchQuery && sub?.plan !== "free" && (
                <button onClick={() => setSearchQuery("")} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
              {sub?.plan === "free" && (
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
                Total Analyzed
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-headline font-extrabold text-4xl text-on-surface">
                  {loading ? "---" : contracts.length}
                </span>
                <span className="text-sm text-on-surface-variant">Contracts</span>
                {!loading && isFiltered && (
                  <span className="text-sm text-on-surface-variant ml-2">
                    (showing {filtered.length} of {contracts.length})
                  </span>
                )}
              </div>
            </div>

            {/* Plan history limit notice */}
            {!loading && sub?.plan === "free" && (
              <div className="flex items-center gap-3 bg-tertiary-fixed/20 rounded-lg px-4 py-3 mb-4">
                <span className="material-symbols-outlined text-tertiary text-[18px]">schedule</span>
                <p className="text-xs text-on-surface-variant">
                  Free plan shows contracts from the <strong>last 7 days</strong> only.
                  <Link href="/settings" className="text-primary font-bold ml-1 hover:underline">Upgrade to Pro</Link> for 90-day history &amp; search.
                </p>
              </div>
            )}
            {!loading && sub?.plan === "pro" && (
              <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-4 py-2.5 mb-4">
                <span className="material-symbols-outlined text-primary text-[14px]">verified</span>
                <p className="text-xs text-on-surface-variant">
                  Pro plan — showing contracts from the <strong>last 90 days</strong>.
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
                <p className="font-headline font-bold text-on-surface text-lg mb-2">No contracts yet</p>
                <p className="text-sm text-on-surface-variant max-w-xs mb-6">
                  Upload your first contract to get an AI-powered analysis of risks, clauses, and key terms.
                </p>
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Start Your First Analysis
                </Link>
              </div>
            )}

            {/* Empty state: no results from filter */}
            {!loading && filtered.length === 0 && contracts.length > 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">search_off</span>
                </div>
                <p className="font-headline font-bold text-on-surface text-lg mb-2">No matching contracts</p>
                <p className="text-sm text-on-surface-variant max-w-xs mb-6">
                  No contracts match your current search or filter. Try adjusting your criteria.
                </p>
                <button
                  onClick={() => { setSearchQuery(""); setActiveTag(null); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-sm font-medium hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                  Clear All Filters
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
                      aria-label={c.starred ? "Unstar contract" : "Star contract"}
                      className={`absolute top-4 right-4 transition-colors ${c.starred ? "text-yellow-400" : "text-on-surface-variant/30 hover:text-yellow-400"}`}
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: c.starred ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setDeleteConfirm(c.id)}
                      aria-label="Delete contract"
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
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-medium cursor-pointer hover:opacity-80 transition-opacity ${getTagColor(tag)} ${activeTag === tag ? "ring-1 ring-primary" : ""}`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}

                    <Link href={`/contracts/${c.id}`} className="block">
                      <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                        <div>
                          <span className="uppercase tracking-wider">Analyzed</span>
                          <p className="font-medium text-on-surface">{formatDate(c.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <span className="uppercase tracking-wider">Risk Score</span>
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
                  <p className="font-headline font-bold text-on-surface text-sm mb-1">New Analysis</p>
                  <p className="text-xs text-on-surface-variant">Upload PDF or DOCX</p>
                </Link>
              </div>
            )}
          </div>

          {/* Filters panel */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                Filter by Label
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
                  All Contracts
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

              <div className="border-t border-outline-variant/10 pt-3 relative">
                <button
                  onClick={() => setSortOpen((o) => !o)}
                  className="flex items-center justify-between w-full text-xs text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span>Sort: <span className="font-medium text-on-surface">{sortBy}</span></span>
                  <span className={`material-symbols-outlined text-[16px] transition-transform ${sortOpen ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                {sortOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 overflow-hidden z-10">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setSortOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                          sortBy === opt ? "bg-primary-fixed text-primary font-bold" : "text-on-surface-variant hover:bg-surface-container-low"
                        }`}
                      >
                        {opt}
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
