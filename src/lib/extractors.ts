import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function extractPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text.trim();
}

export async function extractDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

export async function extractHWP(buffer: Buffer): Promise<string> {
  const { parse } = await import("hwp.js");
  const doc = parse(buffer);
  const texts: string[] = [];

  interface HwpNode {
    text?: string;
    content?: HwpNode | HwpNode[];
    children?: HwpNode[];
    sections?: HwpNode[];
    paragraphs?: HwpNode[];
  }

  function extractText(node: string | HwpNode | null | undefined): void {
    if (!node) return;
    if (typeof node === "string") { texts.push(node); return; }
    if (node.text) texts.push(node.text);
    if (node.content) {
      if (Array.isArray(node.content)) node.content.forEach(extractText);
      else extractText(node.content);
    }
    if (node.children) {
      if (Array.isArray(node.children)) node.children.forEach(extractText);
    }
    if (node.sections) {
      if (Array.isArray(node.sections)) node.sections.forEach(extractText);
    }
    if (node.paragraphs) {
      if (Array.isArray(node.paragraphs)) node.paragraphs.forEach(extractText);
    }
  }

  extractText(doc);
  return texts.join("\n").trim();
}
