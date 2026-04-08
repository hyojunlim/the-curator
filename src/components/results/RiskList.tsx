import type { RiskItem } from "@/types";
import { t } from "@/lib/i18n";
import RiskItemCard from "./RiskItem";

interface Props {
  risks: RiskItem[];
  perspective: "none" | "party_a" | "party_b";
  partyName?: string;
  language?: string;
}

const severityOrder = { high: 0, medium: 1, low: 2 } as const;

export default function RiskList({ risks, perspective, partyName, language }: Props) {
  const lang = language || "English";
  const sorted = [...risks].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );
  const highCount = risks.filter((r) => r.severity === "high").length;
  const mediumCount = risks.filter((r) => r.severity === "medium").length;
  const lowCount = risks.filter((r) => r.severity === "low").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary">policy</span>
          Clause Breakdown
          <span className="text-[10px] font-bold bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">
            {risks.length} {t(lang, "total")}
          </span>
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
          {highCount > 0 && <span className="text-error inline-flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">error</span>{highCount} {t(lang, "critical")}</span>}
          {mediumCount > 0 && <span className="text-secondary inline-flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">warning</span>{mediumCount} {t(lang, "caution")}</span>}
          {lowCount > 0 && <span className="text-on-surface-variant inline-flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">info</span>{lowCount} {t(lang, "advisory")}</span>}
        </div>
      </div>
      <div className="space-y-3">
        {sorted.map((risk, index) => (
          <RiskItemCard
            key={`${risk.severity}-${risk.title}-${index}`}
            risk={risk}
            clauseNumber={index + 1}
            perspective={perspective}
            partyName={partyName}
            language={lang}
            defaultOpen={risk.severity === "high"}
          />
        ))}
      </div>
    </div>
  );
}
