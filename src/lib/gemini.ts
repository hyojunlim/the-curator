import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_PROMPT } from "./prompts";
import type { AnalysisResult } from "@/types";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0,
    },
  });
}

function parseResponse(responseText: string): AnalysisResult {
  if (!responseText || responseText.trim().length === 0) {
    throw new Error("Empty response from Gemini API");
  }

  const cleaned = responseText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: AnalysisResult;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("INVALID_JSON");
  }

  if (!parsed.summary || !Array.isArray(parsed.risks)) {
    throw new Error("INVALID_JSON");
  }

  if (!Array.isArray(parsed.parties)) {
    parsed.parties = [
      { role: "party_a" as const, name: "Party A", description: "First party" },
      { role: "party_b" as const, name: "Party B", description: "Second party" },
    ];
  }

  return parsed;
}

/** Analyze contract from extracted text */
export async function analyzeContract(
  contractText: string,
  language = "English"
): Promise<AnalysisResult> {
  const model = getModel();

  const prompt = GEMINI_PROMPT
    .replace("{{LANGUAGE}}", language)
    .replace("{{CONTRACT_TEXT}}", contractText);

  let responseText: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }, { signal: controller.signal } as never);

    clearTimeout(timeout);
    responseText = result.response.text();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort") || msg.includes("AbortError")) throw new Error("TIMEOUT");
    if (msg.includes("quota") || msg.includes("429")) throw new Error("QUOTA_EXCEEDED");
    throw new Error(`Gemini API error: ${msg}`);
  }

  return parseResponse(responseText);
}

/** Analyze contract directly from PDF buffer (for scanned/image PDFs) */
export async function analyzeContractFromPDF(
  pdfBuffer: Buffer,
  language = "English"
): Promise<AnalysisResult> {
  const model = getModel();

  const prompt = GEMINI_PROMPT
    .replace("{{LANGUAGE}}", language)
    .replace("{{CONTRACT_TEXT}}", "[See attached PDF document]");

  const pdfBase64 = pdfBuffer.toString("base64");

  let responseText: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000); // longer timeout for PDF

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: pdfBase64,
            },
          },
          { text: prompt },
        ],
      }],
    }, { signal: controller.signal } as never);

    clearTimeout(timeout);
    responseText = result.response.text();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort") || msg.includes("AbortError")) throw new Error("TIMEOUT");
    if (msg.includes("quota") || msg.includes("429")) throw new Error("QUOTA_EXCEEDED");
    throw new Error(`Gemini API error: ${msg}`);
  }

  return parseResponse(responseText);
}
