import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateContractPDF } from "@/lib/pdfGenerator";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contractId = req.nextUrl.searchParams.get("id");
  if (!contractId)
    return NextResponse.json(
      { error: "Missing contract ID" },
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
      "Content-Disposition": `attachment; filename="${encodeURIComponent(data.title || "contract-analysis")}.pdf"`,
    },
  });
}
