"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import ThemeToggle from "@/components/ui/ThemeToggle";
import MobileMenu from "@/components/ui/MobileMenu";

export default function LandingNav() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-5 border-b border-outline-variant/15 bg-surface/80 backdrop-blur-xl">
      <div className="flex items-center gap-10">
        <span className="text-xl font-black tracking-tighter font-headline text-on-surface">
          The Curator
        </span>
        <div className="hidden md:flex items-center gap-7">
          <a href="#features" className="text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors">Features</a>
          <a href="#how-it-works" className="text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors">How It Works</a>
          <a href="#pricing" className="text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors">Pricing</a>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {isLoaded && isSignedIn ? (
          <Link
            href="/dashboard"
            className="hidden md:inline-flex items-center gap-2 bg-inverse-surface text-inverse-on-surface px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-all font-headline"
          >
            <span className="material-symbols-outlined text-[16px]">dashboard</span>
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/sign-in" className="hidden md:inline text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors px-2">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="hidden md:inline-flex bg-inverse-surface text-inverse-on-surface px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-all font-headline"
            >
              Get Started Free
            </Link>
          </>
        )}
        <MobileMenu />
      </div>
    </nav>
  );
}
