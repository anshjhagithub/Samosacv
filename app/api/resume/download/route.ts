import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { loadResume } from "@/lib/storage/resumeStorage";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Check if user has valid payment for this resume
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resume_id");
    
    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID required" },
        { status: 400 }
      );
    }

    // Check payment status in database
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("resume_id", resumeId)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Payment required for download" },
        { status: 402 }
      );
    }

    // Load resume data
    const resumeData = loadResume();
    if (!resumeData) {
      return NextResponse.json(
        { error: "Resume data not found" },
        { status: 404 }
      );
    }

    // Create simple HTML structure for PDF generation
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Resume</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          .resume-container { width: 21cm; min-height: 29.7cm; box-sizing: border-box; }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <h1>${resumeData.personal?.fullName || 'Resume'}</h1>
          <p>${resumeData.personal?.title || ''}</p>
          <p>${resumeData.personal?.email || ''} | ${resumeData.personal?.phone || ''}</p>
          
          <h2>Summary</h2>
          <p>${resumeData.summary || ''}</p>
          
          <h2>Experience</h2>
          ${resumeData.experience.map(exp => `
            <div>
              <h3>${exp.jobTitle} at ${exp.company}</h3>
              <p>${exp.startDate} - ${exp.endDate}</p>
              <ul>
                ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
          
          <h2>Education</h2>
          ${resumeData.education.map(edu => `
            <div>
              <h3>${edu.degree} in ${edu.field}</h3>
              <p>${edu.school}</p>
              <p>${edu.startDate} - ${edu.endDate}</p>
            </div>
          `).join('')}
          
          <h2>Skills</h2>
          <p>${resumeData.skills.join(', ')}</p>
        </div>
      </body>
      </html>
    `;

    // Return HTML as response for now (PDF generation would require client-side)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="resume-${resumeData.personal?.fullName || 'document'}.html"`,
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}