/** Locale mapping for Intl.DateTimeFormat */
export const DATE_LOCALES: Record<string, string> = {
  en: "en-US",
  ko: "ko-KR",
  ja: "ja-JP",
  zh: "zh-CN",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-BR",
};

/** Format ISO date string to localized short date */
export function formatDate(iso: string, locale = "en"): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALES[locale] || "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
