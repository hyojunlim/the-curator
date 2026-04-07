"use client";

import { useTranslation } from "@/lib/i18n";

export default function AppFooter({ sidebarOffset = true }: { sidebarOffset?: boolean }) {
  const { t } = useTranslation();

  return (
    <div
      className={`fixed bottom-0 right-0 bg-surface border-t border-outline-variant/10 px-4 lg:px-8 py-3 flex items-center justify-between text-xs text-on-surface-variant z-30 ${
        sidebarOffset ? "left-0 lg:left-64" : "left-0"
      }`}
    >
      <div className="flex gap-2 lg:gap-4 flex-wrap">
        <a href="/legal/privacy" className="hover:text-primary transition-colors">{t("footer.privacy")}</a>
        <a href="/legal/terms" className="hover:text-primary transition-colors">{t("footer.terms")}</a>
        <a href="/legal/security" className="hover:text-primary transition-colors hidden sm:inline">{t("footer.security")}</a>
        <a href="/legal/api" className="hover:text-primary transition-colors hidden sm:inline">{t("footer.apiDocs")}</a>
      </div>
      <span className="hidden sm:inline">&copy; {new Date().getFullYear()} {t("common.copyright")}</span>
    </div>
  );
}
