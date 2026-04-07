import { auth } from "@clerk/nextjs/server";
import { paypalClient } from "@/lib/paypal";
import { activatePlan } from "@/lib/subscription";
import { checkRateLimit } from "@/lib/rateLimit";
import { PRO_PRICE_USD, BUSINESS_PRICE_USD } from "@/lib/config";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: max 5 capture attempts per hour per user
  const limit = await checkRateLimit(`${userId}:paypal-capture`, 5);
  if (!limit.allowed) {
    return Response.json({ error: "Too many payment attempts. Please try again later." }, { status: 429 });
  }

  const body = await req.json();
  const orderID = typeof body.orderID === "string" ? body.orderID.trim() : "";
  if (!orderID || orderID.length > 50) {
    return Response.json({ error: "Invalid orderID" }, { status: 400 });
  }

  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
  request.requestBody({} as Record<string, never>);

  try {
    const client = paypalClient();
    interface CaptureResult {
      status: string;
      payer?: { payer_id?: string };
      purchase_units?: Array<{
        custom_id?: string;
        amount?: { currency_code?: string; value?: string };
        payments?: { captures?: Array<{ id?: string }> };
      }>;
    }
    const capture = await client.execute<CaptureResult>(request);
    const result = capture.result;

    if (result.status === "COMPLETED") {
      // SECURITY: Verify that the payment's custom_id starts with the authenticated user
      const customId = result.purchase_units?.[0]?.custom_id ?? "";
      const [customUserId, customPlan] = customId.split(":");

      if (customUserId && customUserId !== userId) {
        console.error(`[PayPal] custom_id mismatch: expected ${userId}, got ${customUserId}`);
        return Response.json({ error: "Payment verification failed" }, { status: 403 });
      }

      const targetPlan: "pro" | "business" = customPlan === "business" ? "business" : "pro";

      // SECURITY: Verify payment amount matches expected price
      const paidAmount = result.purchase_units?.[0]?.amount?.value;
      const expectedAmount = targetPlan === "business" ? BUSINESS_PRICE_USD : PRO_PRICE_USD;
      if (!paidAmount || paidAmount !== expectedAmount) {
        console.error(`[PayPal] Amount mismatch: expected ${expectedAmount}, got ${paidAmount}`);
        return Response.json({ error: "Payment amount verification failed" }, { status: 403 });
      }

      const payerId = result.payer?.payer_id ?? "";
      const captureId = result.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? "";

      await activatePlan(userId, targetPlan, payerId, captureId);

      return Response.json({ success: true, plan: targetPlan });
    }

    return Response.json({ error: "Payment not completed", status: result.status }, { status: 400 });
  } catch (err) {
    console.error("[PayPal] Capture order error:", err);
    return Response.json({ error: "Failed to capture payment" }, { status: 500 });
  }
}
