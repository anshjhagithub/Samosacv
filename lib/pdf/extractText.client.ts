"use client";

const PDFJS_VERSION = "5.3.93";

type PDFDoc = {
  numPages: number;
  getPage: (n: number) => Promise<{
    getTextContent: () => Promise<{ items: { str?: string }[] }>;
  }>;
};

type PDFJsLib = {
  getDocument: (src: { data: Uint8Array }) => { promise: Promise<PDFDoc> };
  GlobalWorkerOptions?: { workerSrc: string };
};

/**
 * Load PDF.js from CDN to avoid Next.js chunk issues. Worker is also from CDN.
 */
async function getPdfJs(): Promise<PDFJsLib> {
  const pdfjsLib = (await import("pdfjs-dist")) as PDFJsLib;
  if (!pdfjsLib.GlobalWorkerOptions) {
    (pdfjsLib as Record<string, unknown>).GlobalWorkerOptions = {};
  }
  pdfjsLib.GlobalWorkerOptions!.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
  return pdfjsLib;
}

/**
 * Extract text from a PDF file in the browser using pdfjs-dist (worker from CDN).
 */
export async function extractTextFromPdfFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdfjsLib = await getPdfJs();
  const getDocument = pdfjsLib.getDocument;
  if (!getDocument) {
    throw new Error("PDF library could not load. Try pasting your resume text instead.");
  }

  const loadingTask = getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const parts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = (textContent.items as { str?: string }[])
      .map((item) => item.str ?? "")
      .join(" ");
    parts.push(pageText);
  }

  const text = parts.join("\n\n").trim();
  if (!text || text.length < 20) {
    throw new Error("PDF appears empty or could not be read. Try pasting the text instead.");
  }
  return text;
}
