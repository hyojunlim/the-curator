"use client";

import { useState } from "react";
import type { RiskItem } from "@/types";
import { t } from "@/lib/i18n";


interface Props {
  risk: RiskItem;
  clauseNumber?: number;
  perspective: "none" | "party_a" | "party_b";
  partyName?: string;
  language?: string;
  defaultOpen?: boolean;
}

export default function RiskItemCard({ risk, clauseNumber, perspective, partyName, language, defaultOpen = false }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const lang = language || "English";

  const activeSuggestion =
    perspective === "party_a"
      ? risk.suggestion_party_a || risk.suggestion
      : perspective === "party_b"
      ? risk.suggestion_party_b || risk.suggestion
      : risk.suggestion;

  return (
    <div className="bg-surface-container-lowest rounded-xl border-l-4 border-l-outline-variant/30 shadow-sm overflow-hidden">
      {/* Header — always visible, clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-surface-container-low/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[16px] text-primary">article</span>
          <h3 className="font-headline font-bold text-on-surface text-sm truncate">{risk.title}</h3>
          {risk.clauseReference && risk.clauseReference !== "N/A" && (
            <span className="text-[11px] text-on-surface-variant/70 shrink-0 bg-surface-container-high px-1.5 py-0.5 rounded">{risk.clauseReference}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`material-symbols-outlined text-[18px] text-on-surface-variant transition-transform ${isOpen ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </div>
      </button>

      {/* Detail — collapsible */}
      {isOpen && (
        <div className="px-5 pb-5 space-y-3">
          {/* Clause quote */}
          {risk.clause && (
            <div className="bg-surface-container-low rounded-lg p-3 border-l-2 border-outline-variant">
              <p className="text-sm text-on-surface-variant italic leading-relaxed font-body">
                &ldquo;{risk.clause}&rdquo;
              </p>
            </div>
          )}

          {/* Explanation */}
          <p className="text-base text-on-surface-variant leading-relaxed">{risk.explanation}</p>

          {/* Suggestion */}
          {activeSuggestion && (
            <div className={`rounded-lg p-3 ${
              perspective !== "none"
                ? "bg-primary/5 border border-primary/20"
                : "bg-surface-container-low"
            }`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`material-symbols-outlined text-[14px] ${
                  perspective !== "none" ? "text-primary" : "text-on-surface-variant"
                }`}>
                  {perspective !== "none" ? "person_pin" : "lightbulb"}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  perspective !== "none" ? "text-primary" : "text-on-surface-variant"
                }`}>
                  {perspective !== "none" && partyName
                    ? <>{partyName} {t(lang, "advice")}</>
                    : t(lang, "suggestion")}
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${
                perspective !== "none" ? "text-on-surface" : "text-on-surface-variant"
              }`}>
                {activeSuggestion}
              </p>
            </div>
          )}

          {/* Rewrite or Addition */}
          {(() => {
            const activeRewrite = perspective === "party_a" ? (risk.rewrite_party_a || risk.rewrite)
              : perspective === "party_b" ? (risk.rewrite_party_b || risk.rewrite)
              : risk.rewrite;
            if (!activeRewrite) return null;
            const isAdd = risk.rewrite_type === "add";
            const headerLabel = isAdd ? t(lang, "suggestedAddition") : t(lang, "suggestedRewrite");
            const headerIcon = isAdd ? "add_circle" : "edit_note";
            return (
              <div className="rounded-lg border border-secondary/20 overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-secondary/5">
                  <span className="material-symbols-outlined text-[14px] text-secondary">{headerIcon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">{headerLabel}</span>
                </div>
                {isAdd ? (
                  <div className="p-3 bg-secondary/3">
                    <p className="text-sm text-on-surface leading-relaxed font-medium">{activeRewrite}</p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant/15">
                  <div className="p-3 bg-error/3">
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="material-symbols-outlined text-[12px] text-error/60">close</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-error/60">{t(lang, "before")}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant/70 leading-relaxed line-through decoration-error/30">
                      {risk.clause}
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/3">
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="material-symbols-outlined text-[12px] text-secondary">check</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-secondary">{t(lang, "after")}</span>
                    </div>
                    <p className="text-sm text-on-surface leading-relaxed font-medium">
                      {activeRewrite}
                    </p>
                  </div>
                </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
