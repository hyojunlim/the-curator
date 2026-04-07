"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import AppFooter from "@/components/layout/AppFooter";
import { useTranslation } from "@/lib/i18n";

export default function SignInPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <div className="flex-1 flex items-center justify-center pb-16">
        <div className="w-full max-w-md px-4">
          <Link href="/" className="block text-center mb-8 group">
            <h1 className="font-headline font-extrabold text-3xl text-primary tracking-tighter group-hover:opacity-80 transition-opacity">The Curator</h1>
            <p className="text-sm text-on-surface-variant mt-1">{t("common.tagline")}</p>
          </Link>
          <div className="flex justify-center">
            <SignIn routing="path" path="/sign-in" />
          </div>
          <p className="text-center text-xs text-on-surface-variant mt-6">
            {t("auth.dontHaveAccount")}{" "}
            <Link href="/sign-up" className="text-primary font-medium hover:underline">{t("auth.signUp")}</Link>
          </p>
        </div>
      </div>
      <AppFooter sidebarOffset={false} />
    </div>
  );
}
