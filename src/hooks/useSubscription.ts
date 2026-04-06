"use client";

import { useEffect, useState, useCallback } from "react";
import type { PlanType } from "@/lib/config";

export interface SubscriptionInfo {
  plan: PlanType;
  usage: number;
  limit: number | null;
  remaining: number;
  resetsAt: string;
}

export function useSubscription() {
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/subscription")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch subscription");
        return r.json();
      })
      .then((data) => {
        setSub(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { sub, loading, error, refresh };
}
