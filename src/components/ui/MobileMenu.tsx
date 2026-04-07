"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useTranslation } from "@/lib/i18n";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { t } = useTranslation();

  const NAV_LINKS = [
    { label: t("landing.features"), href: "#features" },
    { label: t("landing.howItWorks"), href: "#how-it-works" },
    { label: t("landing.pricing"), href: "#pricing" },
  ];

  return (
    <>
      {/* Hamburger button — only visible on mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex flex-col gap-1 p-2 rounded-lg hover:bg-surface-container-high transition-colors"
        aria-label="Toggle menu"
      >
        <span className={`block w-5 h-0.5 bg-on-surface transition-all ${open ? "rotate-45 translate-y-1.5" : ""}`} />
        <span className={`block w-5 h-0.5 bg-on-surface transition-all ${open ? "opacity-0" : ""}`} />
        <span className={`block w-5 h-0.5 bg-on-surface transition-all ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-on-surface/20 md:hidden" onClick={() => setOpen(false)} />

          {/* Menu panel */}
          <div className="fixed top-[73px] left-0 right-0 z-50 md:hidden bg-surface border-b border-outline-variant/15 shadow-xl">
            <div className="px-6 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-outline-variant/15 my-2" />
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-bold text-center bg-inverse-surface text-inverse-on-surface hover:opacity-90 transition-all font-headline"
                >
                  {t("landing.dashboard")}
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all"
                  >
                    {t("landing.signIn")}
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-bold text-center bg-inverse-surface text-inverse-on-surface hover:opacity-90 transition-all font-headline"
                  >
                    {t("landing.getStartedFree")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
