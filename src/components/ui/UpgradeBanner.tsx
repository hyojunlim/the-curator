"use client";

import { useState } from "react";
import PayPalButton from "./PayPalButton";

interface UpgradeBannerProps {
  remaining: number;
  limit: number;
  plan: string;
  onUpgraded?: () => void;
}

const UPGRADE_INFO = {
  free: {
    nextPlan: "pro" as const,
    label: "Pro",
    price: "$29/mo",
    features: [
      "30 contract analyses per month",
      "All 8 output languages",
      "90-day history & search",
      "PDF export & sharing",
    ],
  },
  pro: {
    nextPlan: "business" as const,
    label: "Business",
    price: "$79/mo",
    features: [
      "Unlimited contract analyses",
      "Priority AI processing",
      "Unlimited history",
      "Everything in Pro",
    ],
  },
};

export default function UpgradeBanner({ remaining, limit, plan, onUpgraded }: UpgradeBannerProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  if (plan === "business" || upgraded) return null;

  const info = UPGRADE_INFO[plan as keyof typeof UPGRADE_INFO] ?? UPGRADE_INFO.free;
  const pct = Math.round(((limit - remaining) / limit) * 100);
  const isLow = remaining <= 2;
  const isOut = remaining === 0;

  function handleSuccess() {
    setUpgraded(true);
    setShowCheckout(false);
    onUpgraded?.();
  }

  return (
    <div className={`rounded-xl p-5 shadow-sm border ${
      isOut
        ? "bg-error-container/20 border-error/20"
        : isLow
          ? "bg-tertiary-container/20 border-tertiary/20"
          : "bg-primary-container/20 border-primary/20"
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`material-symbols-outlined text-[18px] ${isOut ? "text-error" : isLow ? "text-tertiary" : "text-primary"}`}>
              {isOut ? "error" : isLow ? "warning" : "info"}
            </span>
            <p className="font-headline font-bold text-sm text-on-surface">
              {isOut
                ? "Monthly Limit Reached"
                : isLow
                  ? `Only ${remaining} analysis${remaining === 1 ? "" : "es"} left`
                  : `${remaining} of ${limit} analyses remaining`}
            </p>
          </div>
          <p className="text-xs text-on-surface-variant mb-3">
            Upgrade to {info.label} for {info.price}.
          </p>

          {/* Usage bar */}
          <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all ${isOut ? "bg-error" : isLow ? "bg-tertiary" : "bg-primary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] text-on-surface-variant">
            {limit - remaining} of {limit} used this month
          </p>
        </div>

        {!showCheckout && (
          <button
            onClick={() => setShowCheckout(true)}
            className="shrink-0 btn-primary-gradient text-white px-5 py-2 rounded-lg font-headline font-bold text-xs hover:opacity-90 transition-all shadow-md"
          >
            Upgrade to {info.label}
          </button>
        )}
      </div>

      {showCheckout && (
        <div className="mt-4 pt-4 border-t border-outline-variant/15">
          <div className="flex items-center justify-between mb-3">
            <p className="font-headline font-bold text-sm text-on-surface">Upgrade to {info.label} — {info.price}</p>
            <button
              onClick={() => setShowCheckout(false)}
              className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
          </div>
          <ul className="text-xs text-on-surface-variant space-y-1 mb-4">
            {info.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[14px]">check</span>
                {f}
              </li>
            ))}
          </ul>
          <PayPalButton plan={info.nextPlan} onSuccess={handleSuccess} />
        </div>
      )}
    </div>
  );
}
