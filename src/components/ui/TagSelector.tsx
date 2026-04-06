"use client";

import { useState } from "react";
import { PREDEFINED_TAGS } from "@/lib/tags";

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
  readonly?: boolean;
}

export default function TagSelector({ tags, onChange, readonly = false }: Props) {
  const [saving, setSaving] = useState(false);

  async function toggle(label: string) {
    if (readonly || saving) return;
    setSaving(true);
    const next = tags.includes(label) ? tags.filter((t) => t !== label) : [...tags, label];
    onChange(next);
    setSaving(false);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {PREDEFINED_TAGS.map(({ label, color }) => {
        const active = tags.includes(label);
        return (
          <button
            key={label}
            type="button"
            onClick={() => toggle(label)}
            disabled={readonly}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
              active
                ? color
                : "bg-transparent text-on-surface-variant/50 border-outline-variant/20 hover:border-outline-variant/50 hover:text-on-surface-variant"
            } ${readonly ? "cursor-default" : "cursor-pointer"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
