import type { KeyDate } from "@/types";
import { t } from "@/lib/i18n";

interface Props {
  dates: KeyDate[];
  language?: string;
}

export default function KeyDatesCard({ dates, language }: Props) {
  const lang = language || "English";
  if (!dates || dates.length === 0) return null;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-tertiary-fixed rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-tertiary text-[18px]">calendar_month</span>
        </div>
        <h3 className="font-headline font-bold text-on-surface">{t(lang, "keyDates")}</h3>
      </div>
      <div className="space-y-3">
        {dates.map((d, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${d.importance === "critical" ? "bg-primary" : "bg-on-surface-variant/30"}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold text-on-surface">{d.label}</span>
                {d.importance === "critical" && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">{t(lang, "important")}</span>
                )}
              </div>
              <p className="text-sm text-on-surface-variant mt-0.5">{d.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
