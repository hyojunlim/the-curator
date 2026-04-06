import { auth } from "@clerk/nextjs/server";
import { deactivatePro } from "@/lib/subscription";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: max 5 cancel attempts per hour
  const limit = checkRateLimit(`${userId}:cancel`, 5);
  if (!limit.allowed) {
    return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    await deactivatePro(userId);
    return Response.json({ success: true, message: "Downgraded to Free plan." });
  } catch (err) {
    console.error("[/api/subscription/cancel] Error:", err);
    return Response.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
