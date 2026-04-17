import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rateLimit";
import { isValidUUID } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!isValidUUID(params.id)) {
    return Response.json({ error: "Invalid contract ID" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("contracts")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", userId)
    .single();

  if (error || !data) return Response.json({ error: "Not found" }, { status: 404 });

  // Sanitize error_message to avoid leaking internal details (e.g. Gemini API errors)
  if (data.error_message) {
    data.error_message = "Analysis failed. Please try again.";
  }

  return Response.json(data);
}

// Only these fields can be updated by the user
const ALLOWED_PATCH_FIELDS = ["starred", "tags", "title"] as const;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!isValidUUID(params.id)) {
    return Response.json({ error: "Invalid contract ID" }, { status: 400 });
  }

  // Rate limit: max 60 PATCH per hour per user
  const limit = await checkRateLimit(`${userId}:patch`, 60);
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
    if ("tags" in sanitized) {
      if (!Array.isArray(sanitized.tags) || sanitized.tags.length > 10) {
        return Response.json({ error: "Invalid tags" }, { status: 400 });
      }
      const tagRegex = /^[a-zA-Z0-9\s\-_\u3131-\uD79D\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF.,()/&]+$/;
      for (const tag of sanitized.tags) {
        if (typeof tag !== "string" || tag.length === 0 || tag.length > 30 || !tagRegex.test(tag)) {
          return Response.json({ error: "Invalid tag content" }, { status: 400 });
        }
      }
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

  if (!isValidUUID(params.id)) {
    return Response.json({ error: "Invalid contract ID" }, { status: 400 });
  }

  // Rate limit: max 20 DELETE per hour per user
  const limit = await checkRateLimit(`${userId}:delete`, 20);
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
