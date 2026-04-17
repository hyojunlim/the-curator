import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  BorderStyle,
} from "docx";
import type { AnalysisResult, RiskItem } from "@/types";

function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function replaceClause(text: string, clause: string, replacement: string): string {
  if (text.includes(clause)) {
    return text.replace(clause, replacement);
  }

  const normClause = normalizeWhitespace(clause);
  const normText = normalizeWhitespace(text);

  if (normText.includes(normClause)) {
    const idx = normText.indexOf(normClause);
    const before = normText.slice(0, idx);
    const after = normText.slice(idx + normClause.length);
    return before + replacement + after;
  }

  if (normClause.length >= 80) {
    const head = normalizeWhitespace(clause.slice(0, 40));
    const tail = normalizeWhitespace(clause.slice(-40));
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escapeRegex(head) + "[\\s\\S]*?" + escapeRegex(tail));
    if (pattern.test(normText)) {
      return normText.replace(pattern, replacement);
    }
  }

  return text;
}

/**
 * Detect if a line looks like a heading/article/section title.
 * Korean: 제1조, 제2조, 제1장, etc.
 * English: Article 1, Section 1, ARTICLE I, etc.
 * Numbered: 1. Title, 2. Title, I. Title
 */
function isHeadingLine(line: string): "h1" | "h2" | false {
  const trimmed = line.trim();
  // Korean contract headings: 제X조, 제X장
  if (/^제\s*\d+\s*(조|장|편|절)/.test(trimmed)) return "h1";
  // English: Article/Section/Chapter
  if (/^(ARTICLE|Article|SECTION|Section|CHAPTER|Chapter)\s+/i.test(trimmed)) return "h1";
  // Roman numerals or numbered sections at start: I., II., 1., 2.
  if (/^[IVX]+\.\s/.test(trimmed) || /^[A-Z]\.\s/.test(trimmed)) return "h2";
  // Sub-articles: 제X조의X, ①, ②, (1), (2), 1), 2)
  if (/^[①②③④⑤⑥⑦⑧⑨⑩]/.test(trimmed)) return "h2";
  if (/^\(\d+\)\s/.test(trimmed) || /^\d+\)\s/.test(trimmed)) return "h2";
  // All caps short line (likely a title)
  if (trimmed.length < 60 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) return "h1";
  return false;
}

export async function generateModifiedDocx(
  contractText: string,
  result: AnalysisResult,
  selectedIndices: number[],
  perspective: "none" | "party_a" | "party_b"
): Promise<Buffer> {
  const modifyRewrites: { clause: string; rewrite: string }[] = [];
  const addRewrites: { title: string; clauseReference?: string; rewrite: string }[] = [];

  for (const idx of selectedIndices) {
    const risk: RiskItem | undefined = result.risks[idx];
    if (!risk) continue;

    let activeRewrite: string | undefined;
    switch (perspective) {
      case "party_a":
        activeRewrite = risk.rewrite_party_a || risk.rewrite;
        break;
      case "party_b":
        activeRewrite = risk.rewrite_party_b || risk.rewrite;
        break;
      default:
        activeRewrite = risk.rewrite;
        break;
    }

    if (!activeRewrite) continue;

    if (risk.rewrite_type === "add") {
      addRewrites.push({
        title: risk.title,
        clauseReference: risk.clauseReference,
        rewrite: activeRewrite,
      });
    } else {
      modifyRewrites.push({
        clause: risk.clause,
        rewrite: activeRewrite,
      });
    }
  }

  // Apply modifications
  let modifiedText = contractText;
  for (const { clause, rewrite } of modifyRewrites) {
    modifiedText = replaceClause(modifiedText, clause, rewrite);
  }

  // Build paragraphs with structure detection
  const lines = modifiedText.split(/\n/);
  const bodyParagraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line → spacing paragraph
    if (trimmed === "") {
      bodyParagraphs.push(new Paragraph({ children: [], spacing: { after: 120 } }));
      continue;
    }

    const headingType = isHeadingLine(trimmed);

    if (headingType === "h1") {
      // Major section heading (제X조, Article X)
      bodyParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              size: 26, // 13pt
              font: "Calibri",
            }),
          ],
          spacing: { before: 360, after: 160 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 4 },
          },
        })
      );
    } else if (headingType === "h2") {
      // Sub-section heading
      bodyParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              size: 24, // 12pt
              font: "Calibri",
            }),
          ],
          spacing: { before: 240, after: 120 },
          indent: { left: 240 }, // slight indent
        })
      );
    } else {
      // Regular paragraph
      bodyParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed,
              size: 22, // 11pt
              font: "Calibri",
            }),
          ],
          spacing: { after: 80, line: 360 }, // 1.5x line spacing
          indent: { left: 240 },
        })
      );
    }
  }

  // Add "Additional Clauses" section
  if (addRewrites.length > 0) {
    bodyParagraphs.push(new Paragraph({ children: [], spacing: { before: 480 } }));

    // Divider
    bodyParagraphs.push(
      new Paragraph({
        children: [],
        border: {
          bottom: { style: BorderStyle.DOUBLE, size: 2, color: "00154f", space: 8 },
        },
        spacing: { after: 240 },
      })
    );

    bodyParagraphs.push(
      new Paragraph({
        text: result.language === "Korean" ? "추가 조항" : "Additional Clauses",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 200 },
      })
    );

    for (const addition of addRewrites) {
      const label = addition.clauseReference
        ? `${addition.title} (${addition.clauseReference})`
        : addition.title;

      bodyParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: label,
              bold: true,
              size: 24,
              font: "Calibri",
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );

      const rewriteLines = addition.rewrite.split(/\n/).filter((l) => l.trim().length > 0);
      for (const rLine of rewriteLines) {
        bodyParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: rLine.trim(),
                size: 22,
                font: "Calibri",
              }),
            ],
            spacing: { after: 80, line: 360 },
            indent: { left: 240 },
          })
        );
      }
    }
  }

  // Build document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: result.language === "Korean" ? "수정 계약서" : "Modified Contract",
                    bold: true,
                    size: 18,
                    font: "Calibri",
                    color: "999999",
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
                    size: 16,
                    font: "Calibri",
                    color: "AAAAAA",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: bodyParagraphs,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
