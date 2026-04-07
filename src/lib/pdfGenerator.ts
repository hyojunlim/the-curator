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

// ── Font paths ─────────────────────────────────────────────────────────────
const FONT_DIR = path.join(process.cwd(), "public", "fonts");
const FONT_REGULAR = path.join(FONT_DIR, "NotoSansKR-Regular.otf");
const FONT_BOLD = path.join(FONT_DIR, "NotoSansKR-Bold.otf");

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
};

// ── Layout constants (A4 in points: 595.28 x 841.89) ──────────────────────
const MARGIN = 50;
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const CONTENT_W = PAGE_W - MARGIN * 2;
const SAFE_BOTTOM = 750; // trigger page break before this Y

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

/** Check page space; add a new page if needed. */
function ensureSpace(doc: PDFKit.PDFDocument, needed: number): void {
  if (doc.y + needed > SAFE_BOTTOM) {
    doc.addPage();
  }
}

/** Draw a section header with an underline. */
function sectionHeader(doc: PDFKit.PDFDocument, title: string): void {
  ensureSpace(doc, 30);
  doc
    .font("Bold")
    .fontSize(16)
    .fillColor(COLOR.primary)
    .text(title, MARGIN, doc.y, { width: CONTENT_W });

  const lineY = doc.y + 2;
  doc
    .moveTo(MARGIN, lineY)
    .lineTo(PAGE_W - MARGIN, lineY)
    .strokeColor(COLOR.primary)
    .lineWidth(0.5)
    .stroke();

  doc.y = lineY + 8;
}

