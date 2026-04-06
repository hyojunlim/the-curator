import { auth } from "@clerk/nextjs/server";
import { paypalClient } from "@/lib/paypal";
import { checkRateLimit } from "@/lib/rateLimit";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import { PRO_PRICE_USD, BUSINESS_PRICE_USD, PRO_PLAN_NAME, BUSINESS_PLAN_NAME, BRAND_NAME } from "@/lib/config";

const PLAN_CONFIG = {
  pro: { price: PRO_PRICE_USD, name: PRO_PLAN_NAME },
  business: { price: BUSINESS_PRICE_USD, name: BUSINESS_PLAN_NAME },
} as const;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: max 10 order creations per hour per user
  const limit = checkRateLimit(`${userId}:paypal-create`, 10);
  if (!limit.allowed) {
    return Response.json({ error: "Too many payment attempts. Please try again later." }, { status: 429 });
  }

  // Determine which plan to purchase
  let targetPlan: "pro" | "business" = "pro";
  try {
    const body = await req.json();
    if (body.plan === "business") targetPlan = "business";
  } catch {
    // Default to pro if no body
  }

  const config = PLAN_CONFIG[targetPlan];

  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: config.price,
        },
        description: config.name,
        custom_id: `${userId}:${targetPlan}`, // Link payment to user + plan
      },
    ],
    application_context: {
      brand_name: BRAND_NAME,
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
    },
  });

  try {
    const client = paypalClient();
    const order = await client.execute<{ id: string }>(request);
    return Response.json({ id: order.result.id });
  } catch (err) {
    console.error("[PayPal] Create order error:", err);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
