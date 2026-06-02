import { Resend } from "resend";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * Transactional email via Resend.
 *
 * Everything here is best-effort and fail-safe: if RESEND_API_KEY is not
 * configured, or Clerk has no email for the user, or Resend errors, the
 * functions quietly return without throwing. Email must never break a
 * signup or a contract analysis.
 *
 * Required env:
 *   RESEND_API_KEY   — from resend.com
 *   EMAIL_FROM       — verified sender, e.g. "The Curator <noreply@thecurator.site>"
 *                      (defaults to Resend's test sender, which only delivers
 *                       to the Resend account owner until a domain is verified)
 */

const APP_URL = "https://thecurator.site";
const FROM = process.env.EMAIL_FROM || "The Curator <onboarding@resend.dev>";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

async function getUserEmail(userId: string): Promise<{ email: string; name: string } | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primary =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId) ||
      user.emailAddresses[0];
    if (!primary?.emailAddress) return null;
    const name = user.firstName || primary.emailAddress.split("@")[0];
    return { email: primary.emailAddress, name };
  } catch (err) {
    console.error("[email] failed to resolve user email:", err instanceof Error ? err.message : err);
    return null;
  }
}

/** Shared HTML shell so both emails look consistent. */
function layout(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
        <tr><td style="padding:32px 32px 0 32px;">
          <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#4f46e5;">The Curator</span>
        </td></tr>
        <tr><td style="padding:24px 32px 32px 32px;color:#27272a;font-size:15px;line-height:1.6;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f0f0f0;color:#a1a1aa;font-size:12px;line-height:1.5;">
          The Curator — AI Contract Review &amp; Risk Analysis<br>
          <a href="${APP_URL}" style="color:#a1a1aa;">thecurator.site</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;">${label}</a>`;
}

/** Welcome email — sent once when a user's account is first seen. */
export async function sendWelcomeEmail(userId: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const u = await getUserEmail(userId);
  if (!u) return;

  const body = `
    <h1 style="margin:0 0 16px 0;font-size:20px;font-weight:800;color:#18181b;">Welcome, ${u.name} 👋</h1>
    <p style="margin:0 0 16px 0;">Thanks for joining <strong>The Curator</strong>. Upload any contract (PDF, DOCX, or HWP) and our AI will flag hidden risks, summarize every clause, and suggest plain-language rewrites — in seconds.</p>
    <p style="margin:0 0 24px 0;">Your free plan includes <strong>10 analyses per month</strong> in 8 languages. Ready to try your first one?</p>
    <p style="margin:0 0 8px 0;">${button(`${APP_URL}/analyze`, "Analyze your first contract")}</p>
  `;

  try {
    await resend.emails.send({
      from: FROM,
      to: u.email,
      subject: "Welcome to The Curator 👋",
      html: layout(body),
    });
  } catch (err) {
    console.error("[email] welcome send failed:", err instanceof Error ? err.message : err);
  }
}

/** Analysis-complete email — sent when a contract finishes processing. */
export async function sendAnalysisCompleteEmail(
  userId: string,
  opts: { contractId: string; title: string; riskScore: number }
): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const u = await getUserEmail(userId);
  if (!u) return;

  const riskColor = opts.riskScore >= 60 ? "#dc2626" : opts.riskScore >= 30 ? "#d97706" : "#16a34a";
  const riskLabel = opts.riskScore >= 60 ? "High risk" : opts.riskScore >= 30 ? "Moderate risk" : "Low risk";
  const safeTitle = opts.title.replace(/[<>]/g, "");

  const body = `
    <h1 style="margin:0 0 16px 0;font-size:20px;font-weight:800;color:#18181b;">Your analysis is ready ✅</h1>
    <p style="margin:0 0 16px 0;">We finished reviewing <strong>${safeTitle}</strong>.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
      <tr>
        <td style="background:${riskColor}1a;color:${riskColor};font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;">
          ${riskLabel} · ${opts.riskScore}/100
        </td>
      </tr>
    </table>
    <p style="margin:0 0 24px 0;">Open the full report to see flagged clauses, key dates, financial obligations, and suggested rewrites.</p>
    <p style="margin:0 0 8px 0;">${button(`${APP_URL}/contracts/${opts.contractId}`, "View full analysis")}</p>
  `;

  try {
    await resend.emails.send({
      from: FROM,
      to: u.email,
      subject: `Analysis ready: ${safeTitle}`,
      html: layout(body),
    });
  } catch (err) {
    console.error("[email] analysis-complete send failed:", err instanceof Error ? err.message : err);
  }
}
