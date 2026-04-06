import type { RiskItem } from "@/types";
import RiskItemCard from "./RiskItem";

interface Props {
  risks: RiskItem[];
  perspective: "none" | "party_a" | "party_b";
  partyName?: string;
}

const severityOrder = { high: 0, medium: 1, low: 2 } as const;

export default function RiskList({ risks, perspective, partyName }: Props) {
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
            {risks.length} total
          </span>
        </h3>
        <div className="flex items-center gap-3 text-xs font-bold">
          {highCount > 0 && <span className="text-error">{highCount} Critical</span>}
          {mediumCount > 0 && <span className="text-secondary">{mediumCount} Caution</span>}
          {lowCount > 0 && <span className="text-on-surface-variant">{lowCount} Advisory</span>}
        </div>
      </div>
      <div className="space-y-3">
        {sorted.map((risk, index) => (
          <RiskItemCard
            key={index}
            risk={risk}
            clauseNumber={index + 1}
            perspective={perspective}
            partyName={partyName}
          />
        ))}
      </div>
    </div>
  );
}
