"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { loadResume, saveResume, getUnlockPreview } from "@/lib/storage/resumeStorage";
import { getGeneratedResult } from "@/lib/resumeFlowStorage";
import type { ResumeData, ExperienceEntry, ProjectEntry } from "@/types/resume";
import { createEmptyProject } from "@/types/resume";
import { UnlockPdfModal } from "@/components/resume-flow/UnlockPdfModal";
import type { ResumeModifier } from "@/lib/ai/resume-modify";
import { scoreResume } from "@/lib/ats/engine.client";

const ResumePreviewPanel = dynamic(
  () => import("@/components/builder/ResumePreviewPanel").then((m) => ({ default: m.ResumePreviewPanel })),
  { ssr: false, loading: () => <div className="rounded-2xl border border-stone-200 bg-stone-50 min-h-[500px] animate-pulse" /> }
);

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none text-sm";

const MODIFIERS: { id: ResumeModifier; label: string }[] = [
  { id: "impactful", label: "Make More Impactful" },
  { id: "technical", label: "Make More Technical" },
  { id: "leadership", label: "Make Leadership Focused" },
  { id: "ats", label: "Optimize for ATS" },
];

// ✅ SAFE UUID (fix mobile crash)
const safeUUID = () => {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {}
  return "id-" + Math.random().toString(36).slice(2);
};

// ✅ MOBILE DETECT
const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

function ensureProjects(data: ResumeData): ResumeData {
  if (data.projects && data.projects.length > 0) return data;
  return { ...data, projects: [createEmptyProject(safeUUID())] };
}

