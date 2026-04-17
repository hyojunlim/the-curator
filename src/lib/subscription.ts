import { supabaseAdmin } from "./supabase";
import { PLAN_FEATURES } from "./config";
import type { PlanType } from "./config";

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  paddle_subscription_id: string | null;
  paddle_customer_id: string | null;
  usage_count: number;
  usage_reset_at: string;
}

/** Get or create subscription row for a user */
export async function getSubscription(userId: string): Promise<Subscription> {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (data) {
    // Reset usage if the window has passed
    if (new Date(data.usage_reset_at) <= new Date()) {
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1);
      nextReset.setDate(1); // Always reset on the 1st to avoid month-end date issues
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from("subscriptions")
        .update({ usage_count: 0, usage_reset_at: nextReset.toISOString() })
        .eq("id", data.id)
        .select("*")
        .single();
      if (updateErr || !updated) {
        throw new Error("Failed to reset subscription usage");
      }
      return updated as Subscription;
    }
    return data as Subscription;
  }

  // Create new free subscription (upsert to prevent duplicates from concurrent requests)
  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1);
  nextReset.setDate(1); // Always reset on the 1st to avoid month-end date issues
  const { data: created, error: createErr } = await supabaseAdmin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        plan: "free",
        usage_count: 0,
        usage_reset_at: nextReset.toISOString(),
      },
      { onConflict: "user_id", ignoreDuplicates: true }
    )
    .select("*")
    .single();

  if (createErr || !created) {
    // If upsert conflict, re-fetch the existing row
    const { data: existing } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (existing) return existing as Subscription;
    throw new Error("Failed to create subscription");
  }
  return created as Subscription;
}

/** Get the analysis limit for a plan (-1 = unlimited) */
function getPlanLimit(plan: PlanType): number {
  const limit = PLAN_FEATURES[plan].analysisLimit;
  return limit === null ? -1 : limit;
}

/** Check if user can analyze (returns remaining count or -1 for unlimited) */
export async function checkUsage(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number; plan: PlanType }> {
  const sub = await getSubscription(userId);
  const limit = getPlanLimit(sub.plan);

  if (limit === -1) {
    return { allowed: true, remaining: -1, limit: -1, plan: sub.plan };
  }

  const remaining = limit - sub.usage_count;
  return { allowed: remaining > 0, remaining: Math.max(0, remaining), limit, plan: sub.plan };
}

/** Increment usage count after a successful analysis (atomic to prevent race conditions) */
export async function incrementUsage(userId: string): Promise<void> {
  const { error } = await supabaseAdmin.rpc("increment_usage", { p_user_id: userId });
  if (error) {
    // Fallback to non-atomic update if RPC not available
    const sub = await getSubscription(userId);
    await supabaseAdmin
      .from("subscriptions")
      .update({ usage_count: sub.usage_count + 1 })
      .eq("id", sub.id);
  }
}

/** Activate a paid plan after successful Paddle payment */
export async function activatePlan(userId: string, plan: "pro" | "business", subscriptionId: string, customerId: string): Promise<void> {
  const sub = await getSubscription(userId);
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      plan,
      paddle_subscription_id: subscriptionId,
      paddle_customer_id: customerId,
    })
    .eq("id", sub.id);

  if (error) {
    console.error("[activatePlan] DB update failed:", error.message);
    throw new Error("Failed to activate plan in database");
  }
}

/** Downgrade to free plan */
export async function deactivatePro(userId: string): Promise<void> {
  await supabaseAdmin
    .from("subscriptions")
    .update({ plan: "free", paddle_subscription_id: null })
    .eq("user_id", userId);
}

/** Cancel Paddle subscription via API */
export async function cancelPaddleSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://${process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox" ? "sandbox-api" : "api"}.paddle.com/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(process.env.PADDLE_API_KEY || "").trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ effective_from: "next_billing_period" }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}
