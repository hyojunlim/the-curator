import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_PROMPT } from "./prompts";
import type { AnalysisResult } from "@/types";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0,
      maxOutputTokens: 65536,
    },
  });
}

function parseResponse(responseText: string): AnalysisResult {
  if (!responseText || responseText.trim().length === 0) {
    console.error("[Gemini] Empty response received");
    throw new Error("EMPTY_RESPONSE");
  }

  // Clean markdown fences and extra whitespace
  let cleaned = responseText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: AnalysisResult | null = null;

  // Strategy 1: Parse as-is
  try {
    const raw = JSON.parse(cleaned);
    // If Gemini wrapped in array [{...}], unwrap it
    parsed = Array.isArray(raw) ? raw[0] : raw;
  } catch {
    // Strategy 2: Extract between first { and last }
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      try {
        parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
      } catch {
        // Strategy 3: Try removing ALL trailing non-} characters
        const trimmed = cleaned.slice(jsonStart).replace(/[^}]*$/, "");
        const end2 = trimmed.lastIndexOf("}");
        if (end2 !== -1) {
          try {
            parsed = JSON.parse(trimmed.slice(0, end2 + 1));
          } catch {
            // all strategies failed
          }
        }
      }
    }
  }

  if (!parsed) {
    const detail = `All parse strategies failed. Length: ${cleaned.length}. Start: ${cleaned.slice(0, 100)}... End: ...${cleaned.slice(-100)}`;
    console.error("[Gemini]", detail);
    throw new Error("INVALID_JSON:" + detail);
  }

  // More lenient validation - accept if we got at least some useful data
  if (!parsed.summary && !Array.isArray(parsed.risks)) {
    const detail = `Missing summary+risks. Keys: ${Object.keys(parsed).join(", ")}`;
    console.error("[Gemini]", detail);
    throw new Error("INVALID_JSON:" + detail);
  }

  // Provide defaults for everything that might be missing
  if (!parsed.summary) parsed.summary = "";
  if (!Array.isArray(parsed.risks)) parsed.risks = [];

  if (!Array.isArray(parsed.parties)) {
    parsed.parties = [
      { role: "party_a" as const, name: "Party A", description: "First party" },
      { role: "party_b" as const, name: "Party B", description: "Second party" },
    ];
  }

  if (!parsed.contractType) parsed.contractType = "General Contract";
  if (!Array.isArray(parsed.keyDates)) parsed.keyDates = [];
  if (!Array.isArray(parsed.financialObligations)) parsed.financialObligations = [];
  if (!Array.isArray(parsed.missingClauses)) parsed.missingClauses = [];
  if (!Array.isArray(parsed.actionItems)) parsed.actionItems = [];
  if (typeof parsed.fairnessScore !== "number") parsed.fairnessScore = 50;
  if (!parsed.fairnessSummary) parsed.fairnessSummary = "";

  return parsed;
}

/** Single API call to Gemini with timeout via AbortController */
async function callGemini(prompt: string, timeoutMs = 55_000): Promise<string> {
  const model = getModel();

  // Race between API call and timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs);
  });

  try {
    const resultPromise = model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const result = await Promise.race([resultPromise, timeoutPromise]);

    const response = result.response;
    const text = response.text();
    return text;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Gemini] callGemini error:", msg);
    if (msg === "TIMEOUT") throw new Error("TIMEOUT");
    if (msg.includes("quota") || msg.includes("429")) throw new Error("QUOTA_EXCEEDED");
    if (msg.includes("blocked") || msg.includes("SAFETY")) {
      console.error("[Gemini] Response blocked by safety filter");
      throw new Error("SAFETY_BLOCKED");
    }
    throw new Error(`Gemini API error: ${msg}`);
  }
}

/** Analyze contract from extracted text (with retry) */
export async function analyzeContract(
  contractText: string,
  language = "English"
): Promise<AnalysisResult> {
  const prompt = GEMINI_PROMPT
    .replace(/\{\{LANGUAGE\}\}/g, language)
    .replace("{{CONTRACT_TEXT}}", contractText);

  const MAX_RETRIES = 1; // Only 1 retry to stay within timeout
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const responseText = await callGemini(prompt);
      return parseResponse(responseText);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[Gemini] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`, lastError.message);
      // Only retry on INVALID_JSON or EMPTY_RESPONSE
      if (lastError.message !== "INVALID_JSON" && lastError.message !== "EMPTY_RESPONSE") throw lastError;
      // Wait briefly before retry
      if (attempt < MAX_RETRIES) await new Promise(r => setTimeout(r, 500));
    }
  }

  throw lastError!;
}

/** Analyze contract directly from PDF buffer (for scanned/image PDFs, with retry) */
export async function analyzeContractFromPDF(
  pdfBuffer: Buffer,
  language = "English"
): Promise<AnalysisResult> {
  const model = getModel();

  const prompt = GEMINI_PROMPT
    .replace(/\{\{LANGUAGE\}\}/g, language)
    .replace("{{CONTRACT_TEXT}}", "[See attached PDF document]");

  const pdfBase64 = pdfBuffer.toString("base64");

  async function callPDF(): Promise<string> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("TIMEOUT")), 55_000);
    });

    try {
      const resultPromise = model.generateContent({
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
            { text: prompt },
          ],
        }],
      });

      const result = await Promise.race([resultPromise, timeoutPromise]);
      return result.response.text();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Gemini PDF] callPDF error:", msg);
      if (msg === "TIMEOUT") throw new Error("TIMEOUT");
      if (msg.includes("quota") || msg.includes("429")) throw new Error("QUOTA_EXCEEDED");
      throw new Error(`Gemini API error: ${msg}`);
    }
  }

  const MAX_RETRIES = 1;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const responseText = await callPDF();
      return parseResponse(responseText);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[Gemini PDF] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`, lastError.message);
      if (lastError.message !== "INVALID_JSON" && lastError.message !== "EMPTY_RESPONSE") throw lastError;
      if (attempt < MAX_RETRIES) await new Promise(r => setTimeout(r, 500));
    }
  }

  throw lastError!;
}
