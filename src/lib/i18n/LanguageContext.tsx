"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

const LANG_MAP: Record<string, string> = {
  English: "en",
  Korean: "ko",
  Spanish: "es",
  French: "fr",
  Japanese: "ja",
  Chinese: "zh",
  German: "de",
  Portuguese: "pt",
};

interface LanguageContextType {
  language: string;
  locale: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "English",
  locale: "en",
  setLanguage: () => {},
});

const STORAGE_KEY = "curator-ui-language";
const CHANGE_EVENT = "curator-ui-language-change";

function getInitialLanguage(): string {
  if (typeof window === "undefined") return "English";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANG_MAP[stored]) return stored;
  } catch {}
  return "English";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(getInitialLanguage);

  const locale = LANG_MAP[language] || "en";

  const setLanguage = useCallback((lang: string) => {
    if (!LANG_MAP[lang]) return;
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      // Update html lang attribute for SEO & accessibility
      document.documentElement.lang = LANG_MAP[lang] || "en";
    } catch {}
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: lang }));
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const lang = (e as CustomEvent).detail;
      if (lang && LANG_MAP[lang]) {
        setLanguageState(lang);
      }
    };
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, locale, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
