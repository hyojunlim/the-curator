"use client";

import { useState } from "react";
import PaddleCheckout from "./PaddleCheckout";
import { useTranslation } from "@/lib/i18n";

interface UpgradeBannerProps {
  remaining: number;
  limit: number;
  plan: string;
  onUpgraded?: () => void;
}

const UPGRADE_MAP = {
  free: { nextPlan: "pro" as const, labelKey: "proLabel", priceKey: "proPrice", featuresKey: "proFeatures" },
  pro: { nextPlan: "business" as const, labelKey: "businessLabel", priceKey: "businessPrice", featuresKey: "businessFeatures" },
};

export default function UpgradeBanner({ remaining, limit, plan, onUpgraded }: UpgradeBannerProps) {
  const { t } = useTranslation();
  const [showCheckout, setShowCheckout] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  if (plan === "business" || upgraded) return null;

  const map = UPGRADE_MAP[plan as keyof typeof UPGRADE_MAP] ?? UPGRADE_MAP.free;
  const infoLabel = t(`upgradeBanner.${map.labelKey}`);
  const infoPrice = t(`upgradeBanner.${map.priceKey}`);
  const infoFeatures = t(`upgradeBanner.${map.featuresKey}`) as unknown as string[];
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
                ? t("upgradeBanner.monthlyLimitReached")
                : isLow
                  ? remaining === 1
                    ? t("upgradeBanner.analysesLeft", { remaining })
                    : t("upgradeBanner.analysesLeftPlural", { remaining })
                  : t("upgradeBanner.analysesRemaining", { remaining, limit })}
            </p>
          </div>
          <p className="text-xs text-on-surface-variant mb-3">
            {t("upgradeBanner.upgradeTo", { plan: infoLabel, price: infoPrice })}
          </p>

          {/* Usage bar */}
          <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all ${isOut ? "bg-error" : isLow ? "bg-tertiary" : "bg-primary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-on-surface-variant">
            {t("upgradeBanner.usedThisMonth", { used: limit - remaining, limit })}
          </p>
        </div>

        {!showCheckout && (
          <button
            onClick={() => setShowCheckout(true)}
            className="shrink-0 btn-primary-gradient text-white px-5 py-2 rounded-lg font-headline font-bold text-xs hover:opacity-90 transition-all shadow-md"
          >
            {t("upgradeBanner.upgradeButton", { plan: infoLabel })}
          </button>
        )}
      </div>

      {showCheckout && (
        <div className="mt-4 pt-4 border-t border-outline-variant/15">
          <div className="flex items-center justify-between mb-3">
            <p className="font-headline font-bold text-sm text-on-surface">{t("upgradeBanner.upgradeCheckoutTitle", { plan: infoLabel, price: infoPrice })}</p>
            <button
              onClick={() => setShowCheckout(false)}
              className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {t("upgradeBanner.cancelCheckout")}
            </button>
          </div>
          <ul className="text-xs text-on-surface-variant space-y-1 mb-4">
            {infoFeatures.map((f: string) => (
              <li key={f} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[14px]">check</span>
                {f}
              </li>
            ))}
          </ul>
          <PaddleCheckout plan={map.nextPlan} />
        </div>
      )}
    </div>
  );
}
