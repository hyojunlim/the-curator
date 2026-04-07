"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import AppSidebar from "@/components/layout/AppSidebar";
import AppFooter from "@/components/layout/AppFooter";
import UpgradeBanner from "@/components/ui/UpgradeBanner";
import { useSubscription } from "@/hooks/useSubscription";
import type { Contract } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ── Skeleton primitives ── */
function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-on-surface/5 ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
      <SkeletonBlock className="h-3 w-24 mb-3" />
      <SkeletonBlock className="h-10 w-16 mb-2" />
      <SkeletonBlock className="h-3 w-28" />
    </div>
  );
}

function ContractRowSkeleton() {
  return (
    <div className="flex items-center justify-between bg-surface-container-lowest rounded-xl px-5 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="w-10 h-10 rounded-xl" />
        <div>
          <SkeletonBlock className="h-4 w-40 mb-2" />
          <SkeletonBlock className="h-3 w-28" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <SkeletonBlock className="h-3 w-8 mb-1" />
          <SkeletonBlock className="h-4 w-12" />
        </div>
        <SkeletonBlock className="h-5 w-5 rounded" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { sub, refresh: refreshSub } = useSubscription();
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    fetch("/api/contracts")
      .then((r) => r.json())
      .then((data) => { setContracts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const total = contracts.length;
  const highRisk = contracts.filter((c) => c.risk_high).length;
  const avgScore = total > 0 ? Math.round(contracts.reduce((s, c) => s + c.risk_score, 0) / total) : 0;
  const recent = contracts.slice(0, 3);

  // Most recent analysis timestamp
  const lastAnalyzed = contracts.length > 0
    ? contracts.reduce((latest, c) => (c.created_at > latest ? c.created_at : latest), contracts[0].created_at)
    : null;

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = userLoaded && user ? (user.firstName ?? user.username ?? null) : null;

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">
      <AppSidebar />

      <div className="ml-0 lg:ml-64 flex-1 p-6 pt-16 lg:pt-6 lg:p-10 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-headline font-extrabold text-2xl text-on-surface">
              {displayName ? `${greeting}, ${displayName}` : greeting}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {lastAnalyzed && !loading
                ? <>Here's your contract risk summary. Last analyzed {timeAgo(lastAnalyzed)}.</>
                : "Welcome back. Here's your contract risk summary."}
            </p>
          </div>
          <Link
            href="/analyze"
            className="btn-primary-gradient text-white px-5 py-2.5 rounded-lg font-headline font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Analysis
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Total Contracts</p>
                <span className="font-headline font-extrabold text-4xl text-on-surface">{total}</span>
                <p className="text-xs text-on-surface-variant mt-1">Analyzed to date</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">High Risk</p>
                <span className="font-headline font-extrabold text-4xl text-error">{highRisk}</span>
                <p className="text-xs text-on-surface-variant mt-1">Require immediate review</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Avg Risk Score</p>
                <span className={`font-headline font-extrabold text-4xl ${avgScore >= 60 ? "text-error" : "text-secondary"}`}>
                  {total > 0 ? avgScore : "N/A"}
                </span>
                <p className="text-xs text-on-surface-variant mt-1">Across all contracts</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Plan</p>
                <span className="font-headline font-extrabold text-4xl text-primary">
                  {sub ? (sub.plan === "business" ? "Business" : sub.plan === "pro" ? "Pro" : "Free") : "—"}
                </span>
                <p className="text-xs text-on-surface-variant mt-1">
                  {sub?.plan === "business" ? "Unlimited analyses" : sub?.plan === "pro" ? `${sub.remaining} of 30 left` : sub ? `${sub.remaining} analyses left` : "Loading..."}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Upgrade Banner */}
        {sub && sub.plan !== "business" && sub.limit && (
          <div className="mb-8">
            <UpgradeBanner
              remaining={sub.remaining}
              limit={sub.limit}
              plan={sub.plan}
              onUpgraded={refreshSub}
            />
          </div>
        )}

        {/* Recent contracts */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-headline font-bold text-on-surface">Recent Contracts</h2>
            {lastAnalyzed && !loading && (
              <span className="text-[10px] text-on-surface-variant bg-surface-container-lowest px-2 py-0.5 rounded-full">
                Latest: {formatDate(lastAnalyzed)}
              </span>
            )}
          </div>
          <Link href="/history" className="text-xs text-primary font-medium hover:underline">View all &rarr;</Link>
        </div>

        {loading && (
          <div className="space-y-3 mb-8">
            <ContractRowSkeleton />
            <ContractRowSkeleton />
            <ContractRowSkeleton />
          </div>
        )}

        {!loading && contracts.length === 0 && (
          <div className="text-center py-16 bg-surface-container-lowest rounded-xl shadow-sm text-on-surface-variant">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-fixed/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-primary">contract</span>
            </div>
            <p className="font-headline font-bold text-lg text-on-surface">Your dashboard is ready</p>
            <p className="text-sm mt-1 mb-1 max-w-sm mx-auto">
              Upload your first contract and let AI highlight risks, flag key clauses, and give you an actionable summary in seconds.
            </p>
            <p className="text-xs mb-5 text-on-surface-variant/60">Supports PDF and DOCX files</p>
            <Link href="/analyze" className="inline-flex items-center gap-2 btn-primary-gradient text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity shadow-md">
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              Upload Your First Contract
            </Link>
          </div>
        )}

        {!loading && recent.length > 0 && (
          <div className="space-y-3 mb-8">
            {recent.map((c) => (
              <Link
                key={c.id}
                href={`/contracts/${c.id}`}
                className="flex items-center justify-between bg-surface-container-lowest rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-fixed/30">
                    <span className="material-symbols-outlined text-[18px] text-primary">description</span>
                  </div>
                  <div>
                    <p className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">{c.title}</p>
                    <p className="text-xs text-on-surface-variant">{c.type} · {formatDate(c.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Risk</p>
                    <p className={`font-headline font-bold text-sm ${c.risk_high ? "text-error" : "text-secondary"}`}>{c.risk_score}/100</p>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <h2 className="font-headline font-bold text-on-surface mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/analyze"
            className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 rounded-xl p-6 hover:shadow-lg hover:border-primary/25 transition-all group flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[26px] text-primary group-hover:text-white transition-colors">psychology</span>
            </div>
            <div>
              <p className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">Analyze a Contract</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Upload PDF or DOCX for instant AI-powered review</p>
            </div>
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant/40 group-hover:text-primary ml-auto transition-colors">arrow_forward</span>
          </Link>
          <Link
            href="/history"
            className="relative overflow-hidden bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/10 rounded-xl p-6 hover:shadow-lg hover:border-secondary/25 transition-all group flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-secondary/15 rounded-2xl flex items-center justify-center group-hover:bg-secondary group-hover:scale-105 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[26px] text-secondary group-hover:text-white transition-colors">inventory_2</span>
            </div>
            <div>
              <p className="font-headline font-bold text-on-surface group-hover:text-secondary transition-colors">View All Contracts</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Browse, filter, and compare your review history</p>
            </div>
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant/40 group-hover:text-secondary ml-auto transition-colors">arrow_forward</span>
          </Link>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
