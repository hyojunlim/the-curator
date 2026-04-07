"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

const LANGUAGES = [
  { code: "en", flag: "\u{1F1FA}\u{1F1F8}", name: "English", label: "English" },
  { code: "ko", flag: "\u{1F1F0}\u{1F1F7}", name: "\uD55C\uAD6D\uC5B4", label: "Korean" },
  { code: "es", flag: "\u{1F1EA}\u{1F1F8}", name: "Espa\u00F1ol", label: "Spanish" },
  { code: "fr", flag: "\u{1F1EB}\u{1F1F7}", name: "Fran\u00E7ais", label: "French" },
  { code: "ja", flag: "\u{1F1EF}\u{1F1F5}", name: "\u65E5\u672C\u8A9E", label: "Japanese" },
  { code: "zh", flag: "\u{1F1E8}\u{1F1F3}", name: "\u4E2D\u6587", label: "Chinese" },
  { code: "de", flag: "\u{1F1E9}\u{1F1EA}", name: "Deutsch", label: "German" },
  { code: "pt", flag: "\u{1F1E7}\u{1F1F7}", name: "Portugu\u00EAs", label: "Portuguese" },
] as const;

// Map locale code -> LANG_MAP label (used by setLanguage)
const CODE_TO_LABEL: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.label])
);

export default function LanguageSwitcher({ dropUp = true }: { dropUp?: boolean } = {}) {
  const { locale, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  function handleSelect(code: string) {
    const label = CODE_TO_LABEL[code];
    if (label) setLanguage(label);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/20 bg-surface-container text-sm hover:bg-surface-container-high transition-all"
        aria-label="Change language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-xs font-bold text-on-surface-variant uppercase">{current.code}</span>
        <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && (
        <div className={`absolute ${dropUp ? "bottom-full mb-1" : "top-full mt-1"} left-0 w-48 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-lg overflow-hidden z-50`}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                locale === lang.code
                  ? "bg-primary/8 text-primary font-semibold"
                  : "text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.name}</span>
              {locale === lang.code && (
                <span className="material-symbols-outlined text-[16px] text-primary">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
