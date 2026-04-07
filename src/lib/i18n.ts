export { LanguageProvider, useLanguage } from "./i18n/LanguageContext";
export { useTranslation } from "./i18n/useTranslation";

import en from "./i18n/locales/en";
import ko from "./i18n/locales/ko";
import ja from "./i18n/locales/ja";
import zh from "./i18n/locales/zh";
import es from "./i18n/locales/es";
import fr from "./i18n/locales/fr";
import de from "./i18n/locales/de";
import pt from "./i18n/locales/pt";

const locales: Record<string, any> = { en, ko, ja, zh, es, fr, de, pt };

const langMap: Record<string, string> = {
  English: "en",
  Korean: "ko",
  Spanish: "es",
  French: "fr",
  Japanese: "ja",
  Chinese: "zh",
  German: "de",
  Portuguese: "pt",
};

/** Legacy t() function for results components — reads from locale.results namespace */
export function t(language: string, key: string): string {
  const locale = langMap[language] || "en";
  return (locales[locale]?.results as any)?.[key]
    || (locales.en.results as any)?.[key]
    || key;
}

export function getLocale(language: string): string {
  return langMap[language] || "en";
}
