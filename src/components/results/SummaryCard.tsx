import { t } from "@/lib/i18n";

interface Props {
  summary: string;
  language?: string;
}

export default function SummaryCard({ summary, language }: Props) {
  const lang = language || "English";
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-primary-fixed rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[18px]">summarize</span>
        </div>
        <h3 className="font-headline font-bold text-on-surface">{t(lang, "summary")}</h3>
      </div>
      <p className="text-base text-on-surface-variant leading-relaxed">{summary}</p>
    </div>
  );
}
