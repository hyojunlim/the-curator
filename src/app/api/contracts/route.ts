import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rateLimit";
import { getSubscription } from "@/lib/subscription";
import { PLAN_FEATURES } from "@/lib/config";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await getSubscription(userId);

  let query = supabaseAdmin
    .from("contracts")
    .select("id, title, parties, type, status, risk_score, risk_high, starred, tags, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // Limit history based on plan
  const features = PLAN_FEATURES[sub.plan as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.free;
  if (features.historyDays !== null) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - features.historyDays);
    query = query.gte("created_at", cutoff.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("[/api/contracts] Error:", error.message);
    return Response.json({ error: "Failed to fetch contracts" }, { status: 500 });
  }
  return Response.json(data);
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: max 20 bulk deletes per hour per user
  const limit = checkRateLimit(`${userId}:delete`, 20);
  if (!limit.allowed) {
    return Response.json({ error: "Too many delete requests. Please slow down." }, { status: 429 });
  }

  const { id } = await request.json();
  if (!id || typeof id !== "string") {
    return Response.json({ error: "Invalid contract ID" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("contracts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("[/api/contracts] Delete error:", error.message);
    return Response.json({ error: "Failed to delete contract" }, { status: 500 });
  }
  return Response.json({ success: true });
}
