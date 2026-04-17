import { auth } from "@clerk/nextjs/server";
import { getSubscription, cancelPaddleSubscription } from "@/lib/subscription";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const limit = await checkRateLimit(`${userId}:cancel`, 5);
  if (!limit.allowed) {
    return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const sub = await getSubscription(userId);

    if (sub.plan === "free") {
      return Response.json({ error: "Already on Free plan" }, { status: 400 });
    }

    const subId = sub.paddle_subscription_id;
    const isRealSubscription = subId && subId.startsWith("sub_");

    if (isRealSubscription) {
      // Real Paddle subscription — cancel at end of billing period
      // Webhook (subscription.canceled) will downgrade when period ends
      const success = await cancelPaddleSubscription(subId);
      if (!success) {
        return Response.json({ error: "Failed to cancel with payment provider" }, { status: 500 });
      }
      return Response.json({
        success: true,
        message: "Subscription canceled. You'll keep access until the end of your billing period.",
        keepAccess: true,
      });
    }

    // No real Paddle subscription (manual upgrade or transaction-based)
    // Downgrade immediately since there's no recurring billing
    await supabaseAdmin
      .from("subscriptions")
      .update({
        paddle_subscription_id: null,
        // Plan stays until webhook or manual check downgrades it
        // For now, downgrade immediately since there's no recurring billing
        plan: "free",
      })
      .eq("user_id", userId);

    return Response.json({
      success: true,
      message: "Plan downgraded to Free.",
    });
  } catch (err) {
    console.error("[/api/subscription/cancel] Error:", err);
    return Response.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
