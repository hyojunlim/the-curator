import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { activatePlan, getSubscription, cancelPaddleSubscription } from "@/lib/subscription";

const PADDLE_API = process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox"
  ? "https://sandbox-api.paddle.com"
  : "https://api.paddle.com";

/**
 * POST /api/paddle/activate
 * Called from the client after Paddle checkout.completed event.
 * Activates the user's plan and stores the real subscription ID.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId } = await req.json();
    if (!transactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    const apiKey = (process.env.PADDLE_API_KEY || "").trim();

    // Step 1: Get transaction details
    const txnRes = await fetch(`${PADDLE_API}/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!txnRes.ok) {
      return NextResponse.json({ error: "Failed to verify transaction" }, { status: 400 });
    }

    const { data: txn } = await txnRes.json();

    // Verify transaction is completed/billed before activating
    if (txn.status !== "completed" && txn.status !== "billed") {
      return NextResponse.json({ error: "Transaction not completed" }, { status: 400 });
    }

    // Verify ownership
    const customData = txn.custom_data;
    if (!customData || customData.userId !== userId) {
      return NextResponse.json({ error: "Transaction does not belong to this user" }, { status: 403 });
    }

    // Determine plan from price ID (source of truth), fall back to custom_data
    const priceId = txn.items?.[0]?.price?.id;
    const proPriceId = (process.env.PADDLE_PRO_PRICE_ID || process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || "").trim();
    const bizPriceId = (process.env.PADDLE_BUSINESS_PRICE_ID || process.env.NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID || "").trim();

    let plan: "pro" | "business";
    if (priceId === proPriceId) {
      plan = "pro";
    } else if (priceId === bizPriceId) {
      plan = "business";
    } else if (customData.plan === "pro" || customData.plan === "business") {
      // Fallback: use custom_data only if price ID matching fails (e.g. env vars missing)
      plan = customData.plan;
    } else {
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }

    // Step 2: Get the real subscription ID
    let subscriptionId = txn.subscription_id;

    // If not in transaction yet, search Paddle subscriptions by customer
    if (!subscriptionId && txn.customer_id) {
      try {
        const subRes = await fetch(
          `${PADDLE_API}/subscriptions?customer_id=${txn.customer_id}&status=active`,
          { headers: { Authorization: `Bearer ${apiKey}` } }
        );
        if (subRes.ok) {
          const { data: subs } = await subRes.json();
          // Find the subscription matching this user
          const match = subs?.find((s: { custom_data?: { userId?: string } }) =>
            s.custom_data?.userId === userId
          );
          if (match) subscriptionId = match.id;
        }
      } catch {
        // Non-critical — webhook will update later
      }
    }

    // Read the user's current subscription BEFORE activating, to check for upgrades
    const currentSub = await getSubscription(userId);
    const oldPaddleSubId = currentSub.paddle_subscription_id;

    await activatePlan(userId, plan, subscriptionId || transactionId, txn.customer_id || transactionId);

    // If upgrading (e.g. Pro -> Business), cancel the OLD Paddle subscription
    // so the user isn't double-billed.
    if (
      oldPaddleSubId &&
      oldPaddleSubId.startsWith("sub_") &&
      oldPaddleSubId !== (subscriptionId || transactionId)
    ) {
      const canceled = await cancelPaddleSubscription(oldPaddleSubId);
      if (!canceled) {
        console.error(`[paddle/activate] Failed to cancel old subscription ${oldPaddleSubId} for user ${userId}`);
        // Non-blocking: the new plan is already active. The old sub can be canceled
        // manually or via a webhook reconciliation job.
      }
    }

    return NextResponse.json({ success: true, plan, subscriptionId: subscriptionId || null });
  } catch (err) {
    console.error("[paddle/activate] Error:", err);
    return NextResponse.json(
      { error: "Failed to activate plan. Please try again." },
      { status: 500 }
    );
  }
}
