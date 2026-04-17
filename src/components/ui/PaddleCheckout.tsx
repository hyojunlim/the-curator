"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

interface PaddleCheckoutProps {
  plan: "pro" | "business";
}

export default function PaddleCheckout({ plan }: PaddleCheckoutProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/paddle/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setError("Server error. Please try again.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.details || data.error || "Failed to create checkout");
        setLoading(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError("No checkout URL received");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="text-sm text-error bg-error-container/20 rounded-lg p-4 text-center">
        {error}
        <button
          onClick={() => { setError(""); handleCheckout(); }}
          className="ml-2 underline hover:no-underline font-bold"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full btn-primary-gradient text-white font-headline font-bold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t("common.processing")}
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-[18px]">credit_card</span>
          {t("common.subscribe")}
        </>
      )}
    </button>
  );
}
