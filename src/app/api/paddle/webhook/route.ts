import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Verify Paddle webhook signature (HMAC-SHA256).
 * https://developer.paddle.com/webhooks/verify-signatures
 */
function verifyPaddleSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  // SECURITY: Reject all webhooks if secret is not configured
  if (!secret) {
    console.error("[paddle/webhook] PADDLE_WEBHOOK_SECRET is not set — rejecting webhook");
    return false;
  }
  if (!signature) return false;

  try {
    // Paddle-Signature format: ts=TIMESTAMP;h1=HASH
    const parts = Object.fromEntries(
      signature.split(";").map((p) => {
        const [k, ...v] = p.split("=");
        return [k, v.join("=")];
      })
    );

    const ts = parts.ts;
    const h1 = parts.h1;
    if (!ts || !h1) return false;

    // Reject webhooks older than 5 minutes to prevent replay attacks
    const webhookAge = Math.abs(Date.now() / 1000 - parseInt(ts, 10));
    if (webhookAge > 300) return false;

    const signedPayload = `${ts}:${rawBody}`;
    const expectedSig = createHmac("sha256", secret).update(signedPayload).digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    const h1Buf = Buffer.from(h1, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    return h1Buf.length === expectedBuf.length && timingSafeEqual(h1Buf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Derive plan from the first price item's price ID when custom_data.plan is missing.
 */
function planFromPriceId(data: Record<string, unknown>): "pro" | "business" | null {
  const items = data.items as Array<{ price?: { id?: string } }> | undefined;
  const priceId = items?.[0]?.price?.id;
  if (!priceId) return null;

  const proPriceId = (
    process.env.PADDLE_PRO_PRICE_ID ||
    process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID ||
    ""
  ).trim();
  const bizPriceId = (
    process.env.PADDLE_BUSINESS_PRICE_ID ||
    process.env.NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID ||
    ""
  ).trim();

  if (proPriceId && priceId === proPriceId) return "pro";
  if (bizPriceId && priceId === bizPriceId) return "business";
  return null;
}

/**
 * Look up a user by their paddle_subscription_id when custom_data.userId is missing.
 */
async function lookupUserBySubscriptionId(subscriptionId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("paddle_subscription_id", subscriptionId)
    .single();

  if (error || !data) {
    console.warn(
      `[paddle/webhook] Could not find user for subscription ${subscriptionId}:`,
      error?.message
    );
    return null;
  }
  return data.user_id;
}

/**
 * POST /api/paddle/webhook
 * Handles Paddle webhook events for subscription lifecycle.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("paddle-signature");

    // Verify webhook signature
    if (!verifyPaddleSignature(rawBody, signature)) {
      console.error("[paddle/webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const eventType = body.event_type;
    const data = body.data;

    switch (eventType) {
      case "subscription.activated":
      case "subscription.resumed":
      case "subscription.updated": {
        const customData = data.custom_data;

        // Resolve userId — fall back to DB lookup by paddle_subscription_id
        let userId: string | null = customData?.userId || null;
        if (!userId && data.id) {
          userId = await lookupUserBySubscriptionId(data.id);
        }
        if (!userId) {
          console.warn(
            `[paddle/webhook] ${eventType}: no userId in custom_data and no matching subscription for ${data.id}`
          );
          break;
        }

        // Resolve plan — fall back to price ID lookup
        let plan: "pro" | "business" | null =
          (customData?.plan as "pro" | "business") || null;
        if (!plan) {
          plan = planFromPriceId(data);
        }

        const subscriptionId = data.id;
        const status = data.status;

        if (status === "active" && plan) {
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({
              plan,
              paddle_subscription_id: subscriptionId,
              paddle_customer_id: data.customer_id || null,
            })
            .eq("user_id", userId);

          if (error) {
            console.error(
              `[paddle/webhook] Failed to activate plan for user ${userId}:`,
              error.message
            );
            return NextResponse.json({ error: "DB update failed" }, { status: 500 });
          }
        } else if (status === "paused" || status === "past_due") {
          // Payment issue — downgrade to free
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({ plan: "free" })
            .eq("user_id", userId);

          if (error) {
            console.error(
              `[paddle/webhook] Failed to downgrade user ${userId}:`,
              error.message
            );
            return NextResponse.json({ error: "DB update failed" }, { status: 500 });
          }
        }
        break;
      }

      case "subscription.canceled": {
        const customData = data.custom_data;

        let userId: string | null = customData?.userId || null;
        if (!userId && data.id) {
          userId = await lookupUserBySubscriptionId(data.id);
        }
        if (!userId) {
          console.warn(
            `[paddle/webhook] subscription.canceled: no userId for subscription ${data.id}`
          );
          break;
        }

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            plan: "free",
            paddle_subscription_id: null,
          })
          .eq("user_id", userId);

        if (error) {
          console.error(
            `[paddle/webhook] Failed to cancel subscription for user ${userId}:`,
            error.message
          );
          return NextResponse.json({ error: "DB update failed" }, { status: 500 });
        }
        break;
      }

      case "subscription.past_due": {
        // Payment failed — downgrade to free to prevent free access
        const customData = data.custom_data;

        let userId: string | null = customData?.userId || null;
        if (!userId && data.id) {
          userId = await lookupUserBySubscriptionId(data.id);
        }
        if (!userId) {
          console.warn(
            `[paddle/webhook] subscription.past_due: no userId for subscription ${data.id}`
          );
          break;
        }

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({ plan: "free" })
          .eq("user_id", userId);

        if (error) {
          console.error(
            `[paddle/webhook] Failed to downgrade user ${userId} on past_due:`,
            error.message
          );
          return NextResponse.json({ error: "DB update failed" }, { status: 500 });
        }
        break;
      }

      case "transaction.completed":
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[paddle/webhook] Error:", err);
    return NextResponse.json(
      { error: "Internal webhook processing error" },
      { status: 500 }
    );
  }
}
