import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analyzeContract, analyzeContractFromPDF } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabase";
import { incrementUsage, getSubscription } from "@/lib/subscription";
import { checkRateLimit } from "@/lib/rateLimit";
import { isValidUUID } from "@/lib/validation";
import { HIGH_RISK_THRESHOLD, RISK_SCORE_WEIGHTS, STALE_PROCESSING_MS } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes — plenty of time for Gemini

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: max 30 analysis requests per hour
    const limit = await checkRateLimit(`${userId}:analyze-process`, 30);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { contractId, language } = await req.json();
    if (!contractId) {
      return NextResponse.json({ error: "Missing contractId" }, { status: 400 });
    }

    if (!isValidUUID(contractId)) {
      return NextResponse.json({ error: "Invalid contract ID" }, { status: 400 });
    }

    // Atomically CLAIM the contract for processing. This single conditional
    // update is the lock: it succeeds only if the row is PENDING, FAILED, or a
    // PROCESSING that has gone stale (its serverless function died). Concurrent
    // duplicate requests (e.g. fire-and-forget + the detail page auto-trigger)
    // lose the race and get a 409, so the analysis never runs twice.
    const staleThreshold = new Date(Date.now() - STALE_PROCESSING_MS).toISOString();
    const nowIso = new Date().toISOString();

    const { data: contract } = await supabaseAdmin
      .from("contracts")
      .update({ status: "PROCESSING", updated_at: nowIso, error_message: null })
      .eq("id", contractId)
      .eq("user_id", userId)
      .or(`status.eq.PENDING,status.eq.FAILED,and(status.eq.PROCESSING,updated_at.lt.${staleThreshold})`)
      .select("id, contract_text, pdf_base64, language")
      .maybeSingle();

    if (!contract) {
      // Claim failed: either the contract doesn't exist / isn't owned by this
      // user (404), or it's already being processed freshly / is complete (409).
      const { data: existing } = await supabaseAdmin
        .from("contracts")
        .select("status")
        .eq("id", contractId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (existing.status === "COMPLETE") {
        return NextResponse.json({ status: "COMPLETE" });
      }
      // Fresh PROCESSING — another invocation is actively running it.
      return NextResponse.json({ status: "PROCESSING", message: "Already processing" }, { status: 409 });
    }

    // Prefer the language stored on the contract (set at upload) so a recovery
    // or retry that doesn't know the original language still analyzes correctly.
    const effectiveLanguage = contract.language || language || "English";

    try {
      let result;

      if (contract.pdf_base64) {
        // Vision fallback for scanned/image PDFs
        const pdfBuffer = Buffer.from(contract.pdf_base64, "base64");
        result = await analyzeContractFromPDF(pdfBuffer, effectiveLanguage);
      } else if (contract.contract_text) {
        result = await analyzeContract(contract.contract_text, effectiveLanguage);
      } else {
        throw new Error("No contract text or PDF data available");
      }

      result.language = effectiveLanguage;

      // Calculate risk score
      const aiScore = typeof result.riskScore === "number" ? result.riskScore : null;
      const highCount = result.risks.filter((r: { severity: string }) => r.severity === "high").length;
      const medCount = result.risks.filter((r: { severity: string }) => r.severity === "medium").length;
      const riskScore = aiScore !== null
        ? Math.max(0, Math.min(100, aiScore))
        : Math.min(100, highCount * RISK_SCORE_WEIGHTS.high + medCount * RISK_SCORE_WEIGHTS.medium + result.risks.length * RISK_SCORE_WEIGHTS.low);

      // Update contract with results
      await supabaseAdmin
        .from("contracts")
        .update({
          status: "COMPLETE",
          type: result.contractType || "General Contract",
          risk_score: riskScore,
          risk_high: riskScore >= HIGH_RISK_THRESHOLD,
          result,
          pdf_base64: null, // Clean up stored PDF data after processing
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      // Increment usage count (business plan is unlimited)
      const sub = await getSubscription(userId);
      if (sub.plan !== "business") {
        await incrementUsage(userId);
      }

      return NextResponse.json({ status: "COMPLETE", riskScore });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[/api/analyze/process] Analysis failed:", msg);

      await supabaseAdmin
        .from("contracts")
        .update({
          status: "FAILED",
          error_message: msg,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      return NextResponse.json({ status: "FAILED", error: "Analysis failed. Please try again or contact support." });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/analyze/process] Error:", msg);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
