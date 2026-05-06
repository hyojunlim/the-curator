import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateContractPDF } from "@/lib/pdfGenerator";
import { getSubscription } from "@/lib/subscription";
import { checkRateLimit } from "@/lib/rateLimit";
import { MVP_MODE } from "@/lib/config";
import { isValidUUID } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: max 20 PDF exports per hour
  const limit = await checkRateLimit(`${userId}:export-pdf`, 20);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many export requests. Please try again later." }, { status: 429 });
  }

  // Plan check: PDF export requires Pro or Business plan
  if (!MVP_MODE) {
    const sub = await getSubscription(userId);
    if (sub.plan === "free") {
      return NextResponse.json({ error: "PDF export requires a Pro or Business plan." }, { status: 403 });
    }
  }

  const contractId = req.nextUrl.searchParams.get("id");
  if (!contractId)
    return NextResponse.json(
      { error: "Missing contract ID" },
      { status: 400 }
    );

  if (!isValidUUID(contractId))
    return NextResponse.json(
      { error: "Invalid contract ID" },
      { status: 400 }
    );

  const { data, error } = await supabaseAdmin
    .from("contracts")
    .select("*")
    .eq("id", contractId)
    .eq("user_id", userId)
    .single();

  if (error || !data)
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });

  if (data.status !== "COMPLETE" || !data.result)
    return NextResponse.json({ error: "Analysis not complete yet" }, { status: 400 });

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateContractPDF(data);
  } catch (err) {
    console.error("[export-pdf] PDF generation error:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
  const uint8 = new Uint8Array(pdfBuffer);

  return new NextResponse(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contract-analysis.pdf"; filename*=UTF-8''${encodeURIComponent(data.title || "contract-analysis")}.pdf`,
    },
  });
}
