export const PREDEFINED_TAGS = [
  { label: "NDA",               color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { label: "Employment",        color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { label: "SaaS",              color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  { label: "Service Agreement", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  { label: "Partnership",       color: "bg-teal-500/10 text-teal-600 border-teal-500/20" },
  { label: "Real Estate",       color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { label: "Vendor",            color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { label: "IP",                color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  { label: "Finance",           color: "bg-green-500/10 text-green-600 border-green-500/20" },
  { label: "Other",             color: "bg-on-surface/5 text-on-surface-variant border-outline-variant/30" },
];

export function getTagColor(label: string): string {
  return PREDEFINED_TAGS.find((t) => t.label === label)?.color
    ?? "bg-on-surface/5 text-on-surface-variant border-outline-variant/30";
}
