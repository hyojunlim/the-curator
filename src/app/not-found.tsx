"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface font-body text-on-surface px-8">
      <div className="max-w-md text-center">
        <p className="text-8xl font-headline font-black text-on-surface/10 mb-4">404</p>
        <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-3">
          {t("common.pageNotFound")}
        </h1>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
          {t("common.pageNotFoundDesc")}
        </p>
        <Link
          href="/"
          className="btn-primary-gradient text-white px-6 py-3 rounded-xl font-headline font-bold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          {t("common.backToHome")}
        </Link>
      </div>
    </div>
  );
}
