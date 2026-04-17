import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSubscription } from "@/lib/subscription";
import { checkRateLimit } from "@/lib/rateLimit";
import { MVP_MODE } from "@/lib/config";
import { generateModifiedDocx } from "@/lib/docxGenerator";
import { isValidUUID } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 30;

const VALID_PERSPECTIVES = ["none", "party_a", "party_b"] as const;
type Perspective = (typeof VALID_PERSPECTIVES)[number];

export async function POST(req: NextRequest) {
  // ── Auth ──
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: max 20 DOCX exports per hour
  const limit = await checkRateLimit(`${userId}:export-docx`, 20);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many export requests. Please try again later." }, { status: 429 });
  }

  // ── Plan check ──
  const sub = await getSubscription(userId);
  if (sub.plan !== "business" && !MVP_MODE) {
    return NextResponse.json(
      { error: "DOCX export requires a Business plan" },
      { status: 403 }
    );
  }

  // ── Parse body ──
  let body: { contractId?: string; selectedIndices?: number[]; perspective?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { contractId, selectedIndices, perspective } = body;

  if (!contractId || !Array.isArray(selectedIndices)) {
    return NextResponse.json(
      { error: "Missing contractId or selectedIndices" },
      { status: 400 }
    );
  }

  if (selectedIndices.length > 100 ||
      !selectedIndices.every((i: unknown) => typeof i === "number" && Number.isInteger(i) && i >= 0)) {
    return NextResponse.json({ error: "Invalid selectedIndices" }, { status: 400 });
  }

  if (!isValidUUID(contractId)) {
    return NextResponse.json(
      { error: "Invalid contract ID" },
      { status: 400 }
    );
  }

  // Validate perspective
  const validPerspective: Perspective = VALID_PERSPECTIVES.includes(
    perspective as Perspective
  )
    ? (perspective as Perspective)
    : "none";

  // ── Fetch contract ──
  const { data, error } = await supabaseAdmin
    .from("contracts")
    .select("*")
    .eq("id", contractId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  if (data.status !== "COMPLETE") {
    return NextResponse.json(
      { error: "Analysis not complete" },
      { status: 400 }
    );
  }

  if (!data.contract_text || data.contract_text.trim().length === 0) {
    return NextResponse.json(
      { error: "Contract text is not available. DOCX export is not supported for scanned/image-based PDFs." },
      { status: 400 }
    );
  }

  // ── Generate DOCX ──
  let docxBuffer: Buffer;
  try {
    docxBuffer = await generateModifiedDocx(
      data.contract_text,
      data.result,
      selectedIndices,
      validPerspective
    );
  } catch (err) {
    console.error("[export-docx] DOCX generation error:", err);
    return NextResponse.json(
      { error: "DOCX generation failed" },
      { status: 500 }
    );
  }

  const uint8 = new Uint8Array(docxBuffer);

  return new NextResponse(uint8, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="modified-contract.docx"; filename*=UTF-8''${encodeURIComponent(
        data.title || "modified-contract"
      )}.docx`,
    },
  });
}