export default function ResumeReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<ResumeData | null>(null);
  const [generated, setGenerated] = useState<ReturnType<typeof getGeneratedResult>>(null);
  const [modifierLoading, setModifierLoading] = useState<ResumeModifier | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [hasPaymentSuccess, setHasPaymentSuccess] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = loadResume();
      setGenerated(getGeneratedResult());
      setData(raw ? ensureProjects(raw) : null);
      
      // Get resume ID from unlock preview
      const preview = getUnlockPreview();
      if (preview) {
        setResumeId(preview.resumeId);
      }
      
      // Check if user has successful payment for download access
      if (preview?.resumeId) {
        checkPaymentStatus(preview.resumeId);
      }
    } catch (e: any) {
      console.error("INIT ERROR:", e);
      setError(e?.message || "Unknown error");
    }
  }, []);

  const checkPaymentStatus = async (resumeId: string) => {
    try {
      const res = await fetch(`/api/resume/download?resume_id=${resumeId}`);
      if (res.ok) {
        setHasPaymentSuccess(true);
      } else if (res.status === 402) {
        setHasPaymentSuccess(false);
      }
    } catch (error) {
      console.error("Payment status check failed:", error);
      setHasPaymentSuccess(false);
    }
  };

  const persist = useCallback((next: ResumeData) => {
    setData(next);
    saveResume(next);
  }, []);

  useEffect(() => {
    if (data) saveResume(data);
  }, [data]);

  const applyModifier = async (modifier: ResumeModifier) => {
    if (!data) return;
    setModifierLoading(modifier);
    try {
      const res = await fetch("/api/resume/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: data, modifier }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      persist(json.resume);
    } catch (e) {
      console.error(e);
    } finally {
      setModifierLoading(null);
    }
  };

  const updateSummary = (v: string) => setData((d) => (d ? { ...d, summary: v } : d));
  const updateExperience = (i: number, upd: Partial<ExperienceEntry>) => {
    setData((d) => {
      if (!d?.experience) return d;
      const next = [...d.experience];
      next[i] = { ...next[i], ...upd };
      return { ...d, experience: next };
    });
  };
  const updateProject = (i: number, upd: Partial<ProjectEntry>) => {
    setData((d) => {
      if (!d?.projects) return d;
      const next = [...d.projects];
      next[i] = { ...next[i], ...upd };
      return { ...d, projects: next };
    });
  };
  const updateSkills = (skills: string[]) => setData((d) => (d ? { ...d, skills } : d));

  // Calculate ATS score from current resume data
  const calculateAtsScore = useCallback((resumeData: ResumeData) => {
    if (!resumeData) return 0;
    
    // Convert resume data to text format for ATS scoring
    const resumeText = `
      ${resumeData.personal?.title || ''}
      ${resumeData.summary || ''}
      
      Experience:
      ${resumeData.experience.map(exp => 
        `${exp.jobTitle} at ${exp.company}\n${exp.bullets.join('\n')}`
      ).join('\n\n')}
      
      Education:
      ${resumeData.education.map(edu => 
        `${edu.degree} in ${edu.field} at ${edu.school}`
      ).join('\n')}
      
      Skills:
      ${resumeData.skills.join(', ')}
      
      Projects:
      ${resumeData.projects?.map(proj => 
        `${proj.title}: ${proj.description}\n${proj.bullets?.join('\n') || ''}`
      ).join('\n\n') || ''}
    `;
    
    const targetRole = resumeData.personal?.title || 'Professional';
    const result = scoreResume(resumeText.trim(), targetRole);
    return result.finalScore;
  }, []);

  // Get current ATS score
  const currentAtsScore = data ? calculateAtsScore(data) : 0;
  const displayAtsScore = currentAtsScore > 0 ? currentAtsScore : Math.min(100, generated?.atsScore ?? 0);

  // ✅ SIMPLIFIED MOBILE PDF DOWNLOAD
  const handleMaybeLaterDownload = async () => {
    if (!data) return;
    
    // Check if mobile device
    const isMobile = isMobileDevice();
    
    try {
      // Import required modules
      const html2canvas = (await import('html2canvas-pro')).default;
      const jsPDF = (await import('jspdf')).default;
      
      // Create a hidden container to render the resume
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '21cm';
      container.style.backgroundColor = 'white';
      container.style.padding = '40px';
      container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      container.style.lineHeight = '1.6';
      container.style.color = '#1f2937';
      document.body.appendChild(container);

      // Create a simple but professional resume layout
      const resumeContent = document.createElement('div');
      resumeContent.style.cssText = `
        max-width: 21cm;
        margin: 0 auto;
        background: white;
      `;
      
      resumeContent.innerHTML = `
        ${data.personal?.fullName || data.personal?.title ? `
        <header style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #374151; padding-bottom: 20px;">
          ${data.personal?.fullName ? `<h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 8px;">${data.personal.fullName}</h1>` : ''}
          ${data.personal?.title ? `<p style="margin: 0; font-size: 18px; color: #6b7280; font-weight: 500;">${data.personal.title}</p>` : ''}
          ${data.personal?.email || data.personal?.phone ? `
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">
              ${[data.personal.email, data.personal.phone].filter(Boolean).join(' • ')}
            </p>
          ` : ''}
        </header>
        ` : ''}
        
        ${data.summary ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Summary</h2>
          <p style="margin: 0; line-height: 1.6; color: #4b5563;">${data.summary}</p>
        </section>
        ` : ''}
        
        ${data.experience.length > 0 ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Experience</h2>
          ${data.experience.map(exp => `
            <div style="margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">${exp.jobTitle}</h3>
                <span style="font-size: 14px; color: #6b7280; white-space: nowrap;">${exp.startDate} - ${exp.endDate}</span>
              </div>
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #374151; font-weight: 500;">${exp.company}</p>
              <ul style="margin: 0; padding-left: 20px;">
                ${exp.bullets.filter(Boolean).map(bullet => `
                  <li style="margin-bottom: 6px; line-height: 1.5; color: #4b5563;">${bullet}</li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </section>
        ` : ''}
        
        ${data.education.length > 0 ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Education</h2>
          ${data.education.map(edu => `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</h3>
                <span style="font-size: 14px; color: #6b7280; white-space: nowrap;">${edu.startDate} - ${edu.endDate}</span>
              </div>
              <p style="margin: 0; font-size: 15px; color: #374151;">${edu.school}</p>
            </div>
          `).join('')}
        </section>
        ` : ''}
        
        ${data.skills.length > 0 ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Skills</h2>
          <p style="margin: 0; line-height: 1.6; color: #4b5563;">${data.skills.join(' • ')}</p>
        </section>
        ` : ''}
        
        ${data.projects && data.projects.length > 0 ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Projects</h2>
          ${data.projects.filter(p => p.title || p.description).map(proj => `
            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">${proj.title || 'Project'}</h3>
              <p style="margin: 0 0 12px 0; line-height: 1.6; color: #4b5563;">${proj.description || ''}</p>
              ${proj.bullets && proj.bullets.length > 0 ? `
                <ul style="margin: 0; padding-left: 20px;">
                  ${proj.bullets.filter(Boolean).map(bullet => `
                    <li style="margin-bottom: 6px; line-height: 1.5; color: #4b5563;">${bullet}</li>
                  `).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </section>
        ` : ''}
      `;
      
      container.appendChild(resumeContent);
      
      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Generate PDF from the rendered template
      const resumeElement = container.firstElementChild as HTMLElement;
      
      // Get the actual height of the content
      const totalHeight = resumeElement.scrollHeight;
      const a4HeightMM = 297; // A4 height in mm
      const a4HeightPx = 1123; // A4 height in pixels at 96 DPI
      
      // Calculate how many pages we need
      const numPages = Math.ceil(totalHeight / a4HeightPx);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Mobile-optimized scale to prevent memory issues
      const scale = isMobile ? 1.2 : 2;
      
      // Mobile-specific optimizations
      const canvasOptions = {
        scale, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        width: 794,
        height: a4HeightPx,
        logging: false,
        removeContainer: false,
        // Mobile-specific settings to reduce memory usage
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 15000, // 15 seconds timeout for images
        onclone: (clonedDoc: Document) => {
          // Remove problematic elements for mobile
          const videos = clonedDoc.querySelectorAll('video');
          videos.forEach(v => v.remove());
        }
      };
      
      for (let i = 0; i < numPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate the source area for this page
        const startY = i * a4HeightPx;
        const height = Math.min(a4HeightPx, totalHeight - startY);
        
        // Create a temporary container for this page's content
        const pageContainer = document.createElement('div');
        pageContainer.style.position = 'absolute';
        pageContainer.style.top = '-9999px';
        pageContainer.style.left = '-9999px';
        pageContainer.style.width = '21cm';
        pageContainer.style.height = `${a4HeightPx}px`;
        pageContainer.style.overflow = 'hidden';
        pageContainer.style.backgroundColor = 'white';
        
        // Clone the resume element and offset it
        const clonedElement = resumeElement.cloneNode(true) as HTMLElement;
        clonedElement.style.transform = `translateY(-${startY}px)`;
        pageContainer.appendChild(clonedElement);
        document.body.appendChild(pageContainer);
        
        try {
          // Generate canvas for this page with mobile optimizations
          const canvas = await html2canvas(pageContainer, {
            ...canvasOptions,
            height: height
          });
          
          // Add to PDF
          const imgData = canvas.toDataURL('image/png', 0.8); // Slightly lower quality for mobile
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          
          // Clean up canvas to free memory
          canvas.width = 1;
          canvas.height = 1;
          
        } catch (canvasError) {
          console.error('Canvas generation error:', canvasError);
          // Fallback: add a blank page with text
          pdf.setFontSize(12);
          pdf.text('Resume content could not be rendered on this device.', 20, 20);
          pdf.text(`Page ${i + 1} of ${numPages}`, 20, 30);
        }
        
        // Clean up page container to free memory
        document.body.removeChild(pageContainer);
        
        // Small delay to allow garbage collection on mobile
        if (isMobile && i < numPages - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Save PDF
      const filename = `resume-${data.personal?.fullName || 'resume'}-${Date.now()}.pdf`;
      pdf.save(filename);
      
      // Clean up
      document.body.removeChild(container);
      
      // Generate DOC file with proper styling
      await generateDocFile(data);
      
      // Generate add-ons if user paid for them
      await generateAddons(data);
      
      // Show success message
      if (isMobile) {
        alert('PDF downloaded successfully! Note: For best quality, consider using a desktop computer.');
      }
      
    } catch (error) {
      console.error('Download error:', error);
      // Fallback to text download
      try {
        const resumeText = createResumeDoc(data);
        const blob = new Blob([resumeText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `resume-${data.personal?.fullName || 'resume'}-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Still try to generate add-ons
        await generateAddons(data);
        
        alert('PDF generation failed. Text version downloaded instead.');
      } catch (fallbackError) {
        console.error('Fallback download failed:', fallbackError);
        alert('Download failed. Please try again on a desktop computer.');
      }
    }
  };

  const generateAddons = async (resumeData: ResumeData) => {
    try {
      // Check if user has paid for add-ons by checking the order
      const preview = getUnlockPreview();
      if (!preview?.resumeId) {
        console.log('No resume ID found for add-on generation');
        return;
      }
      
      // Get order details to see which add-ons were purchased
      const orderRes = await fetch(`/api/get-order?resume_id=${preview.resumeId}`);
      if (!orderRes.ok) {
        console.log('Order not found or not paid');
        return;
      }
      
      const orderData = await orderRes.json();
      const lineItems = orderData.line_items || {};
      
      // Debug log
      console.log('Order line items:', lineItems);
      
      // Filter to purchased add-ons (excluding resume_pdf)
      const purchasedAddons = Object.entries(lineItems)
        .filter(([slug, purchased]) => purchased === true && slug !== 'resume_pdf')
        .map(([slug]) => slug);
      
      console.log('Purchased add-ons:', purchasedAddons);
      
      if (purchasedAddons.length === 0) {
        console.log('No add-ons purchased');
        return;
      }
      
      // Generate resume text for addon generation
      const resumeText = `
        ${resumeData.personal?.fullName || ''}
        ${resumeData.personal?.title || ''}
        ${resumeData.summary || ''}
        
        Experience:
        ${resumeData.experience.map(exp => 
          `${exp.jobTitle} at ${exp.company}\n${exp.bullets.join('\n')}`
        ).join('\n\n')}
        
        Education:
        ${resumeData.education.map(edu => 
          `${edu.degree} in ${edu.field} at ${edu.school}`
        ).join('\n')}
        
        Skills:
        ${resumeData.skills.join(', ')}
        
        Projects:
        ${resumeData.projects?.map(proj => 
          `${proj.title}: ${proj.description}\n${proj.bullets?.join('\n') || ''}`
        ).join('\n\n') || ''}
      `;
      
      // Call addon generation API
      const addonRes = await fetch('/api/generate-addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          targetRole: preview.targetRole || resumeData.personal?.title || 'Professional',
          addons: purchasedAddons
        })
      });
      
      if (!addonRes.ok) {
        console.error('Failed to generate add-ons:', await addonRes.text());
        return;
      }
      
      const addonData = await addonRes.json();
      
      // Download each addon as a separate file
      addonData.addons?.forEach((addon: any) => {
        const blob = new Blob([addon.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${addon.title.replace(/\s+/g, '_')}_${resumeData.personal?.fullName || 'resume'}_${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
      
    } catch (error) {
      console.error('Addon generation error:', error);
    }
  };

  const generateDocFile = async (resumeData: ResumeData) => {
    try {
      // Use the existing docx export engine
      const { exportDocx } = await import('@/engine/export');
      
      // Convert resume data to document draft format
      const documentDraft = {
        metadata: {
          documentId: crypto.randomUUID(),
          policyVersion: "1.0",
          category: "corporate" as const,
          documentType: "brd" as const, // Using a valid document type
          generatedAt: new Date().toLocaleString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
          }) + ' IST',
          riskFlags: [],
        },
        sections: [
          {
            id: 'summary',
            title: 'Summary',
            content: resumeData.summary || '',
            order: 1,
          },
          {
            id: 'experience',
            title: 'Experience',
            content: resumeData.experience.map(exp => 
              `${exp.jobTitle} at ${exp.company}\n${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}\n${exp.bullets.filter(Boolean).map(bullet => `• ${bullet}`).join('\n')}`
            ).join('\n\n'),
            order: 2,
          },
          {
            id: 'education',
            title: 'Education',
            content: resumeData.education.map(edu =>
              `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}\n${edu.school}\n${edu.startDate} - ${edu.endDate}`
            ).join('\n\n'),
            order: 3,
          },
          {
            id: 'skills',
            title: 'Skills',
            content: resumeData.skills.join(', '),
            order: 4,
          },
          ...(resumeData.projects && resumeData.projects.length > 0 ? [{
            id: 'projects',
            title: 'Projects',
            content: resumeData.projects.filter(p => p.title || p.description).map(proj =>
              `${proj.title || 'Project'}\n${proj.description || ''}\n${proj.bullets?.filter(Boolean).map(bullet => `• ${bullet}`).join('\n') || ''}`
            ).join('\n\n'),
            order: 5,
          }] : []),
        ],
      };

      // Generate and download DOCX file
      await exportDocx(documentDraft, {
        includeComplianceBlock: false,
        fileName: `resume-${resumeData.personal?.fullName || 'resume'}-${Date.now()}.docx`
      });
      
    } catch (error) {
      console.error('DOC generation error:', error);
      // Fallback to text file if DOCX fails
      const textContent = createResumeDoc(resumeData);
      const textBlob = new Blob([textContent], { type: 'text/plain' });
      const textUrl = URL.createObjectURL(textBlob);
      const textLink = document.createElement('a');
      textLink.href = textUrl;
      textLink.download = `resume-${resumeData.personal?.fullName || 'resume'}-${Date.now()}.txt`;
      document.body.appendChild(textLink);
      textLink.click();
      document.body.removeChild(textLink);
      URL.revokeObjectURL(textUrl);
    }
  };

  const handlePaidDownload = async () => {
    if (!data) return;
    
    // Check if mobile device
    const isMobile = isMobileDevice();
    
    try {
      // Import required modules
      const html2canvas = (await import('html2canvas-pro')).default;
      const jsPDF = (await import('jspdf')).default;
      
      // Create a hidden container to render the resume
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '21cm';
      container.style.backgroundColor = 'white';
      container.style.padding = '40px';
      container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      container.style.lineHeight = '1.6';
      container.style.color = '#1f2937';
      document.body.appendChild(container);

      // Create a simple but professional resume layout
      const resumeContent = document.createElement('div');
      resumeContent.style.cssText = `
        max-width: 21cm;
        margin: 0 auto;
        background: white;
      `;
      
      resumeContent.innerHTML = `
        ${data.personal?.fullName || data.personal?.title ? `
        <header style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #374151; padding-bottom: 20px;">
          ${data.personal?.fullName ? `<h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 8px;">${data.personal.fullName}</h1>` : ''}
          ${data.personal?.title ? `<p style="margin: 0; font-size: 18px; color: #6b7280; font-weight: 500;">${data.personal.title}</p>` : ''}
          ${data.personal?.email || data.personal?.phone ? `
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">
              ${[data.personal.email, data.personal.phone].filter(Boolean).join(' • ')}
            </p>
          ` : ''}
        </header>
        ` : ''}
        
        ${data.summary ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Summary</h2>
          <p style="margin: 0; line-height: 1.6; color: #4b5563;">${data.summary}</p>
        </section>
        ` : ''}
        
        ${data.experience.length > 0 ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Experience</h2>
          ${data.experience.map(exp => `
            <div style="margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">${exp.jobTitle}</h3>
                <span style="font-size: 14px; color: #6b7280; white-space: nowrap;">${exp.startDate} - ${exp.endDate}</span>
              </div>
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #374151; font-weight: 500;">${exp.company}</p>
              <ul style="margin: 0; padding-left: 20px;">
                ${exp.bullets.filter(Boolean).map(bullet => `
                  <li style="margin-bottom: 6px; line-height: 1.5; color: #4b5563;">${bullet}</li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </section>
        ` : ''}
        
        ${data.education.length > 0 ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Education</h2>
          ${data.education.map(edu => `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</h3>
                <span style="font-size: 14px; color: #6b7280; white-space: nowrap;">${edu.startDate} - ${edu.endDate}</span>
              </div>
              <p style="margin: 0; font-size: 15px; color: #374151;">${edu.school}</p>
            </div>
          `).join('')}
        </section>
        ` : ''}
        
        ${data.skills.length > 0 ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Skills</h2>
          <p style="margin: 0; line-height: 1.6; color: #4b5563;">${data.skills.join(' • ')}</p>
        </section>
        ` : ''}
        
        ${data.projects && data.projects.length > 0 ? `
        <section style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Projects</h2>
          ${data.projects.filter(p => p.title || p.description).map(proj => `
            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">${proj.title || 'Project'}</h3>
              <p style="margin: 0 0 12px 0; line-height: 1.6; color: #4b5563;">${proj.description || ''}</p>
              ${proj.bullets && proj.bullets.length > 0 ? `
                <ul style="margin: 0; padding-left: 20px;">
                  ${proj.bullets.filter(Boolean).map(bullet => `
                    <li style="margin-bottom: 6px; line-height: 1.5; color: #4b5563;">${bullet}</li>
                  `).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </section>
        ` : ''}
      `;
      
      container.appendChild(resumeContent);
      
      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Generate PDF from the rendered template
      const resumeElement = container.firstElementChild as HTMLElement;
      
      // Get the actual height of the content
      const totalHeight = resumeElement.scrollHeight;
      const a4HeightMM = 297; // A4 height in mm
      const a4HeightPx = 1123; // A4 height in pixels at 96 DPI
      
      // Calculate how many pages we need
      const numPages = Math.ceil(totalHeight / a4HeightPx);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Mobile-optimized scale to prevent memory issues
      const scale = isMobile ? 1.2 : 2;
      
      // Mobile-specific optimizations
      const canvasOptions = {
        scale, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        width: 794,
        height: a4HeightPx,
        logging: false,
        removeContainer: false,
        // Mobile-specific settings to reduce memory usage
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 15000, // 15 seconds timeout for images
        onclone: (clonedDoc: Document) => {
          // Remove problematic elements for mobile
          const videos = clonedDoc.querySelectorAll('video');
          videos.forEach(v => v.remove());
        }
      };
      
      for (let i = 0; i < numPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate the source area for this page
        const startY = i * a4HeightPx;
        const height = Math.min(a4HeightPx, totalHeight - startY);
        
        // Create a temporary container for this page's content
        const pageContainer = document.createElement('div');
        pageContainer.style.position = 'absolute';
        pageContainer.style.top = '-9999px';
        pageContainer.style.left = '-9999px';
        pageContainer.style.width = '21cm';
        pageContainer.style.height = `${a4HeightPx}px`;
        pageContainer.style.overflow = 'hidden';
        pageContainer.style.backgroundColor = 'white';
        
        // Clone the resume element and offset it
        const clonedElement = resumeElement.cloneNode(true) as HTMLElement;
        clonedElement.style.transform = `translateY(-${startY}px)`;
        pageContainer.appendChild(clonedElement);
        document.body.appendChild(pageContainer);
        
        try {
          // Generate canvas for this page with mobile optimizations
          const canvas = await html2canvas(pageContainer, {
            ...canvasOptions,
            height: height
          });
          
          // Add to PDF
          const imgData = canvas.toDataURL('image/png', 0.8); // Slightly lower quality for mobile
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          
          // Clean up canvas to free memory
          canvas.width = 1;
          canvas.height = 1;
          
        } catch (canvasError) {
          console.error('Canvas generation error:', canvasError);
          // Fallback: add a blank page with text
          pdf.setFontSize(12);
          pdf.text('Resume content could not be rendered on this device.', 20, 20);
          pdf.text(`Page ${i + 1} of ${numPages}`, 20, 30);
        }
        
        // Clean up page container to free memory
        document.body.removeChild(pageContainer);
        
        // Small delay to allow garbage collection on mobile
        if (isMobile && i < numPages - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Save PDF
      const filename = `resume-${data.personal?.fullName || 'resume'}-${Date.now()}.pdf`;
      pdf.save(filename);
      
      // Clean up
      document.body.removeChild(container);
      
      // Also generate DOC file
      await generateDocFile(data);
      
      // Generate add-ons if user paid for them
      await generateAddons(data);
      
      // Show success message
      if (isMobile) {
        alert('PDF downloaded successfully! Note: For best quality, consider using a desktop computer.');
      }
      
    } catch (error) {
      console.error('Download error:', error);
      // Fallback to text download
      try {
        const resumeText = createResumeDoc(data);
        const blob = new Blob([resumeText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `resume-${data.personal?.fullName || 'resume'}-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Still try to generate add-ons
        await generateAddons(data);
        
        alert('PDF generation failed. Text version downloaded instead.');
      } catch (fallbackError) {
        console.error('Fallback download failed:', fallbackError);
        alert('Download failed. Please try again on a desktop computer.');
      }
    }
  };

  const createResumeDoc = (resumeData: ResumeData) => {
    return `
      Resume - ${resumeData.personal?.fullName || 'Document'}
      
      ${resumeData.personal?.fullName || ''}
      ${resumeData.personal?.title || ''}
      ${resumeData.personal?.email || ''} | ${resumeData.personal?.phone || ''}
      
      SUMMARY
      ${resumeData.summary || ''}
      
      EXPERIENCE
      ${resumeData.experience.map(exp => `
      ${exp.jobTitle} at ${exp.company}
      ${exp.startDate} - ${exp.endDate}
      ${exp.bullets.map(bullet => `• ${bullet}`).join('\n      ')}
      `).join('\n')}
      
      EDUCATION
      ${resumeData.education.map(edu => `
      ${edu.degree} in ${edu.field}
      ${edu.school}
      ${edu.startDate} - ${edu.endDate}
      `).join('\n')}
      
      SKILLS
      ${(resumeData.skills || []).join(', ')}
    `;
  };

  // ❌ SHOW ERROR IN UI (critical for mobile debugging)
  if (error) {
    return (
      <div className="p-6 text-red-600">
        <h2 className="font-bold">Error:</h2>
        <pre>{error}</pre>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500 mb-4">No resume found. Build one first.</p>
        <Link href="/create" className="text-amber-600 font-medium hover:underline">
          Start from scratch
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-stone-100 px-4 py-2">
            <span className="text-xs text-stone-500 uppercase tracking-wider">ATS Score</span>
            <p className="text-xl font-bold text-stone-900">{displayAtsScore}</p>
          </div>
          <div className="rounded-xl bg-amber-50 px-4 py-2">
            <span className="text-xs text-stone-500 uppercase tracking-wider">Resume Strength</span>
            <p className="text-lg font-semibold text-amber-800">
              {displayAtsScore >= 90 ? "Strong" : displayAtsScore >= 70 ? "Good" : "Needs work"}
            </p>
          </div>
        </div>
        {displayAtsScore < 90 && (
          <p className="text-sm text-stone-500">
            Scores below 90 are often rejected by ATS. Use &ldquo;Optimize for ATS&rdquo; or unlock ATS Improver (&#8377;15).
          </p>
        )}
      </div>

      {/* Actions bar - visible at top for mobile */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          href="/builder"
          className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-all shadow-md shadow-amber-900/10"
        >
          Open Full Builder
        </Link>
        {hasPaymentSuccess && resumeId ? (
          <button
            type="button"
            onClick={handlePaidDownload}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-900/10"
          >
            Download Resume
          </button>
        ) : (
          <button
            type="button"
            onClick={handleMaybeLaterDownload}
            className="rounded-xl border-2 border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition-all"
          >
            Download PDF
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Summary</label>
            <textarea
              className={inputClass}
              rows={4}
              value={data.summary}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="Professional summary"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-stone-700 mb-2">Experience</h3>
            {data.experience.map((exp, i) => (
              <div key={exp.id} className="mb-4 rounded-xl border border-stone-200 p-4 space-y-2">
                <input
                  className={inputClass}
                  value={exp.jobTitle}
                  onChange={(e) => updateExperience(i, { jobTitle: e.target.value })}
                  placeholder="Job title"
                />
                <input
                  className={inputClass}
                  value={exp.company}
                  onChange={(e) => updateExperience(i, { company: e.target.value })}
                  placeholder="Company"
                />
                {(exp.bullets ?? [""]).map((b, j) => (
                  <input
                    key={j}
                    className={inputClass}
                    value={b}
                    onChange={(e) => {
                      const bullets = [...(exp.bullets ?? [""])];
                      bullets[j] = e.target.value;
                      updateExperience(i, { bullets });
                    }}
                    placeholder="Bullet point"
                  />
                ))}
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-medium text-stone-700 mb-2">Projects</h3>
            {(data.projects ?? []).map((proj, i) => (
              <div key={proj.id} className="mb-4 rounded-xl border border-stone-200 p-4 space-y-2">
                <input
                  className={inputClass}
                  value={proj.title}
                  onChange={(e) => updateProject(i, { title: e.target.value })}
                  placeholder="Project title"
                />
                <textarea
                  className={inputClass}
                  rows={2}
                  value={proj.description}
                  onChange={(e) => updateProject(i, { description: e.target.value })}
                  placeholder="Description"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Skills (comma-separated)</label>
            <input
              className={inputClass}
              value={(data.skills ?? []).join(", ")}
              onChange={(e) => updateSkills(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="Python, SQL, React, ..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {MODIFIERS.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={!!modifierLoading}
                onClick={() => applyModifier(m.id)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-amber-50 hover:border-amber-200 disabled:opacity-60"
              >
                {modifierLoading === m.id ? "Applying…" : m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 self-start">
          <ResumePreviewPanel
            data={data}
            onTemplateChange={(tid) => setData((d) => (d ? { ...d, templateId: tid } : d))}
            onDownload={hasPaymentSuccess && resumeId ? handlePaidDownload : handleMaybeLaterDownload}
          />
          <div className="mt-4 hidden lg:flex flex-wrap gap-3">
            <button
              type="button"
              onClick={hasPaymentSuccess && resumeId ? handlePaidDownload : handleMaybeLaterDownload}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Download PDF
            </button>
            <Link
              href="/builder"
              className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Open full builder
            </Link>
          </div>
        </div>
      </div>

      <UnlockPdfModal
        open={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onUnlock={() => setShowUnlockModal(false)}
        atsScore={displayAtsScore}
      />
    </div>
  );
}
