"use client";

import Link from "next/link";
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
        <Link href="/legal/privacy" className="hover:text-primary transition-colors">{t("footer.privacy")}</Link>
        <Link href="/legal/terms" className="hover:text-primary transition-colors">{t("footer.terms")}</Link>
        <Link href="/legal/refund" className="hover:text-primary transition-colors">{t("footer.refund")}</Link>
        <Link href="/legal/security" className="hover:text-primary transition-colors hidden sm:inline">{t("footer.security")}</Link>
        <Link href="/legal/api" className="hover:text-primary transition-colors hidden sm:inline">{t("footer.apiDocs")}</Link>
      </div>
      <span className="hidden sm:inline">&copy; {new Date().getFullYear()} {t("common.copyright")}</span>
    </div>
  );
}
