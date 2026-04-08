import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analyzeContract, analyzeContractFromPDF } from "@/lib/gemini";
import { extractPDF, extractDOCX } from "@/lib/extractors";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rateLimit";
import { checkUsage, incrementUsage } from "@/lib/subscription";
import { ALLOWED_LANGUAGES, FREE_LANGUAGES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, MAX_WORD_COUNT, PLAN_FEATURES } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 120; // Allow up to 120s for Gemini API calls (expanded prompt)

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
      let pdfFallbackBuffer: Buffer | null = null;

      if (lowerName.endsWith(".pdf")) {
        try {
          contractText = await extractPDF(buffer);
        } catch (extractErr) {
          console.error("[/api/analyze] PDF extraction failed, using vision fallback:", extractErr);
          contractText = "";
        }
        // If text extraction fails (scanned/image PDF), we'll use Gemini's vision
        if (!contractText || contractText.trim().length < 50) {
          pdfFallbackBuffer = buffer;
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

      // If we have a scanned PDF, send it directly to Gemini Vision
      if (pdfFallbackBuffer) {
        const result = await analyzeContractFromPDF(pdfFallbackBuffer, language);
        result.language = language;

        const aiScore = typeof result.riskScore === "number" ? result.riskScore : null;
        const highCount = result.risks.filter((r) => r.severity === "high").length;
        const medCount = result.risks.filter((r) => r.severity === "medium").length;
        const riskScore = aiScore !== null
          ? Math.max(0, Math.min(100, aiScore))
          : Math.min(100, highCount * 20 + medCount * 10 + result.risks.length * 2);
        const riskHigh = riskScore >= 60;

        let savedId: string | null = null;
        try {
          const { data, error: dbError } = await supabaseAdmin
            .from("contracts")
            .insert({
              user_id: userId,
              title: fileName,
              parties: "",
              type: result.contractType || "General Contract",
              status: "COMPLETE",
              risk_score: riskScore,
              risk_high: riskHigh,
              result,
            })
            .select("id")
            .single();
          if (dbError) console.error("[/api/analyze] Supabase insert error:", dbError.message);
          savedId = data?.id ?? null;
        } catch (dbErr) {
          console.error("[/api/analyze] Supabase insert exception:", dbErr);
        }

        if (usage.plan !== "business") {
          await incrementUsage(userId);
        }

        return NextResponse.json({ ...result, riskScore, riskHigh, savedId });
      }
    } else {
      const body = await req.json();
      contractText = (body.text ?? "").trim();
      const rawLang = body.language || "English";
      language = allowedLangs.includes(rawLang) ? rawLang : "English";
      fileName = contractText.slice(0, 60).replace(/\s+/g, " ").trim() + "...";
    }

    if (!contractText || contractText.length < 50) {
      return NextResponse.json(
        { error: "Contract text is too short or empty. Please provide more content." },
        { status: 400 }
      );
    }

    // Truncate to ~15,000 words
    const words = contractText.split(/\s+/);
    if (words.length > MAX_WORD_COUNT) {
      contractText = words.slice(0, MAX_WORD_COUNT).join(" ") + "\n[... document truncated for analysis ...]";
    }

    const result = await analyzeContract(contractText, language);
    result.language = language;

    // Use AI-generated risk score; fallback to calculation only if missing
    const aiScore = typeof result.riskScore === "number" ? result.riskScore : null;
    const highCount = result.risks.filter((r) => r.severity === "high").length;
    const medCount = result.risks.filter((r) => r.severity === "medium").length;
    const riskScore = aiScore !== null
      ? Math.max(0, Math.min(100, aiScore))
      : Math.min(100, highCount * 20 + medCount * 10 + result.risks.length * 2);
    const riskHigh = riskScore >= 60;

    // Save to Supabase
    let savedId: string | null = null;
    try {
      const { data, error: dbError } = await supabaseAdmin
        .from("contracts")
        .insert({
          user_id: userId,
          title: fileName,
          parties: "",
          type: result.contractType || "General Contract",
          status: "COMPLETE",
          risk_score: riskScore,
          risk_high: riskHigh,
          result,
        })
        .select("id")
        .single();
      if (dbError) console.error("[/api/analyze] Supabase insert error:", dbError.message);
      savedId = data?.id ?? null;
    } catch (dbErr) {
      console.error("[/api/analyze] Supabase insert exception:", dbErr);
    }

    // Increment usage count for free and pro users (business is unlimited)
    if (usage.plan !== "business") {
      await incrementUsage(userId);
    }

    return NextResponse.json(
      { ...result, riskScore, riskHigh, savedId },
      {
        status: 200,
        headers: { "X-RateLimit-Remaining": String(limit.remaining) },
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/analyze] Error:", msg);

    if (msg === "TIMEOUT") {
      return NextResponse.json(
        { error: "Analysis timed out. The contract may be too complex — try a shorter excerpt." },
        { status: 504 }
      );
    }
    if (msg === "QUOTA_EXCEEDED") {
      return NextResponse.json(
        { error: "AI service quota exceeded. Please try again later." },
        { status: 429 }
      );
    }
    if (msg.startsWith("INVALID_JSON") || msg === "EMPTY_RESPONSE") {
      return NextResponse.json(
        { error: "The AI returned an invalid response. Please try again." },
        { status: 502 }
      );
    }
    if (msg === "SAFETY_BLOCKED") {
      return NextResponse.json(
        { error: "The AI could not process this contract due to content restrictions. Try a different document." },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