/** Draw body text block. */
function bodyText(doc: PDFKit.PDFDocument, text: string): void {
  doc
    .font("Regular")
    .fontSize(10)
    .fillColor(COLOR.dark)
    .text(text, MARGIN, doc.y, { width: CONTENT_W, lineGap: 2 });
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

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: MARGIN,
      bufferPages: true, // needed for footer pass
      info: {
        Title: contract.title || "Contract Analysis Report",
        Author: "The Curator",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Register Korean fonts
    doc.registerFont("Regular", FONT_REGULAR);
    doc.registerFont("Bold", FONT_BOLD);
    doc.font("Regular");

    const result = contract.result;
    const dateStr = formatDate(contract.created_at);

    // ═════════════════════════════════════════════════════════════════════════
    // PAGE 1: COVER / SUMMARY
    // ═════════════════════════════════════════════════════════════════════════

    // Brand header bar
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

    doc.y = 100;

    // Contract title
    doc
      .font("Bold")
      .fontSize(20)
      .fillColor(COLOR.dark)
      .text(contract.title || "Untitled Contract", MARGIN, doc.y, {
        width: CONTENT_W,
      });

    doc.y += 6;

    // Contract type badge
    const typeText = contract.type || result.contractType || "";
    if (typeText) {
      const badgeY = doc.y;
      const badgeTextW = doc.font("Bold").fontSize(9).widthOfString(typeText);
      const badgePadX = 10;
      const badgeH = 18;
      const badgeW = badgeTextW + badgePadX * 2;

      doc.save();
      doc
        .roundedRect(MARGIN, badgeY, badgeW, badgeH, 4)
        .fill(COLOR.lightBg);
      doc.restore();

      doc
        .font("Bold")
        .fontSize(9)
        .fillColor(COLOR.primary)
        .text(typeText, MARGIN + badgePadX, badgeY + 5);

      doc.y = badgeY + badgeH + 8;
    }

    // Date
    doc
      .font("Regular")
      .fontSize(10)
      .fillColor(COLOR.muted)
      .text(`Analyzed on ${dateStr}`, MARGIN, doc.y, { width: CONTENT_W });

    doc.y += 16;

    // ── Score cards row ──────────────────────────────────────────────────
    const cardGap = 20;
    const cardW = (CONTENT_W - cardGap) / 2;
    const cardH = 80;
    const cardX1 = MARGIN;
    const cardX2 = MARGIN + cardW + cardGap;
    const cardY = doc.y;

    // Risk score card
    doc.save();
    doc.roundedRect(cardX1, cardY, cardW, cardH, 6).fill(COLOR.lightBg);
    doc.restore();

    doc
      .font("Bold")
      .fontSize(9)
      .fillColor(COLOR.muted)
      .text("RISK SCORE", cardX1, cardY + 10, {
        width: cardW,
        align: "center",
      });

    const riskScore = contract.risk_score ?? result.riskScore ?? 0;
    const riskColor =
      riskScore >= 70
        ? COLOR.error
        : riskScore >= 40
          ? COLOR.warning
          : COLOR.success;

    doc
      .font("Bold")
      .fontSize(28)
      .fillColor(riskColor)
      .text(`${riskScore}`, cardX1, cardY + 26, {
        width: cardW,
        align: "center",
      });

    const riskLabel =
      riskScore >= 70
        ? "High Risk"
        : riskScore >= 40
          ? "Medium Risk"
          : "Low Risk";
    doc
      .font("Regular")
      .fontSize(9)
      .fillColor(riskColor)
      .text(riskLabel, cardX1, cardY + 58, {
        width: cardW,
        align: "center",
      });

    // Fairness score card
    doc.save();
    doc.roundedRect(cardX2, cardY, cardW, cardH, 6).fill(COLOR.lightBg);
    doc.restore();

    doc
      .font("Bold")
      .fontSize(9)
      .fillColor(COLOR.muted)
      .text("FAIRNESS SCORE", cardX2, cardY + 10, {
        width: cardW,
        align: "center",
      });

    const fairness = result.fairnessScore ?? 50;
    const fairnessColor =
      fairness >= 40 && fairness <= 60
        ? COLOR.success
        : fairness >= 25 && fairness <= 75
          ? COLOR.warning
          : COLOR.error;

    doc
      .font("Bold")
      .fontSize(28)
      .fillColor(fairnessColor)
      .text(`${fairness}`, cardX2, cardY + 26, {
        width: cardW,
        align: "center",
      });

    const fairLabel =
      fairness >= 40 && fairness <= 60
        ? "Balanced"
        : fairness < 40
          ? "Favors Party A"
          : "Favors Party B";
    doc
      .font("Regular")
      .fontSize(9)
      .fillColor(fairnessColor)
      .text(fairLabel, cardX2, cardY + 58, {
        width: cardW,
        align: "center",
      });

    doc.y = cardY + cardH + 20;

    // Executive summary
    sectionHeader(doc, "Executive Summary");
    if (result.summary) {
      // Light gray background box for summary
      const summaryY = doc.y;
      const summaryHeight = doc
        .font("Regular")
        .fontSize(10)
        .heightOfString(result.summary, { width: CONTENT_W - 20, lineGap: 2 });

      doc.save();
      doc
        .roundedRect(
          MARGIN,
          summaryY - 4,
          CONTENT_W,
          summaryHeight + 16,
          4
        )
        .fill(COLOR.lightBg);
      doc.restore();

      doc
        .font("Regular")
        .fontSize(10)
        .fillColor(COLOR.dark)
        .text(result.summary, MARGIN + 10, summaryY + 4, {
          width: CONTENT_W - 20,
          lineGap: 2,
        });
    }

    // Fairness summary
    if (result.fairnessSummary) {
      doc.y += 6;
      doc
        .font("Regular")
        .fontSize(9)
        .fillColor(COLOR.muted)
        .text(result.fairnessSummary, MARGIN, doc.y, {
          width: CONTENT_W,
          lineGap: 2,
        });
    }

    // ═════════════════════════════════════════════════════════════════════════
    // RISK ANALYSIS
    // ═════════════════════════════════════════════════════════════════════════

    const risks = result.risks ?? [];
    if (risks.length > 0) {
      doc.addPage();

      sectionHeader(
        doc,
        `Risk Analysis (${risks.length} risk${risks.length > 1 ? "s" : ""})`
      );

      for (let i = 0; i < risks.length; i++) {
        const risk: RiskItem = risks[i];
        ensureSpace(doc, 60);

        const rowStartY = doc.y;

        // Severity badge
        const sColor = severityColor(risk.severity);
        const sLabel = severityLabel(risk.severity);
        const badgeTextW = doc
          .font("Bold")
          .fontSize(8)
          .widthOfString(sLabel);
        const badgePad = 8;
        const badgeW = badgeTextW + badgePad * 2;
        const badgeH = 14;

        doc.save();
        doc
          .roundedRect(MARGIN, rowStartY, badgeW, badgeH, 3)
          .fill(sColor);
        doc.restore();

        doc
          .font("Bold")
          .fontSize(8)
          .fillColor(COLOR.white)
          .text(sLabel, MARGIN + badgePad, rowStartY + 3);

        // Risk title (same line as badge)
        doc
          .font("Bold")
          .fontSize(11)
          .fillColor(COLOR.dark)
          .text(risk.title, MARGIN + badgeW + 8, rowStartY + 1, {
            width: CONTENT_W - badgeW - 8,
          });

        doc.y = Math.max(doc.y, rowStartY + badgeH) + 4;

        // Clause (quoted, gray background box)
        if (risk.clause) {
          ensureSpace(doc, 30);
          const clauseText = `"${risk.clause}"`;
          const clauseHeight = doc
            .font("Regular")
            .fontSize(9)
            .heightOfString(clauseText, { width: CONTENT_W - 20, lineGap: 2 });

          const clauseBoxY = doc.y;
          doc.save();
          doc
            .roundedRect(
              MARGIN,
              clauseBoxY,
              CONTENT_W,
              clauseHeight + 12,
              3
            )
            .fill(COLOR.lightBg);
          doc.restore();

          doc
            .font("Regular")
            .fontSize(9)
            .fillColor(COLOR.muted)
            .text(clauseText, MARGIN + 10, clauseBoxY + 6, {
              width: CONTENT_W - 20,
              lineGap: 2,
            });

          doc.y += 4;
        }

        // Explanation
        if (risk.explanation) {
          ensureSpace(doc, 20);
          doc
            .font("Regular")
            .fontSize(9)
            .fillColor(COLOR.dark)
            .text(risk.explanation, MARGIN, doc.y, {
              width: CONTENT_W,
              lineGap: 2,
            });
          doc.y += 4;
        }

        // General Suggestion
        if (risk.suggestion) {
          ensureSpace(doc, 20);
          doc.font("Bold").fontSize(9).fillColor(COLOR.success).text("[Advice]", MARGIN, doc.y, { width: CONTENT_W });
          doc.font("Regular").fontSize(9).fillColor(COLOR.dark).text(risk.suggestion, MARGIN + 10, doc.y, { width: CONTENT_W - 10, lineGap: 2 });
          doc.y += 4;
        }

        // Party A Advice
        if (risk.suggestion_party_a) {
          ensureSpace(doc, 20);
          const partyAName = result.parties?.[0]?.name || "Party A";
          doc.font("Bold").fontSize(9).fillColor(COLOR.primary).text(`[A] ${partyAName} Advice:`, MARGIN, doc.y, { width: CONTENT_W });
          doc.font("Regular").fontSize(9).fillColor(COLOR.dark).text(risk.suggestion_party_a, MARGIN + 10, doc.y, { width: CONTENT_W - 10, lineGap: 2 });
          doc.y += 4;
        }

        // Party B Advice
        if (risk.suggestion_party_b) {
          ensureSpace(doc, 20);
          const partyBName = result.parties?.[1]?.name || "Party B";
          doc.font("Bold").fontSize(9).fillColor("#6B4C9A").text(`[B] ${partyBName} Advice:`, MARGIN, doc.y, { width: CONTENT_W });
          doc.font("Regular").fontSize(9).fillColor(COLOR.dark).text(risk.suggestion_party_b, MARGIN + 10, doc.y, { width: CONTENT_W - 10, lineGap: 2 });
          doc.y += 4;
        }

        // Suggested Rewrite — Before/After with all 3 versions
        if (risk.rewrite && risk.clause) {
          ensureSpace(doc, 60);

          doc.font("Bold").fontSize(9).fillColor(COLOR.primary).text("Suggested Rewrite", MARGIN, doc.y, { width: CONTENT_W });
          doc.y += 2;

          // Before (original clause)
          const beforeH = doc.font("Regular").fontSize(8).heightOfString(risk.clause, { width: CONTENT_W - 24, lineGap: 2 });
          const beforeY = doc.y;
          doc.save();
          doc.roundedRect(MARGIN, beforeY, CONTENT_W, beforeH + 20, 3).fill("#fff5f5");
          doc.restore();
          doc.font("Bold").fontSize(7).fillColor(COLOR.error).text("X BEFORE (Original)", MARGIN + 8, beforeY + 4, { width: CONTENT_W - 16 });
          doc.font("Regular").fontSize(8).fillColor(COLOR.muted).text(risk.clause, MARGIN + 12, doc.y + 2, { width: CONTENT_W - 24, lineGap: 2 });
          doc.y += 4;

          // After — Balanced
          const afterH = doc.font("Regular").fontSize(8).heightOfString(risk.rewrite, { width: CONTENT_W - 24, lineGap: 2 });
          const afterY = doc.y;
          doc.save();
          doc.roundedRect(MARGIN, afterY, CONTENT_W, afterH + 20, 3).fill("#f0f4ff");
          doc.restore();
          doc.font("Bold").fontSize(7).fillColor(COLOR.success).text("V AFTER (Balanced)", MARGIN + 8, afterY + 4, { width: CONTENT_W - 16 });
          doc.font("Regular").fontSize(8).fillColor(COLOR.dark).text(risk.rewrite, MARGIN + 12, doc.y + 2, { width: CONTENT_W - 24, lineGap: 2 });
          doc.y += 4;

          // Party A version
          if (risk.rewrite_party_a) {
            ensureSpace(doc, 30);
            const paH = doc.font("Regular").fontSize(8).heightOfString(risk.rewrite_party_a, { width: CONTENT_W - 24, lineGap: 2 });
            const paY = doc.y;
            doc.save();
            doc.roundedRect(MARGIN, paY, CONTENT_W, paH + 20, 3).fill("#f5f5ff");
            doc.restore();
            const paName = result.parties?.[0]?.name || "Party A";
            doc.font("Bold").fontSize(7).fillColor(COLOR.primary).text(`V AFTER (Favors ${paName})`, MARGIN + 8, paY + 4, { width: CONTENT_W - 16 });
            doc.font("Regular").fontSize(8).fillColor(COLOR.dark).text(risk.rewrite_party_a, MARGIN + 12, doc.y + 2, { width: CONTENT_W - 24, lineGap: 2 });
            doc.y += 4;
          }

          // Party B version
          if (risk.rewrite_party_b) {
            ensureSpace(doc, 30);
            const pbH = doc.font("Regular").fontSize(8).heightOfString(risk.rewrite_party_b, { width: CONTENT_W - 24, lineGap: 2 });
            const pbY = doc.y;
            doc.save();
            doc.roundedRect(MARGIN, pbY, CONTENT_W, pbH + 20, 3).fill("#faf5ff");
            doc.restore();
            const pbName = result.parties?.[1]?.name || "Party B";
            doc.font("Bold").fontSize(7).fillColor("#6B4C9A").text(`V AFTER (Favors ${pbName})`, MARGIN + 8, pbY + 4, { width: CONTENT_W - 16 });
            doc.font("Regular").fontSize(8).fillColor(COLOR.dark).text(risk.rewrite_party_b, MARGIN + 12, doc.y + 2, { width: CONTENT_W - 24, lineGap: 2 });
            doc.y += 6;
          }
        }

        // Divider between risks
        if (i < risks.length - 1) {
          ensureSpace(doc, 12);
          const divY = doc.y + 2;
          doc
            .moveTo(MARGIN, divY)
            .lineTo(PAGE_W - MARGIN, divY)
            .strokeColor(COLOR.divider)
            .lineWidth(0.3)
            .stroke();
          doc.y = divY + 10;
        }
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // KEY DATES & FINANCIAL OBLIGATIONS
    // ═════════════════════════════════════════════════════════════════════════

    const keyDates = result.keyDates ?? [];
    const financials = result.financialObligations ?? [];

    if (keyDates.length > 0 || financials.length > 0) {
      doc.addPage();

      // Key Dates table
      if (keyDates.length > 0) {
        sectionHeader(doc, "Key Dates");

        const col1 = MARGIN;
        const col2W = 150;
        const col3W = 100;
        const col1W = CONTENT_W - col2W - col3W;
        const col2 = MARGIN + col1W;
        const col3 = col2 + col2W;
        const rowH = 22;

        // Table header
        const headerY = doc.y;
        doc.save();
        doc
          .roundedRect(MARGIN, headerY, CONTENT_W, rowH, 3)
          .fill(COLOR.primary);
        doc.restore();

        doc.font("Bold").fontSize(8).fillColor(COLOR.white);
        doc.text("LABEL", col1 + 8, headerY + 7);
        doc.text("DATE", col2 + 8, headerY + 7);
        doc.text("IMPORTANCE", col3 + 8, headerY + 7);
        doc.y = headerY + rowH;

        for (const kd of keyDates) {
          ensureSpace(doc, 20);
          const ry = doc.y + 2;

          doc.font("Regular").fontSize(9).fillColor(COLOR.dark);
          doc.text(kd.label, col1 + 8, ry, { width: col1W - 12 });
          doc.text(kd.date, col2 + 8, ry, { width: col2W - 12 });

          const impColor =
            kd.importance === "critical" ? COLOR.error : COLOR.muted;
          const impText =
            kd.importance === "critical" ? "Critical" : "Notable";
          doc.font("Bold").fontSize(9).fillColor(impColor);
          doc.text(impText, col3 + 8, ry, { width: col3W - 12 });

          doc.y = ry + 14;

          // Row divider
          doc
            .moveTo(MARGIN, doc.y)
            .lineTo(PAGE_W - MARGIN, doc.y)
            .strokeColor(COLOR.divider)
            .lineWidth(0.2)
            .stroke();

          doc.y += 2;
        }

        doc.y += 12;
      }

      // Financial Obligations table
      if (financials.length > 0) {
        sectionHeader(doc, "Financial Obligations");

        const fCol1W = 140;
        const fCol2W = 100;
        const fCol3W = 80;
        const fCol4W = CONTENT_W - fCol1W - fCol2W - fCol3W;
        const fCol1 = MARGIN;
        const fCol2 = fCol1 + fCol1W;
        const fCol3 = fCol2 + fCol2W;
        const fCol4 = fCol3 + fCol3W;
        const rowH = 22;

        // Table header
        const headerY = doc.y;
        doc.save();
        doc
          .roundedRect(MARGIN, headerY, CONTENT_W, rowH, 3)
          .fill(COLOR.primary);
        doc.restore();

        doc.font("Bold").fontSize(8).fillColor(COLOR.white);
        doc.text("DESCRIPTION", fCol1 + 8, headerY + 7);
        doc.text("AMOUNT", fCol2 + 8, headerY + 7);
        doc.text("PARTY", fCol3 + 8, headerY + 7);
        doc.text("CONDITION", fCol4 + 8, headerY + 7);
        doc.y = headerY + rowH;

        for (const fo of financials) {
          ensureSpace(doc, 30);
          const ry = doc.y + 2;

          doc.font("Regular").fontSize(8).fillColor(COLOR.dark);

          // Calculate heights to handle wrapping
          const descH = doc.heightOfString(fo.description, {
            width: fCol1W - 16,
          });
          const amtH = doc.heightOfString(fo.amount, {
            width: fCol2W - 16,
          });
          const condText = fo.condition || "-";
          const condH = doc.heightOfString(condText, {
            width: fCol4W - 16,
          });
          const maxH = Math.max(descH, amtH, condH, 12);

          doc.text(fo.description, fCol1 + 8, ry, { width: fCol1W - 16 });
          doc.text(fo.amount, fCol2 + 8, ry, { width: fCol2W - 16 });
          doc.text(fo.party, fCol3 + 8, ry, { width: fCol3W - 16 });
          doc.text(condText, fCol4 + 8, ry, { width: fCol4W - 16 });

          doc.y = ry + maxH + 6;

          // Row divider
          doc
            .moveTo(MARGIN, doc.y)
            .lineTo(PAGE_W - MARGIN, doc.y)
            .strokeColor(COLOR.divider)
            .lineWidth(0.2)
            .stroke();

          doc.y += 2;
        }

        doc.y += 12;
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // MISSING CLAUSES & ACTION ITEMS
    // ═════════════════════════════════════════════════════════════════════════

    const missing = result.missingClauses ?? [];
    const actions = result.actionItems ?? [];

    if (missing.length > 0 || actions.length > 0) {
      doc.addPage();

      // Missing Clauses
      if (missing.length > 0) {
        sectionHeader(doc, "Missing Clauses");

        for (const mc of missing) {
          ensureSpace(doc, 40);

          const mcY = doc.y;

          // Importance badge
          const impColor =
            mc.importance === "high" ? COLOR.error : COLOR.warning;
          const impLabel = mc.importance === "high" ? "HIGH" : "MEDIUM";
          const impTextW = doc
            .font("Bold")
            .fontSize(7)
            .widthOfString(impLabel);
          const impBadgeW = impTextW + 10;
          const impBadgeH = 13;

          doc.save();
          doc
            .roundedRect(MARGIN, mcY, impBadgeW, impBadgeH, 3)
            .fill(impColor);
          doc.restore();

          doc
            .font("Bold")
            .fontSize(7)
            .fillColor(COLOR.white)
            .text(impLabel, MARGIN + 5, mcY + 3);

          // Title
          doc
            .font("Bold")
            .fontSize(10)
            .fillColor(COLOR.dark)
            .text(mc.title, MARGIN + impBadgeW + 8, mcY + 1, {
              width: CONTENT_W - impBadgeW - 8,
            });

          doc.y = Math.max(doc.y, mcY + impBadgeH) + 4;

          // Reason
          doc
            .font("Regular")
            .fontSize(9)
            .fillColor(COLOR.muted)
            .text(mc.reason, MARGIN, doc.y, {
              width: CONTENT_W,
              lineGap: 2,
            });

          doc.y += 8;
        }

        doc.y += 6;
      }

      // Action Items
      if (actions.length > 0) {
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

        sectionHeader(doc, "Action Items");

        for (const ai of sorted) {
          ensureSpace(doc, 30);

          const aiY = doc.y;

          // Priority indicator circle
          const pColor = severityColor(ai.priority);
          doc.save();
          doc.circle(MARGIN + 5, aiY + 4, 4).fill(pColor);
          doc.restore();

          // Action text
          doc
            .font("Bold")
            .fontSize(9)
            .fillColor(COLOR.dark)
            .text(ai.action, MARGIN + 16, aiY, {
              width: CONTENT_W - 16,
              lineGap: 2,
            });

          // Meta line (party, deadline, priority)
          const meta: string[] = [];
          if (ai.party) meta.push(`Party: ${ai.party}`);
          if (ai.deadline) meta.push(`Deadline: ${ai.deadline}`);
          meta.push(`Priority: ${priorityLabel(ai.priority)}`);

          doc
            .font("Regular")
            .fontSize(8)
            .fillColor(COLOR.muted)
            .text(meta.join("  |  "), MARGIN + 16, doc.y + 2, {
              width: CONTENT_W - 16,
            });

          doc.y += 10;
        }
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // FOOTERS (drawn on every page using buffered pages)
    // ═════════════════════════════════════════════════════════════════════════

    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);

      const footerY = PAGE_H - 40;

      // Footer line
      doc
        .moveTo(MARGIN, footerY)
        .lineTo(PAGE_W - MARGIN, footerY)
        .strokeColor(COLOR.dividerLight)
        .lineWidth(0.3)
        .stroke();

      // Page number (left)
      doc
        .font("Regular")
        .fontSize(7)
        .fillColor(COLOR.muted)
        .text(`Page ${i + 1} of ${totalPages}`, MARGIN, footerY + 6, {
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
          footerY + 6,
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
          footerY + 6,
          {
            width: CONTENT_W / 3,
            align: "right",
            lineBreak: false,
          }
        );
    }

    // Finalize
    doc.end();
  });
}
