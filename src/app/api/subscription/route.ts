import { auth } from "@clerk/nextjs/server";
import { getSubscription } from "@/lib/subscription";
import { FREE_ANALYSIS_LIMIT, PRO_ANALYSIS_LIMIT, MVP_MODE } from "@/lib/config";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sub = await getSubscription(userId);

    let limit: number | null;
    let remaining: number;

    if (sub.plan === "business" || (MVP_MODE && sub.plan === "free")) {
      // Business plan or MVP mode free users get unlimited
      limit = null;
      remaining = -1;
    } else if (sub.plan === "pro") {
      limit = PRO_ANALYSIS_LIMIT;
      remaining = Math.max(0, PRO_ANALYSIS_LIMIT - sub.usage_count);
    } else {
      limit = FREE_ANALYSIS_LIMIT;
      remaining = Math.max(0, FREE_ANALYSIS_LIMIT - sub.usage_count);
    }

    return Response.json({
      plan: sub.plan,
      usage: sub.usage_count,
      limit,
      remaining,
      resetsAt: sub.usage_reset_at,
    });
  } catch (err) {
    console.error("[/api/subscription] Error:", err);
    return Response.json({ error: "Failed to fetch subscription" }, { status: 500 });
  }
}
