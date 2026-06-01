import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
// Never cache — every hit must actually touch the database to keep it warm
export const dynamic = "force-dynamic";

/**
 * Keepalive endpoint.
 *
 * Supabase's free tier pauses a project after ~7 days with no database
 * activity, which then causes contract uploads to fail with connection
 * timeouts. An external cron service (e.g. cron-job.org) pings this route
 * daily to run a trivial query and keep the database awake.
 *
 * Public route (see middleware) — returns no user data, only a status flag.
 */
export async function GET() {
  try {
    // Lightweight query: just confirm the DB responds. head:true fetches no rows.
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
