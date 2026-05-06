"use client";

import { useLanguage } from "./LanguageContext";
import en from "./locales/en";
import ko from "./locales/ko";
import ja from "./locales/ja";
import zh from "./locales/zh";
import es from "./locales/es";
import fr from "./locales/fr";
import de from "./locales/de";
import pt from "./locales/pt";

type LocaleData = typeof en;
const locales: Record<string, LocaleData> = { en, ko, ja, zh, es, fr, de, pt };

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => {
    if (o && typeof o === "object" && k in (o as Record<string, unknown>)) {
      return (o as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

export function useTranslation() {
  const { locale, language, setLanguage } = useLanguage();

  const t = (key: string, params?: Record<string, string | number>): string => {
    const raw =
      getNestedValue(locales[locale] as unknown as Record<string, unknown>, key) ??
      getNestedValue(locales.en as unknown as Record<string, unknown>, key);

    // Return arrays/objects as-is for callers that expect them (e.g. features lists)
    if (raw !== undefined && typeof raw !== "string") {
      return raw as unknown as string;
    }

    let value = (raw as string) || key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }

    return value;
  };

  return { t, locale, language, setLanguage };
}
