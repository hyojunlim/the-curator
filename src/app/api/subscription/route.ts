import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSubscription } from "@/lib/subscription";
import { FREE_ANALYSIS_LIMIT, PRO_ANALYSIS_LIMIT, MVP_MODE, PADDLE_API_BASE } from "@/lib/config";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sub = await getSubscription(userId);

    let limit: number | null;
    let remaining: number;

    if (sub.plan === "business" || (MVP_MODE && sub.plan === "free")) {
      limit = null;
      remaining = -1;
    } else if (sub.plan === "pro") {
      limit = PRO_ANALYSIS_LIMIT;
      remaining = Math.max(0, PRO_ANALYSIS_LIMIT - sub.usage_count);
    } else {
      limit = FREE_ANALYSIS_LIMIT;
      remaining = Math.max(0, FREE_ANALYSIS_LIMIT - sub.usage_count);
    }

    // Check if subscription is canceled on Paddle (scheduled for cancellation)
    let canceledAt: string | null = null;
    let paddleStatus: string | null = null;
    const subId = sub.paddle_subscription_id;

    if (subId && subId.startsWith("sub_") && process.env.PADDLE_API_KEY) {
      try {
        const res = await fetch(`${PADDLE_API_BASE}/subscriptions/${subId}`, {
          headers: { Authorization: `Bearer ${(process.env.PADDLE_API_KEY || "").trim()}` },
        });
        if (res.ok) {
          const { data } = await res.json();
          paddleStatus = data.status; // active, canceled, past_due, paused
          if (data.canceled_at) canceledAt = data.canceled_at;
          if (data.scheduled_change?.action === "cancel") {
            canceledAt = data.current_billing_period?.ends_at || data.canceled_at;
          }
        }
      } catch {
        // Non-critical — just don't show cancel status
      }
    }

    return NextResponse.json({
      plan: sub.plan,
      usage: sub.usage_count,
      limit,
      remaining,
      resetsAt: sub.usage_reset_at,
      canceledAt,
      paddleStatus,
    });
  } catch (err) {
    console.error("[/api/subscription] Error:", err);
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
  }
}
