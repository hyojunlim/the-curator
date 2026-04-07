import type { RiskItem } from "@/types";
import { t } from "@/lib/i18n";

const severityConfig = {
  high: {
    label: "Critical",
    badge: "bg-error-container text-on-error-container",
    border: "border-l-error",
    icon: "error",
    iconColor: "text-error",
  },
  medium: {
    label: "Caution",
    badge: "bg-tertiary-fixed text-tertiary",
    border: "border-l-secondary",
    icon: "warning",
    iconColor: "text-secondary",
  },
  low: {
    label: "Advisory",
    badge: "bg-primary-fixed text-primary",
    border: "border-l-secondary",
    icon: "info",
    iconColor: "text-secondary",
  },
} as const;

interface Props {
  risk: RiskItem;
  clauseNumber?: number;
  perspective: "none" | "party_a" | "party_b";
  partyName?: string;
  language?: string;
}

export default function RiskItemCard({ risk, clauseNumber, perspective, partyName, language }: Props) {
  const lang = language || "English";
  const config = severityConfig[risk.severity];

  // Pick the right suggestion based on selected perspective
  const activeSuggestion =
    perspective === "party_a"
      ? risk.suggestion_party_a || risk.suggestion
      : perspective === "party_b"
      ? risk.suggestion_party_b || risk.suggestion
      : risk.suggestion;

  return (
    <div className={`bg-surface-container-lowest rounded-xl border-l-4 ${config.border} shadow-sm p-5`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-headline font-bold text-on-surface text-sm">{risk.title}</h3>
          {clauseNumber && (
            <span className="text-[11px] text-on-surface-variant">{t(lang, "clause")} {clauseNumber}</span>
          )}
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-0.5 ${config.badge}`}>
          <span className="material-symbols-outlined text-[12px]">{config.icon}</span>
          {risk.severity === "high" ? t(lang, "critical") : risk.severity === "medium" ? t(lang, "caution") : t(lang, "advisory")}
        </span>
      </div>

      {risk.clause && (
        <div className="bg-surface-container-low rounded-lg p-3 mb-3 border-l-2 border-outline-variant">
          <p className="text-xs text-on-surface-variant italic leading-relaxed font-body">
            &ldquo;{risk.clause}&rdquo;
          </p>
        </div>
      )}

      <p className="text-xs text-on-surface-variant leading-relaxed">{risk.explanation}</p>

      {/* Suggestion section */}
      {activeSuggestion && (
        <div className={`mt-3 rounded-lg p-3 ${
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

      {/* Rewrite or Addition: Before → After (changes based on perspective) */}
      {(() => {
        const activeRewrite = perspective === "party_a" ? (risk.rewrite_party_a || risk.rewrite)
          : perspective === "party_b" ? (risk.rewrite_party_b || risk.rewrite)
          : risk.rewrite;
        if (!activeRewrite) return null;
        const isAdd = risk.rewrite_type === "add";
        const headerLabel = isAdd ? t(lang, "suggestedAddition") : t(lang, "suggestedRewrite");
        const headerIcon = isAdd ? "add_circle" : "edit_note";
        return (
          <div className="mt-3 rounded-lg border border-secondary/20 overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-secondary/5">
              <span className="material-symbols-outlined text-[14px] text-secondary">{headerIcon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">{headerLabel}</span>
            </div>
            {isAdd ? (
              <div className="p-3 bg-secondary/3">
                <p className="text-xs text-on-surface leading-relaxed font-medium">{activeRewrite}</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant/15">
              <div className="p-3 bg-error/3">
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="material-symbols-outlined text-[12px] text-error/60">close</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-error/60">{t(lang, "before")}</span>
                </div>
                <p className="text-xs text-on-surface-variant/70 leading-relaxed line-through decoration-error/30">
                  {risk.clause}
                </p>
              </div>
              <div className="p-3 bg-secondary/3">
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="material-symbols-outlined text-[12px] text-secondary">check</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-secondary">{t(lang, "after")}</span>
                </div>
                <p className="text-xs text-on-surface leading-relaxed font-medium">
                  {activeRewrite}
                </p>
              </div>
            </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
