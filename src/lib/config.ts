/**
 * Central configuration for The Curator.
 * All tunable values in one place.
 */

// ── Subscription Plans ──
export type PlanType = "free" | "pro" | "business";

export const FREE_ANALYSIS_LIMIT = parseInt(process.env.FREE_ANALYSIS_LIMIT || "5", 10);
export const PRO_ANALYSIS_LIMIT = parseInt(process.env.PRO_ANALYSIS_LIMIT || "30", 10);

export const PRO_PRICE_USD = process.env.PRO_PRICE_USD || "29.00";
export const BUSINESS_PRICE_USD = process.env.BUSINESS_PRICE_USD || "79.00";

export const PRO_PLAN_NAME = "The Curator Pro — Monthly Subscription";
export const BUSINESS_PLAN_NAME = "The Curator Business — Monthly Subscription";
export const BRAND_NAME = "The Curator";

// ── Rate Limiting ──
export const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || String(60 * 60 * 1000), 10); // 1 hour
export const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "20", 10);

// ── File Upload ──
export const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10);
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ── AI Processing ──
export const MAX_WORD_COUNT = parseInt(process.env.MAX_WORD_COUNT || "15000", 10);

// ── Languages ──
export const ALLOWED_LANGUAGES: string[] = [
  "English", "Korean", "Spanish", "French",
  "Japanese", "Chinese", "German", "Portuguese",
];

// Free users only get these languages
export const FREE_LANGUAGES: string[] = ["English", "Korean"];

// ── History ──
export const FREE_HISTORY_DAYS = 7;

// ── Plan feature matrix ──
export const PLAN_FEATURES = {
  free: {
    analysisLimit: FREE_ANALYSIS_LIMIT,
    languages: FREE_LANGUAGES,
    historyDays: FREE_HISTORY_DAYS,
    search: false,
    pdfExport: false,
    priorityProcessing: false,
  },
  pro: {
    analysisLimit: PRO_ANALYSIS_LIMIT,
    languages: ALLOWED_LANGUAGES,
    historyDays: 90,
    search: true,
    pdfExport: true,
    priorityProcessing: false,
  },
  business: {
    analysisLimit: null, // unlimited
    languages: ALLOWED_LANGUAGES,
    historyDays: null, // unlimited
    search: true,
    pdfExport: true,
    priorityProcessing: true,
  },
} as const;
