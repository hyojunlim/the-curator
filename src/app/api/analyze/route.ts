import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { extractPDF, extractDOCX } from "@/lib/extractors";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rateLimit";
import { checkUsage } from "@/lib/subscription";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, MAX_WORD_COUNT, PLAN_FEATURES } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 30; // Only text extraction now — fast

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    // Require authentication
    if (!userId) {
      return NextResponse.json({ error: "Please sign in to analyze contracts." }, { status: 401 });
    }

    // Rate limit check (hourly)
    const limit = await checkRateLimit(userId);
    if (!limit.allowed) {
      const retryMinutes = Math.ceil((limit.resetAt - Date.now()) / 60_000);
      return NextResponse.json(
        { error: `Rate limit reached. You can analyze up to 20 contracts per hour. Try again in ${retryMinutes} minutes.` },
        { status: 429, headers: { "Retry-After": String(retryMinutes * 60) } }
      );
    }

    // Subscription usage check (monthly)
    const usage = await checkUsage(userId);
    if (!usage.allowed) {
      return NextResponse.json(
        { error: "Monthly analysis limit reached. Upgrade to Pro for unlimited analyses.", code: "USAGE_LIMIT" },
        { status: 403 }
      );
    }

    let contractText = "";
    let fileName = "Pasted Text";
    let pdfBase64: string | null = null;
    const contentType = req.headers.get("content-type") ?? "";

    // Determine allowed languages based on plan
    const planFeatures = PLAN_FEATURES[usage.plan] || PLAN_FEATURES.free;
    const allowedLangs = planFeatures.languages as readonly string[];
    let language = "English";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const rawLang = (formData.get("language") as string) || "English";
      language = allowedLangs.includes(rawLang) ? rawLang : "English";

      if (!file) {
        return NextResponse.json({ error: "No file provided." }, { status: 400 });
      }

      // MIME type validation
      const ALLOWED_MIMES = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!ALLOWED_MIMES.includes(file.type)) {
        return NextResponse.json({ error: "Only PDF and DOCX files are allowed." }, { status: 400 });
      }

      // Verify magic bytes
      const headerBytes = new Uint8Array(await file.slice(0, 4).arrayBuffer());
      const isPDF = headerBytes[0] === 0x25 && headerBytes[1] === 0x50 && headerBytes[2] === 0x44 && headerBytes[3] === 0x46;
      const isZip = headerBytes[0] === 0x50 && headerBytes[1] === 0x4B && headerBytes[2] === 0x03 && headerBytes[3] === 0x04;
      if (!isPDF && !isZip) {
        return NextResponse.json({ error: "Invalid file format." }, { status: 400 });
      }

      // File size validation
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` },
          { status: 400 }
        );
      }

      // Sanitize filename — preserve Unicode (Korean, Japanese, Chinese, etc.)
      fileName = file.name
        .replace(/\.[^/.]+$/, "")           // remove extension
        .replace(/[<>"'`;\\\/\x00-\x1f]/g, "") // remove dangerous chars only
        .trim() || "Uploaded Document";

      const buffer = Buffer.from(await file.arrayBuffer());
      const lowerName = file.name.toLowerCase();

      if (lowerName.endsWith(".pdf")) {
        try {
          contractText = await extractPDF(buffer);
        } catch (extractErr) {
          console.error("[/api/analyze] PDF extraction failed, using vision fallback:", extractErr);
          contractText = "";
        }
        // If text extraction fails (scanned/image PDF), store base64 for vision fallback
        if (!contractText || contractText.trim().length < 50) {
          pdfBase64 = buffer.toString("base64");
          contractText = ""; // Will use vision in process route
        }
      } else if (lowerName.endsWith(".docx")) {
        try {
          contractText = await extractDOCX(buffer);
        } catch (extractErr) {
          console.error("[/api/analyze] DOCX extraction failed:", extractErr);
          return NextResponse.json({ error: "Failed to extract text from DOCX file." }, { status: 400 });
        }
      } else {
        return NextResponse.json(
          { error: "Unsupported file type. Please upload a PDF or DOCX file." },
          { status: 400 }
        );
      }
    } else {
      const body = await req.json();
      contractText = (body.text ?? "").trim();
      const rawLang = body.language || "English";
      language = allowedLangs.includes(rawLang) ? rawLang : "English";
      fileName = contractText.slice(0, 60).replace(/\s+/g, " ").trim() + "...";
    }

    // For non-vision cases, validate text length
    if (!pdfBase64 && (!contractText || contractText.length < 50)) {
      return NextResponse.json(
        { error: "Contract text is too short or empty. Please provide more content." },
        { status: 400 }
      );
    }

    // Truncate to ~15,000 words
    if (contractText) {
      const words = contractText.split(/\s+/);
      if (words.length > MAX_WORD_COUNT) {
        contractText = words.slice(0, MAX_WORD_COUNT).join(" ") + "\n[... document truncated for analysis ...]";
      }
    }

    // Save contract with PENDING status
    const { data, error: dbError } = await supabaseAdmin
      .from("contracts")
      .insert({
        user_id: userId,
        title: fileName,
        parties: "",
        type: "Pending Analysis",
        status: "PENDING",
        risk_score: 0,
        risk_high: false,
        contract_text: contractText || null,
        pdf_base64: pdfBase64 || null,
        result: null,
      })
      .select("id")
      .single();

    if (dbError || !data) {
      console.error("[/api/analyze] Supabase insert error:", dbError?.message);
      return NextResponse.json({ error: "Failed to save contract." }, { status: 500 });
    }

    // Return immediately with contractId and language
    return NextResponse.json(
      { contractId: data.id, status: "PENDING", language },
      {
        status: 200,
        headers: { "X-RateLimit-Remaining": String(limit.remaining) },
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/analyze] Error:", msg);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
