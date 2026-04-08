import type { RiskItem } from "@/types";
import { t } from "@/lib/i18n";
import RiskItemCard from "./RiskItem";

interface Props {
  risks: RiskItem[];
  perspective: "none" | "party_a" | "party_b";
  partyName?: string;
  language?: string;
}

export default function RiskList({ risks, perspective, partyName, language }: Props) {
  const lang = language || "English";

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
      </div>
      <div className="space-y-3">
        {risks.map((risk, index) => (
          <RiskItemCard
            key={`${risk.title}-${index}`}
            risk={risk}
            clauseNumber={index + 1}
            perspective={perspective}
            partyName={partyName}
            language={lang}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
