import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const PADDLE_API = process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox"
  ? "https://sandbox-api.paddle.com"
  : "https://api.paddle.com";

const ALLOWED_ORIGINS = [
  "https://thecurator.site",
];

// Paddle-approved domain for checkout redirect (until new domain is approved)
const PADDLE_CHECKOUT_DOMAIN = "https://thecurator.site";

/**
 * POST /api/paddle/checkout
 * Creates a Paddle transaction and returns the checkout URL.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const plan = body?.plan;

    const PRICES: Record<string, string> = {
      pro: (process.env.PADDLE_PRO_PRICE_ID || process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || "").trim(),
      business: (process.env.PADDLE_BUSINESS_PRICE_ID || process.env.NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID || "").trim(),
    };
    const API_KEY = (process.env.PADDLE_API_KEY || "").trim();

    const priceId = PRICES[plan];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan or missing price configuration" }, { status: 400 });
    }

    if (!API_KEY) {
      return NextResponse.json({ error: "Payment key not configured" }, { status: 500 });
    }


    // Validate origin (production only)
    const requestOrigin = req.headers.get("origin");
    if (requestOrigin && !ALLOWED_ORIGINS.includes(requestOrigin)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    // NOTE: If the user is upgrading (e.g. Pro -> Business), the old subscription
    // will be canceled in the /api/paddle/activate endpoint after the new subscription
    // is confirmed. We do NOT cancel here to avoid losing the subscription if the
    // user abandons checkout.

    const res = await fetch(`${PADDLE_API}/transactions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        custom_data: { userId, plan },
        checkout: { url: `${PADDLE_CHECKOUT_DOMAIN}/settings?upgraded=${plan}` },
      }),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("[paddle/checkout] Error:", res.status);
      return NextResponse.json({ error: `Checkout error (${res.status})` }, { status: 500 });
    }

    const data = JSON.parse(text);
    const checkoutUrl = data.data?.checkout?.url;

    if (!checkoutUrl) {
      return NextResponse.json({ error: "No checkout URL" }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("[paddle/checkout] Exception:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
