import type { ActionItem } from "@/types";
import { t } from "@/lib/i18n";

interface Props {
  items: ActionItem[];
  language?: string;
}

export default function ActionItemsCard({ items, language }: Props) {
  const lang = language || "English";
  if (!items || items.length === 0) return null;

  const priorityConfig = {
    high: { color: "text-error", bg: "bg-error-container", icon: "priority_high" },
    medium: { color: "text-secondary", bg: "bg-tertiary-fixed", icon: "drag_handle" },
    low: { color: "text-on-surface-variant", bg: "bg-surface-container-high", icon: "remove" },
  };

  // Sort by priority
  const sorted = [...items].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-primary-fixed rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[18px]">checklist</span>
        </div>
        <div>
          <h3 className="font-headline font-bold text-on-surface">{t(lang, "actionItems")}</h3>
          <p className="text-xs text-on-surface-variant">{t(lang, "actionItemsDesc")}</p>
        </div>
      </div>
      <div className="space-y-2">
        {sorted.map((item, i) => {
          const config = priorityConfig[item.priority] ?? priorityConfig.medium;
          return (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-surface-container-low p-3">
              <span className={`material-symbols-outlined text-[16px] mt-0.5 ${config.color}`}>
                {config.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-on-surface leading-relaxed">{item.action}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">person</span>
                    {item.party}
                  </span>
                  {item.deadline && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {item.deadline}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
