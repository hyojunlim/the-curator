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

const locales: Record<string, any> = { en, ko, ja, zh, es, fr, de, pt };

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

export function useTranslation() {
  const { locale, language, setLanguage } = useLanguage();

  const t = (key: string, params?: Record<string, string | number>): string => {
    let value =
      getNestedValue(locales[locale], key) ||
      getNestedValue(locales.en, key) ||
      key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }

    return value;
  };

  return { t, locale, language, setLanguage };
}
