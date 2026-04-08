import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import type {
  AnalysisResult,
  RiskItem,
  KeyDate,
  FinancialObligation,
  MissingClause,
  ActionItem,
} from "@/types";

// ── Font loading ──────────────────────────────────────────────────────────
// Cache font buffers in memory after first load
let fontRegularBuf: Buffer | null = null;
let fontBoldBuf: Buffer | null = null;

async function loadFont(name: string): Promise<Buffer> {
  // Try filesystem first (works locally)
  const candidates = [
    path.join(process.cwd(), "public", "fonts", name),
    path.join(process.cwd(), "src", "assets", "fonts", name),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p);
    } catch { /* ignore */ }
  }
  // Fetch from own public URL (works on Vercel)
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SUPABASE_URL
      ? "https://the-curator-virid.vercel.app"
      : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/fonts/${name}`);
  if (!res.ok) throw new Error(`Failed to fetch font: ${name} from ${baseUrl}`);
  return Buffer.from(await res.arrayBuffer());
}

async function getFonts(): Promise<{ regular: Buffer; bold: Buffer }> {
  if (!fontRegularBuf) fontRegularBuf = await loadFont("NotoSansKR-Regular.otf");
  if (!fontBoldBuf) fontBoldBuf = await loadFont("NotoSansKR-Bold.otf");
  return { regular: fontRegularBuf, bold: fontBoldBuf };
}

// ── Colors ─────────────────────────────────────────────────────────────────
const COLOR = {
  primary: "#00154f",
  error: "#ba1a1a",
  warning: "#7c5800",
  success: "#006d3b",
  dark: "#1c1b1f",
  muted: "#49454f",
  lightBg: "#f5f5f5",
  white: "#ffffff",
  divider: "#e6e6e6",
  dividerLight: "#dcdcdc",
  partyB: "#6B4C9A",
};

// ── Layout constants (A4 in points: 595.28 x 841.89) ──────────────────────
const MARGIN = 50;
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = PAGE_H - 40;
const SAFE_BOTTOM = FOOTER_Y - 30; // leave room for footer

// ── Helpers ────────────────────────────────────────────────────────────────

function severityColor(severity: string): string {
  if (severity === "high") return COLOR.error;
  if (severity === "medium") return COLOR.warning;
  return COLOR.success;
}

function severityLabel(severity: string): string {
  if (severity === "high") return "HIGH";
  if (severity === "medium") return "MEDIUM";
  return "LOW";
}

function priorityLabel(p: string): string {
  return p.charAt(0).toUpperCase() + p.slice(1);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Ensure enough vertical space; add new page if needed. Returns true if a page was added. */
function ensureSpace(doc: PDFKit.PDFDocument, needed: number): boolean {
  if (doc.y + needed > SAFE_BOTTOM) {
    doc.addPage();
    return true;
  }
  return false;
}

/**
 * Draw a section header with underline. Uses automatic flow.
 */
function sectionHeader(doc: PDFKit.PDFDocument, title: string): void {
  ensureSpace(doc, 36);
  doc.font("Bold").fontSize(16).fillColor(COLOR.primary);
  doc.text(title, { width: CONTENT_W });

  // Draw underline at current Y
  const lineY = doc.y + 2;
  doc
    .moveTo(MARGIN, lineY)
    .lineTo(PAGE_W - MARGIN, lineY)
    .strokeColor(COLOR.primary)
    .lineWidth(0.5)
    .stroke();

  doc.y = lineY + 8;
}

/**
 * Draw a gray background box with text inside.
 * Uses explicit positioning for the rect, then resets doc.y properly.
 */
function grayBox(
  doc: PDFKit.PDFDocument,
  text: string,
  opts?: { fontSize?: number; fillColor?: string; bgColor?: string }
): void {
  const fontSize = opts?.fontSize ?? 9;
  const fillColor = opts?.fillColor ?? COLOR.dark;
  const bgColor = opts?.bgColor ?? COLOR.lightBg;

  doc.font("Regular").fontSize(fontSize);
  const textH = doc.heightOfString(text, { width: CONTENT_W - 20, lineGap: 2 });
  const boxY = doc.y;
  const boxH = textH + 12;

  doc.save();
  doc.rect(MARGIN, boxY, CONTENT_W, boxH).fill(bgColor);
  doc.restore();

  doc.fillColor(fillColor);
  doc.text(text, MARGIN + 10, boxY + 6, { width: CONTENT_W - 20, lineGap: 2 });

  // Manually set Y after the box
  doc.y = boxY + boxH + 4;
  // Reset X back to margin (explicit x/y in text() changes doc.x)
  doc.x = MARGIN;
}

/**
 * Draw a colored box for before/after rewrites.
 */
function coloredBox(
  doc: PDFKit.PDFDocument,
  label: string,
  labelColor: string,
  body: string,
  bgColor: string
): void {
  doc.font("Regular").fontSize(8);
  const bodyH = doc.heightOfString(body, { width: CONTENT_W - 24, lineGap: 2 });
  const boxY = doc.y;
  const boxH = bodyH + 22;

  doc.save();
  doc.rect(MARGIN, boxY, CONTENT_W, boxH).fill(bgColor);
  doc.restore();

  doc.font("Bold").fontSize(7).fillColor(labelColor);
  doc.text(label, MARGIN + 8, boxY + 4, { width: CONTENT_W - 16 });

  doc.font("Regular").fontSize(8).fillColor(COLOR.dark);
  doc.text(body, MARGIN + 12, boxY + 16, { width: CONTENT_W - 24, lineGap: 2 });

  doc.y = boxY + boxH + 4;
  doc.x = MARGIN;
}

/**
 * Draw a horizontal divider line.
 */
function divider(doc: PDFKit.PDFDocument): void {
  const y = doc.y;
  doc
    .moveTo(MARGIN, y)
    .lineTo(PAGE_W - MARGIN, y)
    .strokeColor(COLOR.divider)
    .lineWidth(0.3)
    .stroke();
  doc.y = y + 8;
}

// ── Main generator ─────────────────────────────────────────────────────────

export async function generateContractPDF(contract: {
  title: string;
  type: string;
  created_at: string;
  risk_score: number;
  risk_high: boolean;
  result: AnalysisResult;
}): Promise<Buffer> {
  // Verify fonts exist
  if (!fs.existsSync(FONT_REGULAR) || !fs.existsSync(FONT_BOLD)) {
    throw new Error(
      `Korean fonts not found. Expected at:\n  ${FONT_REGULAR}\n  ${FONT_BOLD}`
    );
  }

  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: MARGIN,
        bufferPages: true,
        info: {
          Title: contract.title || "Contract Analysis Report",
          Author: "The Curator",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Load and register Korean fonts
      let fontsLoaded = false;
      try {
        const fonts = await getFonts();
        doc.registerFont("Regular", fonts.regular);
        doc.registerFont("Bold", fonts.bold);
        doc.font("Regular");
        fontsLoaded = true;
      } catch (fontErr) {
        console.error("[PDF] Font loading failed, using Helvetica:", fontErr);
        doc.registerFont("Regular", "Helvetica");
        doc.registerFont("Bold", "Helvetica-Bold");
        doc.font("Helvetica");
      }

      const result = contract.result;
      if (!result) {
        doc.fontSize(14).text("Analysis not yet complete.");
        doc.end();
        return;
      }
      const dateStr = formatDate(contract.created_at);

      // ═══════════════════════════════════════════════════════════════════
      // PAGE 1: COVER / SUMMARY
      // ═══════════════════════════════════════════════════════════════════

      try {
        // Brand header bar (absolute positioning OK for decorative rect)
        doc.save();
        doc.rect(0, 0, PAGE_W, 80).fill(COLOR.primary);
        doc.restore();

        doc
          .font("Bold")
          .fontSize(22)
          .fillColor(COLOR.white)
          .text("The Curator", MARGIN, 25, { width: CONTENT_W });

        doc
          .font("Regular")
          .fontSize(12)
          .fillColor(COLOR.white)
          .text("Contract Analysis Report", MARGIN, 50, { width: CONTENT_W });

        // Move below header bar
        doc.y = 100;
        doc.x = MARGIN;

        // Contract title — use automatic flow from here on
        doc.font("Bold").fontSize(20).fillColor(COLOR.dark);
        doc.text(contract.title || "Untitled Contract", { width: CONTENT_W });
        doc.moveDown(0.3);

        // Contract type badge (simple text, no complex rounded rect)
        const typeText = contract.type || result.contractType || "";
        if (typeText) {
          doc.font("Bold").fontSize(9).fillColor(COLOR.primary);
          doc.text(`[ ${typeText} ]`, { width: CONTENT_W });
          doc.moveDown(0.4);
        }

        // Date
        doc.font("Regular").fontSize(10).fillColor(COLOR.muted);
        doc.text(`Analyzed on ${dateStr}`, { width: CONTENT_W });
        doc.moveDown(1);

        // ── Scores (simple text layout, no complex card) ──────────────
        const riskScore = contract.risk_score ?? result.riskScore ?? 0;
        const riskColor =
          riskScore >= 70
            ? COLOR.error
            : riskScore >= 40
              ? COLOR.warning
              : COLOR.success;
        const riskLabel =
          riskScore >= 70
            ? "High Risk"
            : riskScore >= 40
              ? "Medium Risk"
              : "Low Risk";

        const fairness = result.fairnessScore ?? 50;
        const fairnessColor =
          fairness >= 40 && fairness <= 60
            ? COLOR.success
            : fairness >= 25 && fairness <= 75
              ? COLOR.warning
              : COLOR.error;
        const fairLabel =
          fairness >= 40 && fairness <= 60
            ? "Balanced"
            : fairness < 40
              ? "Favors Party A"
              : "Favors Party B";

        // Score cards as a gray box with text
        const scoreBoxY = doc.y;
        const scoreText = `Risk Score: ${riskScore}/100 (${riskLabel})    |    Fairness Score: ${fairness}/100 (${fairLabel})`;
        doc.font("Regular").fontSize(10);
        const scoreH = doc.heightOfString(scoreText, { width: CONTENT_W - 20 });
        const scoreBoxH = scoreH + 16;

        doc.save();
        doc.rect(MARGIN, scoreBoxY, CONTENT_W, scoreBoxH).fill(COLOR.lightBg);
        doc.restore();

        // Risk score part
        doc.font("Bold").fontSize(20).fillColor(riskColor);
        doc.text(`${riskScore}`, MARGIN + 15, scoreBoxY + 8, { continued: true, width: CONTENT_W / 2 - 20 });
        doc.font("Regular").fontSize(10).fillColor(COLOR.muted);
        doc.text(` /100  ${riskLabel}`, { continued: false });

        // Fairness score part
        doc.font("Bold").fontSize(20).fillColor(fairnessColor);
        doc.text(`${fairness}`, MARGIN + 15, scoreBoxY + 36, { continued: true, width: CONTENT_W / 2 - 20 });
        doc.font("Regular").fontSize(10).fillColor(COLOR.muted);
        doc.text(` /100  ${fairLabel}`, { continued: false });

        doc.y = scoreBoxY + Math.max(scoreBoxH, 64) + 12;
        doc.x = MARGIN;

        // ── Executive Summary ─────────────────────────────────────────
        sectionHeader(doc, "Executive Summary");

        if (result.summary) {
          grayBox(doc, result.summary, { fontSize: 10 });
        }

        // Fairness summary
        if (result.fairnessSummary) {
          doc.font("Regular").fontSize(9).fillColor(COLOR.muted);
          doc.text(result.fairnessSummary, { width: CONTENT_W, lineGap: 2 });
          doc.moveDown(0.5);
        }
      } catch (err) {
        console.error("[PDF] Error generating cover page:", err);
      }

      // ═══════════════════════════════════════════════════════════════════
      // RISK ANALYSIS
      // ═══════════════════════════════════════════════════════════════════

      const risks = result.risks ?? [];
      if (risks.length > 0) {
        try {
          doc.addPage();
          sectionHeader(
            doc,
            `Risk Analysis (${risks.length} risk${risks.length > 1 ? "s" : ""})`
          );

          for (let i = 0; i < risks.length; i++) {
            const risk: RiskItem = risks[i];
            ensureSpace(doc, 60);

            // Severity + Title on one line
            const sColor = severityColor(risk.severity);
            const sLabel = severityLabel(risk.severity);

            doc.font("Bold").fontSize(11).fillColor(sColor);
            doc.text(`[${sLabel}] `, { width: CONTENT_W, continued: true });
            doc.fillColor(COLOR.dark);
            doc.text(risk.title, { continued: false });
            doc.moveDown(0.3);

            // Clause (gray box)
            if (risk.clause) {
              ensureSpace(doc, 30);
              grayBox(doc, `"${risk.clause}"`, {
                fontSize: 9,
                fillColor: COLOR.muted,
              });
            }

            // Explanation
            if (risk.explanation) {
              ensureSpace(doc, 20);
              doc.font("Regular").fontSize(9).fillColor(COLOR.dark);
              doc.text(risk.explanation, { width: CONTENT_W, lineGap: 2 });
              doc.moveDown(0.3);
            }

            // General Suggestion / Advice
            if (risk.suggestion) {
              ensureSpace(doc, 20);
              doc.font("Bold").fontSize(9).fillColor(COLOR.success);
              doc.text("[Advice]", { width: CONTENT_W });
              doc.font("Regular").fontSize(9).fillColor(COLOR.dark);
              doc.text(risk.suggestion, { width: CONTENT_W, indent: 10, lineGap: 2 });
              doc.moveDown(0.3);
            }

            // Party A Advice
            if (risk.suggestion_party_a) {
              ensureSpace(doc, 20);
              const partyAName = result.parties?.[0]?.name || "Party A";
              doc.font("Bold").fontSize(9).fillColor(COLOR.primary);
              doc.text(`[A] ${partyAName} Advice:`, { width: CONTENT_W });
              doc.font("Regular").fontSize(9).fillColor(COLOR.dark);
              doc.text(risk.suggestion_party_a, { width: CONTENT_W, indent: 10, lineGap: 2 });
              doc.moveDown(0.3);
            }

            // Party B Advice
            if (risk.suggestion_party_b) {
              ensureSpace(doc, 20);
              const partyBName = result.parties?.[1]?.name || "Party B";
              doc.font("Bold").fontSize(9).fillColor(COLOR.partyB);
              doc.text(`[B] ${partyBName} Advice:`, { width: CONTENT_W });
              doc.font("Regular").fontSize(9).fillColor(COLOR.dark);
              doc.text(risk.suggestion_party_b, { width: CONTENT_W, indent: 10, lineGap: 2 });
              doc.moveDown(0.3);
            }

            // Suggested Rewrite / Addition
            if (risk.rewrite) {
              ensureSpace(doc, 60);

              const isAdd = risk.rewrite_type === "add";
              doc.font("Bold").fontSize(9).fillColor(COLOR.primary);
              doc.text(isAdd ? "Suggested Addition:" : "Suggested Rewrite:", { width: CONTENT_W });
              doc.moveDown(0.2);

              if (!isAdd && risk.clause) {
                // BEFORE box
                ensureSpace(doc, 30);
                coloredBox(doc, "BEFORE (Original)", COLOR.error, risk.clause, "#fff5f5");
              }

              // AFTER — Balanced
              ensureSpace(doc, 30);
              coloredBox(doc, isAdd ? "NEW CLAUSE (Balanced)" : "AFTER (Balanced)", COLOR.success, risk.rewrite, "#f0f4ff");

              // Party A version
              if (risk.rewrite_party_a) {
                ensureSpace(doc, 30);
                const paName = result.parties?.[0]?.name || "Party A";
                coloredBox(doc, isAdd ? `NEW CLAUSE (Favors ${paName})` : `AFTER (Favors ${paName})`, COLOR.primary, risk.rewrite_party_a, "#f5f5ff");
              }

              // Party B version
              if (risk.rewrite_party_b) {
                ensureSpace(doc, 30);
                const pbName = result.parties?.[1]?.name || "Party B";
                coloredBox(doc, isAdd ? `NEW CLAUSE (Favors ${pbName})` : `AFTER (Favors ${pbName})`, COLOR.partyB, risk.rewrite_party_b, "#faf5ff");
              }
            }

            // Divider between risks
            if (i < risks.length - 1) {
              ensureSpace(doc, 12);
              doc.moveDown(0.3);
              divider(doc);
            }
          }
        } catch (err) {
          console.error("[PDF] Error generating risk analysis:", err);
        }
      }

      // ═══════════════════════════════════════════════════════════════════
      // KEY DATES
      // ═══════════════════════════════════════════════════════════════════

      const keyDates = result.keyDates ?? [];
      if (keyDates.length > 0) {
        try {
          doc.addPage();
          sectionHeader(doc, "Key Dates");

          for (const kd of keyDates) {
            ensureSpace(doc, 20);

            const impColor =
              kd.importance === "critical" ? COLOR.error : COLOR.muted;
            const impTag =
              kd.importance === "critical" ? "[CRITICAL]" : "[Notable]";

            doc.font("Bold").fontSize(9).fillColor(impColor);
            doc.text(impTag, { width: CONTENT_W, continued: true });

            doc.font("Bold").fontSize(9).fillColor(COLOR.dark);
            doc.text(` ${kd.label}: `, { continued: true });

            doc.font("Regular").fontSize(9).fillColor(COLOR.muted);
            doc.text(kd.date, { continued: false });

            doc.moveDown(0.3);
          }

          doc.moveDown(1);
        } catch (err) {
          console.error("[PDF] Error generating key dates:", err);
        }
      }

      // ═══════════════════════════════════════════════════════════════════
      // FINANCIAL OBLIGATIONS
      // ═══════════════════════════════════════════════════════════════════

      const financials = result.financialObligations ?? [];
      if (financials.length > 0) {
        try {
          ensureSpace(doc, 80);
          sectionHeader(doc, "Financial Obligations");

          for (const fo of financials) {
            ensureSpace(doc, 30);

            doc.font("Bold").fontSize(9).fillColor(COLOR.dark);
            doc.text(fo.description, { width: CONTENT_W });

            const details: string[] = [];
            if (fo.amount) details.push(`Amount: ${fo.amount}`);
            if (fo.party) details.push(`Party: ${fo.party}`);
            if (fo.condition) details.push(`Condition: ${fo.condition}`);

            doc.font("Regular").fontSize(8).fillColor(COLOR.muted);
            doc.text(details.join("  |  "), { width: CONTENT_W, indent: 10 });
            doc.moveDown(0.5);
          }

          doc.moveDown(0.5);
        } catch (err) {
          console.error("[PDF] Error generating financial obligations:", err);
        }
      }

      // ═══════════════════════════════════════════════════════════════════
      // MISSING CLAUSES
      // ═══════════════════════════════════════════════════════════════════

      const missing = result.missingClauses ?? [];
      if (missing.length > 0) {
        try {
          doc.addPage();
          sectionHeader(doc, "Missing Clauses");

          for (const mc of missing) {
            ensureSpace(doc, 40);

            const impColor =
              mc.importance === "high" ? COLOR.error : COLOR.warning;
            const impTag = mc.importance === "high" ? "[HIGH]" : "[MEDIUM]";

            doc.font("Bold").fontSize(10).fillColor(impColor);
            doc.text(impTag, { width: CONTENT_W, continued: true });

            doc.fillColor(COLOR.dark);
            doc.text(` ${mc.title}`, { continued: false });

            doc.font("Regular").fontSize(9).fillColor(COLOR.muted);
            doc.text(mc.reason, { width: CONTENT_W, indent: 10, lineGap: 2 });
            doc.moveDown(0.5);
          }

          doc.moveDown(0.5);
        } catch (err) {
          console.error("[PDF] Error generating missing clauses:", err);
        }
      }

      // ═══════════════════════════════════════════════════════════════════
      // ACTION ITEMS
      // ═══════════════════════════════════════════════════════════════════

      const actions = result.actionItems ?? [];
      if (actions.length > 0) {
        try {
          ensureSpace(doc, 80);
          sectionHeader(doc, "Action Items");

          // Sort by priority: high -> medium -> low
          const priorityOrder: Record<string, number> = {
            high: 0,
            medium: 1,
            low: 2,
          };
          const sorted = [...actions].sort(
            (a, b) =>
              (priorityOrder[a.priority] ?? 2) -
              (priorityOrder[b.priority] ?? 2)
          );

          for (const ai of sorted) {
            ensureSpace(doc, 30);

            const pColor = severityColor(ai.priority);

            doc.font("Bold").fontSize(9).fillColor(pColor);
            doc.text(`[${priorityLabel(ai.priority)}] `, { width: CONTENT_W, continued: true });

            doc.fillColor(COLOR.dark);
            doc.text(ai.action, { continued: false });

            // Meta line
            const meta: string[] = [];
            if (ai.party) meta.push(`Party: ${ai.party}`);
            if (ai.deadline) meta.push(`Deadline: ${ai.deadline}`);

            if (meta.length > 0) {
              doc.font("Regular").fontSize(8).fillColor(COLOR.muted);
              doc.text(meta.join("  |  "), { width: CONTENT_W, indent: 10 });
            }

            doc.moveDown(0.5);
          }
        } catch (err) {
          console.error("[PDF] Error generating action items:", err);
        }
      }

      // ═══════════════════════════════════════════════════════════════════
      // FOOTERS (drawn on every page using buffered pages)
      // ═══════════════════════════════════════════════════════════════════

      try {
        const totalPages = doc.bufferedPageRange().count;
        for (let i = 0; i < totalPages; i++) {
          doc.switchToPage(i);

          // Footer line
          doc
            .moveTo(MARGIN, FOOTER_Y)
            .lineTo(PAGE_W - MARGIN, FOOTER_Y)
            .strokeColor(COLOR.dividerLight)
            .lineWidth(0.3)
            .stroke();

          // Page number (left)
          doc
            .font("Regular")
            .fontSize(7)
            .fillColor(COLOR.muted)
            .text(`Page ${i + 1} of ${totalPages}`, MARGIN, FOOTER_Y + 6, {
              width: CONTENT_W / 3,
              align: "left",
              lineBreak: false,
            });

          // Generated by (center)
          doc
            .font("Regular")
            .fontSize(7)
            .fillColor(COLOR.muted)
            .text(
              `Generated by The Curator \u00B7 ${dateStr}`,
              MARGIN + CONTENT_W / 3,
              FOOTER_Y + 6,
              {
                width: CONTENT_W / 3,
                align: "center",
                lineBreak: false,
              }
            );

          // Disclaimer (right)
          doc
            .font("Regular")
            .fontSize(7)
            .fillColor(COLOR.muted)
            .text(
              "For informational purposes only \u2014 not legal advice.",
              MARGIN + (CONTENT_W * 2) / 3,
              FOOTER_Y + 6,
              {
                width: CONTENT_W / 3,
                align: "right",
                lineBreak: false,
              }
            );
        }
      } catch (err) {
        console.error("[PDF] Error generating footers:", err);
      }

      // Finalize
      doc.end();
    } catch (err) {
      console.error("[PDF] Fatal error generating PDF:", err);
      reject(err);
    }
  });
}
