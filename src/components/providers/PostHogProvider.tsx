"use client";

import posthog from "posthog-js";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

/**
 * PostHog product analytics.
 *
 * - No-ops entirely if NEXT_PUBLIC_POSTHOG_KEY is unset, so the app works
 *   before analytics is configured.
 * - Captures pageviews manually on App Router route changes (PostHog's
 *   automatic pageview tracking misses client-side SPA navigations).
 * - Identifies signed-in users by Clerk ID so funnels/drop-off can be
 *   followed per person; resets on sign-out.
 *
 * Required env (client-side, not secret):
 *   NEXT_PUBLIC_POSTHOG_KEY   — project API key from posthog.com
 *   NEXT_PUBLIC_POSTHOG_HOST  — e.g. https://us.i.posthog.com (default) or eu
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let started = false;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  // Initialize once on first mount.
  useEffect(() => {
    if (!KEY || started) return;
    posthog.init(KEY, {
      api_host: HOST,
      capture_pageview: false, // captured manually below for App Router
      capture_pageleave: true,
      person_profiles: "identified_only",
    });
    started = true;
  }, []);

  // Capture a pageview on every route change.
  useEffect(() => {
    if (!KEY || !started) return;
    posthog.capture("$pageview", { $current_url: window.location.href });
  }, [pathname]);

  // Tie events to the signed-in user (or reset when signed out).
  useEffect(() => {
    if (!KEY || !started || !isLoaded) return;
    if (user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
      });
    } else {
      posthog.reset();
    }
  }, [isLoaded, user?.id]);

  return <>{children}</>;
}
