"use client";

import { useState, useRef } from "react";
import { PREDEFINED_TAGS, getTagColor } from "@/lib/tags";

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
  readonly?: boolean;
}

export default function TagSelector({ tags, onChange, readonly = false }: Props) {
  const [saving, setSaving] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function toggle(label: string) {
    if (readonly || saving) return;
    setSaving(true);
    const next = tags.includes(label) ? tags.filter((t) => t !== label) : [...tags, label];
    onChange(next);
    setSaving(false);
  }

  function addCustom() {
    const trimmed = customLabel.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setCustomLabel("");
    setShowInput(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); addCustom(); }
    if (e.key === "Escape") { setShowInput(false); setCustomLabel(""); }
  }

  // Separate custom tags (not in predefined list)
  const predefinedLabels = PREDEFINED_TAGS.map((t) => t.label);
  const customTags = tags.filter((t) => !predefinedLabels.includes(t));

  return (
    <div className="flex flex-wrap gap-2">
      {/* Predefined tags */}
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

      {/* Custom tags */}
      {customTags.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => toggle(label)}
          disabled={readonly}
          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${getTagColor(label)} ${readonly ? "cursor-default" : "cursor-pointer"} inline-flex items-center gap-1`}
        >
          {label}
          {!readonly && (
            <span className="material-symbols-outlined text-[12px] opacity-60">close</span>
          )}
        </button>
      ))}

      {/* Add custom tag button / input */}
      {!readonly && (
        showInput ? (
          <div className="inline-flex items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value.slice(0, 30))}
              onKeyDown={handleKeyDown}
              onBlur={() => { if (!customLabel.trim()) setShowInput(false); }}
              placeholder="Label..."
              autoFocus
              className="text-xs px-2 py-1 rounded-lg border border-primary/30 bg-primary/5 text-on-surface outline-none w-24 focus:border-primary/60"
            />
            <button
              onClick={addCustom}
              className="text-xs px-1.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">check</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="text-xs px-2.5 py-1 rounded-lg border border-dashed border-outline-variant/30 text-on-surface-variant/50 hover:border-primary/40 hover:text-primary transition-all inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Custom
          </button>
        )
      )}
    </div>
  );
}
