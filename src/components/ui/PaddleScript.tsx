"use client";

import { useEffect } from "react";

/**
 * Loads Paddle.js and initializes it.
 * When Paddle detects ?_ptxn= in the URL, it auto-opens the checkout overlay.
 */
export default function PaddleScript() {
  useEffect(() => {
    // Don't load twice
    if (document.getElementById("paddle-js")) return;

    const script = document.createElement("script");
    script.id = "paddle-js";
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;

    script.onload = () => {
      if (window.Paddle) {
        if (process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox") {
          window.Paddle.Environment.set("sandbox");
        }
        window.Paddle.Initialize({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "",
          eventCallback: async (event: { name?: string; data?: { transaction_id?: string } }) => {
            if (event.name === "checkout.completed") {
              const txnId = event.data?.transaction_id || "";
              try {
                // Activate plan on server — wait for completion before redirect
                const res = await fetch("/api/paddle/activate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ transactionId: txnId }),
                });
                if (!res.ok) {
                  console.error("[PaddleScript] Activate failed:", res.status);
                }
              } catch (err) {
                console.error("[PaddleScript] Activate error:", err);
              }
              // Redirect after activate completes (or fails — webhook will handle it)
              window.location.href = "/settings?upgraded=done";
            }
          },
        });
      }
    };

    script.onerror = () => {
      console.warn("[PaddleScript] Failed to load Paddle.js — checkout may not work. Check ad blocker or network.");
    };

    // Timeout fallback: if script doesn't load in 10s, warn
    const timeout = setTimeout(() => {
      if (!window.Paddle) {
        console.warn("[PaddleScript] Paddle.js load timeout — checkout may not be available.");
      }
    }, 10000);

    document.head.appendChild(script);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return null;
}

declare global {
  interface Window {
    Paddle?: {
      Environment: { set(env: string): void };
      Initialize(opts: Record<string, unknown>): void;
      Checkout: { open(opts: Record<string, unknown>): void; close(): void };
    };
  }
}
