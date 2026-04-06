import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET environment variable");
  }

  // Use Sandbox for testing, Live for production
  if (process.env.PAYPAL_MODE === "live") {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  }
  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

export function paypalClient() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}
