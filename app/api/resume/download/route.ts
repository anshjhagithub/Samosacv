import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { loadResume } from "@/lib/storage/resumeStorage";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { renderToStaticMarkup } from "react-dom/server";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import React from "react";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    // Check if user has valid payment for this resume
    const url = new URL(req.url);
    const resumeId = url.searchParams.get("resume_id");
    
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

    // Generate PDF
    const html = renderToStaticMarkup(
      React.createElement('div', { style: { width: "21cm", minHeight: "29.7cm" } },
        React.createElement(ResumePreview, { data: resumeData })
      )
    );

    // Create a temporary DOM element for html2canvas
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '-9999px';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    const canvas = await html2canvas(tempDiv, { 
      scale: 2, 
      useCORS: true,
      allowTaint: true
    });

    document.body.removeChild(tempDiv);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Return PDF as response
    const pdfBuffer = pdf.output('arraybuffer');
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-${resumeData.personal?.fullName || 'document'}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}