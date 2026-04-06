interface Props {
  summary: string;
}

export default function SummaryCard({ summary }: Props) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-primary-fixed rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[18px]">summarize</span>
        </div>
        <h3 className="font-headline font-bold text-on-surface">Plain-English Summary</h3>
      </div>
      <p className="text-sm text-on-surface-variant leading-relaxed">{summary}</p>
    </div>
  );
}
