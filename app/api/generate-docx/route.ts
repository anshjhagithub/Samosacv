import { NextResponse } from "next/server";
import HTMLtoDOCX from "html-to-docx";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { html, filename } = await req.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    // Wrap the HTML content in a proper document structure to ensure it's styled nicely
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1f2937;
              line-height: 1.5;
            }
            .resume-container {
              width: 100%;
              max-width: 21cm;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            ${html}
          </div>
        </body>
      </html>
    `;

    // Convert HTML to DOCX buffer
    const fileBuffer = await HTMLtoDOCX(fullHtml, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
      font: "Arial", // Base font fallback
      margins: {
        top: 720, // 0.5 inch (1440 twips = 1 inch)
        right: 720,
        bottom: 720,
        left: 720,
      },
    });

    const docxName = filename || `resume-${Date.now()}.docx`;

    // Return the buffer as a downloadable response
    return new Response(fileBuffer as any, {
       headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${docxName}"`,
       },
    });
  } catch (error) {
    console.error("DOCX generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate DOCX file from HTML." },
      { status: 500 }
    );
  }
}
