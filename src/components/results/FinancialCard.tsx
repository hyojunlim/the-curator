import type { FinancialObligation } from "@/types";
import { t } from "@/lib/i18n";

interface Props {
  obligations: FinancialObligation[];
  language?: string;
}

export default function FinancialCard({ obligations, language }: Props) {
  const lang = language || "English";
  if (!obligations || obligations.length === 0) return null;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-tertiary-fixed rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-tertiary text-[18px]">payments</span>
        </div>
        <h3 className="font-headline font-bold text-on-surface">{t(lang, "financialObligations")}</h3>
      </div>
      <div className="space-y-3">
        {obligations.map((o, i) => (
          <div key={i} className="rounded-lg bg-surface-container-low p-3">
            <div className="flex items-start justify-between gap-3 mb-1">
              <span className="text-base font-semibold text-on-surface">{o.description}</span>
              <span className="text-sm font-bold text-primary shrink-0">{o.amount}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">person</span>
                {o.party}
              </span>
              {o.condition && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                  {o.condition}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
