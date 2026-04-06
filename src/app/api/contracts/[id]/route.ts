import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("contracts")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", userId)
    .single();

  if (error || !data) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(data);
}

// Only these fields can be updated by the user
const ALLOWED_PATCH_FIELDS = ["starred", "tags", "title"] as const;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: max 60 PATCH per hour per user
  const limit = checkRateLimit(`${userId}:patch`, 60);
  if (!limit.allowed) {
    return Response.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  try {
    const body = await req.json();

    // Whitelist: only allow safe fields
    const sanitized: Record<string, unknown> = {};
    for (const key of ALLOWED_PATCH_FIELDS) {
      if (key in body) sanitized[key] = body[key];
    }

    if (Object.keys(sanitized).length === 0) {
      return Response.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Validate field types
    if ("starred" in sanitized && typeof sanitized.starred !== "boolean") {
      return Response.json({ error: "Invalid value for starred" }, { status: 400 });
    }
    if ("tags" in sanitized && !Array.isArray(sanitized.tags)) {
      return Response.json({ error: "Invalid value for tags" }, { status: 400 });
    }
    if ("title" in sanitized && (typeof sanitized.title !== "string" || (sanitized.title as string).length > 200)) {
      return Response.json({ error: "Invalid value for title" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("contracts")
      .update(sanitized)
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return Response.json({ error: "Failed to update contract" }, { status: 500 });
    if (!data) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(data);
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: max 20 DELETE per hour per user
  const limit = checkRateLimit(`${userId}:delete`, 20);
  if (!limit.allowed) {
    return Response.json({ error: "Too many delete requests. Please slow down." }, { status: 429 });
  }

  const { error } = await supabaseAdmin
    .from("contracts")
    .delete()
    .eq("id", params.id)
    .eq("user_id", userId);

  if (error) return Response.json({ error: "Failed to delete contract" }, { status: 500 });
  return Response.json({ success: true });
}
