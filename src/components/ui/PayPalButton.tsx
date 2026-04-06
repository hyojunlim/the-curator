"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface PayPalButtonProps {
  plan?: "pro" | "business";
  onSuccess: () => void;
  onError?: (msg: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Manually load the PayPal SDK script to avoid the querySelector    */
/*  bug in @paypal/paypal-js when the client-id contains special      */
/*  characters.                                                       */
/* ------------------------------------------------------------------ */

const PAYPAL_SDK_NAMESPACE = "__paypal_sdk__";
let sdkPromise: Promise<void> | null = null;

function loadPayPalSDK(clientId: string): Promise<void> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    // Already loaded?
    if ((window as unknown as Record<string, unknown>).paypal) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&locale=en_US`;
    script.id = PAYPAL_SDK_NAMESPACE;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Failed to load PayPal SDK"));
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}

export default function PayPalButton({ plan = "pro", onSuccess, onError }: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const renderedRef = useRef(false);

  const stableOnSuccess = useCallback(onSuccess, [onSuccess]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        if (!clientId) {
          setError("PayPal is not configured.");
          setLoading(false);
          return;
        }

        await loadPayPalSDK(clientId);

        if (cancelled || !containerRef.current) return;

        const paypal = (window as unknown as Record<string, unknown>).paypal as {
          Buttons: (opts: Record<string, unknown>) => { render: (el: HTMLElement) => void };
        } | undefined;

        if (!paypal) {
          setError("PayPal SDK failed to initialize.");
          setLoading(false);
          return;
        }

        // Prevent double render
        if (renderedRef.current) return;
        renderedRef.current = true;
        containerRef.current.innerHTML = "";

        paypal.Buttons({
          style: {
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "pay",
            height: 45,
          },
          createOrder: async () => {
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plan }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create order");
            return data.id;
          },
          onApprove: async (data: { orderID: string }) => {
            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Payment capture failed");
            stableOnSuccess();
          },
          onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : "Payment failed";
            setError(msg);
            onError?.(msg);
          },
        }).render(containerRef.current);

        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load PayPal";
          setError(msg);
          setLoading(false);
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [plan, stableOnSuccess, onError]);

  if (error) {
    return (
      <div className="text-sm text-error bg-error-container/20 rounded-lg p-4 text-center">
        {error}
      </div>
    );
  }

  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center py-4 gap-2 text-sm text-on-surface-variant">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading PayPal...
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}
