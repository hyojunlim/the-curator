import posthog from "posthog-js";

/**
 * Fire a custom product-analytics event. Safe to call anywhere in client
 * code: no-ops on the server, and when PostHog isn't configured/initialized.
 */
export function track(event: string, props?: Record<string, unknown>): void {
  try {
    if (typeof window === "undefined") return;
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    posthog.capture(event, props);
  } catch {
    // analytics must never break the app
  }
}
