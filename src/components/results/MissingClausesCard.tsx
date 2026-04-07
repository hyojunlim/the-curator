import type { MissingClause } from "@/types";
import { t } from "@/lib/i18n";

interface Props {
  clauses: MissingClause[];
  language?: string;
}

export default function MissingClausesCard({ clauses, language }: Props) {
  const lang = language || "English";
  if (!clauses || clauses.length === 0) return null;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-error-container rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-on-error-container text-[18px]">report</span>
        </div>
        <div>
          <h3 className="font-headline font-bold text-on-surface">{t(lang, "missingClauses")}</h3>
          <p className="text-xs text-on-surface-variant">{t(lang, "missingClausesDesc")}</p>
        </div>
      </div>
      <div className="space-y-2">
        {clauses.map((c, i) => (
          <div key={i} className={`rounded-lg p-3 border-l-4 ${c.importance === "high" ? "border-l-error bg-error-container/10" : "border-l-secondary bg-surface-container-low"}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                {c.importance === "high" ? "warning" : "info"}
              </span>
              <span className="text-sm font-semibold text-on-surface">{c.title}</span>
              {c.importance === "high" && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-error">{t(lang, "important")}</span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed ml-[22px]">{c.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
