import { t } from "@/lib/i18n";

interface Props {
  score: number;
  summary: string;
  partyAName?: string;
  partyBName?: string;
  language?: string;
}

export default function FairnessCard({ score, summary, partyAName = "Party A", partyBName = "Party B", language }: Props) {
  const lang = language || "English";
  if (!summary) return null;

  // score: 0 = favors B entirely, 50 = balanced, 100 = favors A entirely
  const deviation = Math.abs(score - 50);
  const label = deviation <= 10 ? t(lang, "wellBalanced") : deviation <= 25 ? t(lang, "slightlyUnbalanced") : t(lang, "significantlyUnbalanced");
  const color = deviation <= 10 ? "text-primary" : deviation <= 25 ? "text-secondary" : "text-error";
  const bgColor = deviation <= 10 ? "bg-primary" : deviation <= 25 ? "bg-secondary" : "bg-error";

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-primary-fixed rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[18px]">balance</span>
        </div>
        <div>
          <h3 className="font-headline font-bold text-on-surface">{t(lang, "fairness")}</h3>
          <span className={`text-xs font-bold ${color}`}>{label}</span>
        </div>
      </div>

      {/* Balance meter */}
      <div className="mb-4">
        <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant mb-1.5">
          <span>{partyBName}</span>
          <span>{t(lang, "balanced")}</span>
          <span>{partyAName}</span>
        </div>
        <div className="relative h-3 bg-surface-container-high rounded-full overflow-hidden">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-on-surface-variant/30 z-10" />
          {/* Score indicator */}
          <div
            className={`absolute top-0 h-full w-3 rounded-full ${bgColor} transition-all shadow-sm`}
            style={{ left: `calc(${score}% - 6px)` }}
          />
        </div>
      </div>

      <p className="text-xs text-on-surface-variant leading-relaxed">{summary}</p>
    </div>
  );
}
