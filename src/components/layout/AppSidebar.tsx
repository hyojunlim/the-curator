"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import ThemeToggle from "@/components/ui/ThemeToggle";
import SearchPalette from "@/components/ui/SearchPalette";
import { useSubscription } from "@/hooks/useSubscription";

const navItems = [
  { label: "Overview", icon: "dashboard", href: "/dashboard" },
  { label: "Contracts", icon: "inventory_2", href: "/history" },
  { label: "Starred", icon: "star", href: "/starred" },
  { label: "Analytics", icon: "bar_chart", href: "/analytics" },
];

const bottomItems = [
  { label: "Support", icon: "help", href: "/legal/api" },
  { label: "Settings", icon: "settings", href: "/settings" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { sub } = useSubscription();
  const isPaid = sub?.plan === "pro" || sub?.plan === "business";

  function isActive(href: string) {
    if (href === "/history") return pathname.startsWith("/history") || pathname.startsWith("/contracts/");
    return pathname === href || pathname.startsWith(href + "/");
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-2 pt-2 flex items-center justify-between">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <h1 className="font-headline font-extrabold text-primary text-2xl tracking-tighter hover:opacity-80 transition-opacity">
            The Curator
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 mt-0.5">
            Legal Intelligence
          </p>
        </Link>
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
        </button>
      </div>

      {/* New Analysis Button */}
      <Link
        href="/analyze"
        onClick={() => setMobileOpen(false)}
        className="flex items-center justify-center gap-2 mx-2 py-2.5 rounded-xl btn-primary-gradient text-white font-headline font-bold text-sm hover:opacity-90 transition-all shadow-md"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        New Analysis
      </Link>

      {/* Search shortcut button */}
      {isPaid ? (
        <>
          <button
            onClick={() => {
              setMobileOpen(false);
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
            }}
            className="flex items-center gap-2 mx-2 px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant text-xs hover:bg-surface-container-high hover:text-on-surface transition-all border border-outline-variant/15"
          >
            <span className="material-symbols-outlined text-[16px]">search</span>
            <span className="flex-1 text-left">Search contracts</span>
            <kbd className="text-[10px] px-1 py-0.5 rounded border border-outline-variant/20 font-mono">Ctrl+K</kbd>
          </button>
          <SearchPalette />
        </>
      ) : (
        <div className="flex items-center gap-2 mx-2 px-3 py-2 rounded-lg bg-surface-container-high/30 text-on-surface-variant/40 text-xs border border-outline-variant/10 cursor-not-allowed">
          <span className="material-symbols-outlined text-[16px]">search</span>
          <span className="flex-1 text-left">Search contracts</span>
          <span className="material-symbols-outlined text-[12px]">lock</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center px-4 py-3 rounded-lg transition-all text-sm ${
              isActive(item.href)
                ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                : "text-on-surface-variant hover:translate-x-1"
            }`}
          >
            <span className="material-symbols-outlined mr-3 text-[20px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="space-y-1 border-t border-outline-variant/10 pt-4">
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all text-sm ${
              isActive(item.href)
                ? "bg-surface-container-lowest text-primary font-semibold"
                : "text-on-surface-variant hover:translate-x-1"
            }`}
          >
            <span className="material-symbols-outlined mr-3 text-[20px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        {/* User + Theme toggle */}
        <div className="flex items-center gap-3 px-4 py-3 mt-2 border-t border-outline-variant/10">
          <UserButton />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-on-surface truncate">{user?.fullName ?? user?.emailAddresses?.[0]?.emailAddress ?? "Account"}</p>
            <p className="text-[10px] text-on-surface-variant truncate">{user?.emailAddresses?.[0]?.emailAddress ?? ""}</p>
          </div>
          <ThemeToggle />
        </div>
        {/* Sign Out */}
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center gap-2 mx-2 px-4 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-error/10 hover:text-error transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center shadow-md border border-outline-variant/15"
      >
        <span className="material-symbols-outlined text-on-surface">menu</span>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-on-surface/40 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop: always visible, mobile: slide in */}
      <aside
        className={`h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col p-4 space-y-6 z-50 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
