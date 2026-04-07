import { supabaseAdmin } from "./supabase";
import { FREE_ANALYSIS_LIMIT, PRO_ANALYSIS_LIMIT } from "./config";
import type { PlanType } from "./config";

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  paypal_payer_id: string | null;
  paypal_capture_id: string | null;
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

  // Create new free subscription
  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1);
  const { data: created, error: createErr } = await supabaseAdmin
    .from("subscriptions")
    .insert({
      user_id: userId,
      plan: "free",
      usage_count: 0,
      usage_reset_at: nextReset.toISOString(),
    })
    .select("*")
    .single();

  if (createErr || !created) {
    throw new Error("Failed to create subscription");
  }
  return created as Subscription;
}

/** Get the analysis limit for a plan (-1 = unlimited) */
function getPlanLimit(plan: PlanType): number {
  switch (plan) {
    case "business": return -1; // unlimited
    case "pro": return PRO_ANALYSIS_LIMIT;
    default: return FREE_ANALYSIS_LIMIT;
  }
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

/** Activate a paid plan after successful PayPal payment */
export async function activatePlan(userId: string, plan: "pro" | "business", paypalPayerId: string, paypalCaptureId: string): Promise<void> {
  const sub = await getSubscription(userId);
  await supabaseAdmin
    .from("subscriptions")
    .update({
      plan,
      paypal_payer_id: paypalPayerId,
      paypal_capture_id: paypalCaptureId,
    })
    .eq("id", sub.id);
}

/** Downgrade to free plan */
export async function deactivatePro(userId: string): Promise<void> {
  await supabaseAdmin
    .from("subscriptions")
    .update({ plan: "free", paypal_capture_id: null })
    .eq("user_id", userId);
}
