import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rateLimit";
import { getSubscription } from "@/lib/subscription";
import { MVP_MODE } from "@/lib/config";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Search is a paid feature (Pro or Business), unless MVP_MODE is on
  if (!MVP_MODE) {
    const sub = await getSubscription(userId);
    if (sub.plan === "free") {
      return Response.json({ error: "Search is a Pro feature. Upgrade to unlock.", code: "PRO_ONLY" }, { status: 403 });
    }
  }

  // Rate limit: max 60 searches per hour per user
  const limit = await checkRateLimit(`${userId}:search`, 60);
  if (!limit.allowed) {
    return Response.json({ error: "Too many search requests. Please slow down." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 1) return Response.json([]);

  // Validate search characters (block dangerous chars)
  if (/[<>"';\\\/\x00-\x1f]/.test(q)) {
    return Response.json({ error: "Invalid search query" }, { status: 400 });
  }

  // Limit search query length and escape SQL wildcards to prevent abuse
  const safeQuery = q.slice(0, 100).replace(/%/g, "\\%").replace(/_/g, "\\_");

  const { data, error } = await supabaseAdmin
    .from("contracts")
    .select("id, title, risk_score, risk_high, created_at, tags, type")
    .eq("user_id", userId)
    .ilike("title", `%${safeQuery}%`)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("[/api/search] Error:", error.message);
    // Don't expose database error details to the client
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
  return Response.json(data ?? []);
}
