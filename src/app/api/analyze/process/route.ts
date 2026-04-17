import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analyzeContract, analyzeContractFromPDF } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabase";
import { incrementUsage, getSubscription } from "@/lib/subscription";
import { checkRateLimit } from "@/lib/rateLimit";
import { isValidUUID } from "@/lib/validation";

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

    // Verify ownership and get contract data
    const { data: contract } = await supabaseAdmin
      .from("contracts")
      .select("id, user_id, contract_text, pdf_base64, status")
      .eq("id", contractId)
      .eq("user_id", userId)
      .single();

    if (!contract) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (contract.status !== "PENDING" && contract.status !== "FAILED") {
      return NextResponse.json({ error: "Already processing or complete" }, { status: 409 });
    }

    // Update to PROCESSING
    await supabaseAdmin
      .from("contracts")
      .update({ status: "PROCESSING" })
      .eq("id", contractId);

    try {
      let result;

      if (contract.pdf_base64) {
        // Vision fallback for scanned/image PDFs
        const pdfBuffer = Buffer.from(contract.pdf_base64, "base64");
        result = await analyzeContractFromPDF(pdfBuffer, language || "English");
      } else if (contract.contract_text) {
        result = await analyzeContract(contract.contract_text, language || "English");
      } else {
        throw new Error("No contract text or PDF data available");
      }

      result.language = language || "English";

      // Calculate risk score
      const aiScore = typeof result.riskScore === "number" ? result.riskScore : null;
      const highCount = result.risks.filter((r: { severity: string }) => r.severity === "high").length;
      const medCount = result.risks.filter((r: { severity: string }) => r.severity === "medium").length;
      const riskScore = aiScore !== null
        ? Math.max(0, Math.min(100, aiScore))
        : Math.min(100, highCount * 20 + medCount * 10 + result.risks.length * 2);

      // Update contract with results
      await supabaseAdmin
        .from("contracts")
        .update({
          status: "COMPLETE",
          type: result.contractType || "General Contract",
          risk_score: riskScore,
          risk_high: riskScore >= 60,
          result,
          pdf_base64: null, // Clean up stored PDF data after processing
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
