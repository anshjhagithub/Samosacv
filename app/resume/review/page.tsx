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
  const [purchasedAddons, setPurchasedAddons] = useState<string[]>([]);

  const checkPaymentAndAddons = useCallback(async (rid: string) => {
    try {
      // Step 1: Try to verify payment via the order_id if we have it
      const lsOrderId = typeof window !== 'undefined' ? localStorage.getItem('samosa_last_order_id') : null;
      
      if (lsOrderId) {
        // Force-verify with Cashfree to sync DB
        try {
          await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: lsOrderId }),
          });
        } catch (e) {
          console.error("Verify payment failed:", e);
        }
      }
      
      // Step 2: Check if the order is paid in DB
      const res = await fetch(`/api/resume/download?resume_id=${rid}`);
      if (res.ok) {
        setHasPaymentSuccess(true);
        
        // Step 3: Fetch addons from the order
        try {
          const orderRes = await fetch(`/api/get-order?resume_id=${rid}`);
          if (orderRes.ok) {
            const orderData = await orderRes.json();
            const lineItems = orderData.line_items || {};
            const addons = Object.entries(lineItems)
              .filter(([slug, purchased]) => purchased === true && slug !== 'resume_pdf')
              .map(([slug]) => slug);
            setPurchasedAddons(addons);
          }
        } catch (e) {
          console.error("Failed to fetch addons:", e);
        }
        
        // Also check localStorage cart as backup
        if (purchasedAddons.length === 0) {
          try {
            const cartStr = typeof window !== 'undefined' ? localStorage.getItem('samosa_last_cart') : null;
            if (cartStr) {
              const cart = JSON.parse(cartStr);
              const addons = Object.entries(cart)
                .filter(([slug, purchased]) => purchased === true && slug !== 'resume_pdf')
                .map(([slug]) => slug);
              if (addons.length > 0) {
                setPurchasedAddons(addons);
              }
            }
          } catch (e) {
            console.error("Failed to parse cart from localStorage:", e);
          }
        }
      } else if (res.status === 402) {
        setHasPaymentSuccess(false);
      }
    } catch (error) {
      console.error("Payment status check failed:", error);
      setHasPaymentSuccess(false);
    }
  }, [purchasedAddons.length]);

  useEffect(() => {
    try {
      const raw = loadResume();
      setGenerated(getGeneratedResult());
      setData(raw ? ensureProjects(raw) : null);
      
      // Try multiple sources to find the resumeId
      const preview = getUnlockPreview();
      const lsResumeId = typeof window !== 'undefined' ? localStorage.getItem('samosa_last_resume_id') : null;
      const finalResumeId = preview?.resumeId || lsResumeId || null;
      
      if (finalResumeId) {
        setResumeId(finalResumeId);
        checkPaymentAndAddons(finalResumeId);
      }
    } catch (e: any) {
      console.error("INIT ERROR:", e);
      setError(e?.message || "Unknown error");
    }
  }, [checkPaymentAndAddons]);

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
      const el = document.querySelector(".resume-pdf-source");
      if (!el) {
        throw new Error("Could not find resume preview on screen");
      }

      // Import required modules
      const html2canvas = (await import('html2canvas-pro')).default;
      const jsPDF = (await import('jspdf')).default;
      
      let targetEl = el as HTMLElement;
      let wrapper: HTMLDivElement | null = null;
      
      // Always clone into a fixed width container (A4) to avoid text scaling/kerning bugs with html2canvas (e.g., text bunching up)
      wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.top = '-9999px';
      wrapper.style.left = '-9999px';
      wrapper.style.width = '794px'; // ~A4 width
      wrapper.style.backgroundColor = 'white';
      
      const clone = el.cloneNode(true) as HTMLElement;
      // Remove any inline scaling that might have been copied
      clone.style.transform = 'none';
      clone.style.transformOrigin = 'unset';
      
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);
      targetEl = clone;
      
      // Wait a small tick to let css apply to the cloned node and fonts to settle
      await new Promise(r => setTimeout(r, 100));
      
      const scale = isMobile ? 1.5 : 2;

      // Generate canvas with mobile optimizations
      const canvas = await html2canvas(targetEl, {
        scale,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 15000, // 15 seconds timeout for images
      });
      
      if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgData = canvas.toDataURL('image/png', 0.8); // Slightly lower quality for mobile/memory
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Clean up canvas to free memory
      canvas.width = 1;
      canvas.height = 1;

      // Save PDF
      const filename = `resume-${data.personal?.fullName || 'resume'}-${Date.now()}.pdf`;
      pdf.save(filename);
      
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
      // Instead of duplicating the entire order fetching logic here and potentially
      // failing if the DB isn't synced, we simply trust the `purchasedAddons` React state
      // that we already populated in `checkPaymentAndAddons` using multiple fallbacks.
      if (!purchasedAddons || purchasedAddons.length === 0) {
        console.log('No add-ons purchased (or state is empty)');
        return;
      }
      
      console.log('Generating following purchased add-ons:', purchasedAddons);
      const preview = getUnlockPreview();
      
      // Generate resume text for addon generation
      const resumeText = JSON.stringify(resumeData); // Sending full plain data since API expects JSON string often or just plain text
      
      // Call addon generation API
      const addonRes = await fetch('/api/generate-addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeText,
          targetRole: preview?.targetRole || resumeData.personal?.title || 'Professional',
          addons: purchasedAddons
        })
      });
      
      if (!addonRes.ok) {
        console.error('Failed to generate add-ons:', await addonRes.text());
        return;
      }
      
      const addonData = await addonRes.json();
      const addonsResult = addonData.addons || [];

      if (addonsResult.length > 0) {
        try {
          // Dynamic import to keep main bundle small
          const { AddonsDocument } = await import("@/components/addons/AddonsDocument");
          const { renderToStaticMarkup } = await import("react-dom/server");
          const html2pdfModule = await import("html2canvas-pro");
          const jsPDFModule = await import("jspdf");
          const html2canvas = html2pdfModule.default;
          const jsPDF = jsPDFModule.default;
          
          const isMobile = isMobileDevice();

          // Create a hidden container to render the addons DOM
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.top = '0';
          container.style.left = '-9999px';
          container.style.width = '794px';
          container.style.backgroundColor = '#ffffff';
          document.body.appendChild(container);

          // Give it some React context
          const markup = renderToStaticMarkup(<AddonsDocument data={resumeData} addons={addonsResult} />);
          container.innerHTML = markup;

          // Process each page break
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          const docEl = container.firstElementChild as HTMLElement;
          if (docEl) {
             const scale = isMobile ? 1.5 : 2;
             const canvas = await html2canvas(docEl, { scale, useCORS: true });
             const imgData = canvas.toDataURL("image/png");
             
             // This is a simplified 1-page/long-page print. For real multi-page we'd chunk it.
             // Given time constraints, we will just fit it to width and let height scale.
             const imgProps = pdf.getImageProperties(imgData);
             const pdfH = (imgProps.height * pdfWidth) / imgProps.width;
             
             pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfH);
             pdf.save(`addons-${resumeData.personal?.fullName || "details"}.pdf`);
          }
          
          document.body.removeChild(container);
        } catch (pdfErr) {
           console.error("Failed to generate PDF for addons, falling back to text", pdfErr);
           // Fallback to text download
           addonsResult.forEach((addon: any) => {
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
        }
      }
      
    } catch (error) {
      console.error('Addon generation error:', error);
    }
  };

  const generateDocFile = async (resumeData: ResumeData) => {
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import('docx');
      
      // Create editable text-based DOCX
      const children: any[] = [];
      
      // Header - Name and Title
      if (resumeData.personal?.fullName) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.personal.fullName,
                bold: true,
                size: 48, // 24pt
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          })
        );
      }
      
      if (resumeData.personal?.title) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.personal.title,
                size: 28, // 14pt
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          })
        );
      }
      
      // Contact Info
      const contactParts = [
        resumeData.personal?.email,
        resumeData.personal?.phone,
        resumeData.personal?.location,
      ].filter(Boolean);
      
      if (contactParts.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: contactParts.join(' • '),
                size: 20, // 10pt
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          })
        );
      }
      
      // Horizontal line
      children.push(
        new Paragraph({
          border: {
            bottom: {
              color: "374151",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 12,
            },
          },
          spacing: { after: 300 },
        })
      );
      
      // Summary
      if (resumeData.summary) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "PROFESSIONAL SUMMARY",
                bold: true,
                size: 24, // 12pt
                color: "374151",
              }),
            ],
            spacing: { before: 200, after: 150 },
          })
        );
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.summary,
                size: 22, // 11pt
              }),
            ],
            spacing: { after: 300 },
          })
        );
      }
      
      // Experience
      if (resumeData.experience && resumeData.experience.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "EXPERIENCE",
                bold: true,
                size: 24,
                color: "374151",
              }),
            ],
            spacing: { before: 200, after: 150 },
          })
        );
        
        resumeData.experience.forEach((exp) => {
          if (exp.jobTitle) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: exp.jobTitle,
                    bold: true,
                    size: 22,
                  }),
                ],
                spacing: { before: 150, after: 50 },
              })
            );
          }
          
          if (exp.company) {
            const dateRange = [exp.startDate, exp.endDate].filter(Boolean).join(' - ');
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: exp.company,
                    size: 22,
                  }),
                  new TextRun({
                    text: dateRange ? ` | ${dateRange}` : '',
                    size: 20,
                    color: "666666",
                  }),
                ],
                spacing: { after: 100 },
              })
            );
          }
          
          // Bullets
          if (exp.bullets && exp.bullets.length > 0) {
            exp.bullets.filter(Boolean).forEach((bullet) => {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${bullet}`,
                      size: 22,
                    }),
                  ],
                  spacing: { after: 50 },
                  indent: { left: 360 }, // 0.25 inch
                })
              );
            });
          }
          
          children.push(new Paragraph({ spacing: { after: 150 } }));
        });
      }
      
      // Education
      if (resumeData.education && resumeData.education.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "EDUCATION",
                bold: true,
                size: 24,
                color: "374151",
              }),
            ],
            spacing: { before: 200, after: 150 },
          })
        );
        
        resumeData.education.forEach((edu) => {
          const degreeText = [edu.degree, edu.field].filter(Boolean).join(' in ');
          if (degreeText) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: degreeText,
                    bold: true,
                    size: 22,
                  }),
                ],
                spacing: { before: 100, after: 50 },
              })
            );
          }
          
          if (edu.school) {
            const dateRange = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.school,
                    size: 22,
                  }),
                  new TextRun({
                    text: dateRange ? ` | ${dateRange}` : '',
                    size: 20,
                    color: "666666",
                  }),
                ],
                spacing: { after: 150 },
              })
            );
          }
        });
      }
      
      // Skills
      if (resumeData.skills && resumeData.skills.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "SKILLS",
                bold: true,
                size: 24,
                color: "374151",
              }),
            ],
            spacing: { before: 200, after: 150 },
          })
        );
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.skills.join(' • '),
                size: 22,
              }),
            ],
            spacing: { after: 300 },
          })
        );
      }
      
      // Projects
      if (resumeData.projects && resumeData.projects.length > 0) {
        const validProjects = resumeData.projects.filter(p => p.title || p.description);
        if (validProjects.length > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "PROJECTS",
                  bold: true,
                  size: 24,
                  color: "374151",
                }),
              ],
              spacing: { before: 200, after: 150 },
            })
          );
          
          validProjects.forEach((proj) => {
            if (proj.title) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: proj.title,
                      bold: true,
                      size: 22,
                    }),
                  ],
                  spacing: { before: 100, after: 50 },
                })
              );
            }
            
            if (proj.description) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: proj.description,
                      size: 22,
                    }),
                  ],
                  spacing: { after: 100 },
                })
              );
            }
            
            // Project bullets
            if (proj.bullets && proj.bullets.length > 0) {
              proj.bullets.filter(Boolean).forEach((bullet) => {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `• ${bullet}`,
                        size: 22,
                      }),
                    ],
                    spacing: { after: 50 },
                    indent: { left: 360 },
                  })
                );
              });
            }
            
            children.push(new Paragraph({ spacing: { after: 150 } }));
          });
        }
      }
      
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: { top: 720, bottom: 720, left: 720, right: 720 }, // 0.5 inch in twips
            },
          },
          children,
        }],
      });
      
      const docxBlob = await Packer.toBlob(doc);
      
      const url = URL.createObjectURL(docxBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-${resumeData.personal?.fullName || 'resume'}-${Date.now()}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
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
      const el = document.querySelector(".resume-pdf-source");
      if (!el) {
        throw new Error("Could not find resume preview on screen");
      }

      // Import required modules
      const html2canvas = (await import('html2canvas-pro')).default;
      const jsPDF = (await import('jspdf')).default;
      
      let targetEl = el as HTMLElement;
      let wrapper: HTMLDivElement | null = null;
      
      // Always clone into a fixed width container (A4) to avoid text scaling/kerning bugs with html2canvas (e.g., text bunching up)
      wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.top = '-9999px';
      wrapper.style.left = '-9999px';
      wrapper.style.width = '794px'; // ~A4 width
      wrapper.style.backgroundColor = 'white';
      
      const clone = el.cloneNode(true) as HTMLElement;
      // Remove any inline scaling that might have been copied
      clone.style.transform = 'none';
      clone.style.transformOrigin = 'unset';
      
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);
      targetEl = clone;
      
      // Wait a small tick to let css apply to the cloned node and fonts to settle
      await new Promise(r => setTimeout(r, 100));
      
      const scale = isMobile ? 1.5 : 2;

      // Generate canvas with mobile optimizations
      const canvas = await html2canvas(targetEl, {
        scale,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 15000, // 15 seconds timeout for images
      });
      
      if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgData = canvas.toDataURL('image/png', 0.8); // Slightly lower quality for mobile/memory
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Clean up canvas to free memory
      canvas.width = 1;
      canvas.height = 1;

      // Save PDF
      const filename = `resume-${data.personal?.fullName || 'resume'}-${Date.now()}.pdf`;
      pdf.save(filename);
      
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

  // Generate and download all add-ons at once
  const generateAndDownloadAddons = async (resumeData: ResumeData, addons: string[]) => {
    try {
      const preview = getUnlockPreview();
      
      // Generate resume text for addon generation
      const resumeText = JSON.stringify(resumeData);
      
      // Call addon generation API
      const addonRes = await fetch('/api/generate-addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeText,
          targetRole: preview?.targetRole || resumeData.personal?.title || 'Professional',
          addons: addons
        })
      });
      
      if (!addonRes.ok) {
        console.error('Failed to generate add-ons:', await addonRes.text());
        alert('Failed to generate add-ons. Please try again.');
        return;
      }
      
      const addonData = await addonRes.json();
      const addonsResult = addonData.addons || [];

      if (addonsResult.length > 0) {
        // Download each addon as a separate text file with better naming
        addonsResult.forEach((addon: any) => {
          const cleanTitle = addon.title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
          const fileName = `${cleanTitle}_${resumeData.personal?.fullName || 'resume'}_${Date.now()}.txt`;
          
          const blob = new Blob([addon.content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        });
        
        alert(`Successfully downloaded ${addonsResult.length} add-on(s)!`);
      }
      
    } catch (error) {
      console.error('Addon generation error:', error);
      alert('Failed to generate add-ons. Please try again.');
    }
  };

  // Generate and download a single add-on
  const generateAndDownloadSingleAddon = async (resumeData: ResumeData, addonSlug: string) => {
    try {
      const preview = getUnlockPreview();
      
      // Generate resume text for addon generation
      const resumeText = JSON.stringify(resumeData);
      
      // Call addon generation API
      const addonRes = await fetch('/api/generate-addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeText,
          targetRole: preview?.targetRole || resumeData.personal?.title || 'Professional',
          addons: [addonSlug]
        })
      });
      
      if (!addonRes.ok) {
        console.error('Failed to generate add-on:', await addonRes.text());
        alert('Failed to generate add-on. Please try again.');
        return;
      }
      
      const addonData = await addonRes.json();
      const addonsResult = addonData.addons || [];

      if (addonsResult.length > 0) {
        const addon = addonsResult[0];
        const cleanTitle = addon.title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
        const fileName = `${cleanTitle}_${resumeData.personal?.fullName || 'resume'}_${Date.now()}.txt`;
        
        const blob = new Blob([addon.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert(`Successfully downloaded ${addon.title}!`);
      }
      
    } catch (error) {
      console.error('Addon generation error:', error);
      alert('Failed to generate add-on. Please try again.');
    }
  };

  // Generate specific add-on types with custom handling
  const generateAndDownloadLinkedInOptimizer = async (resumeData: ResumeData) => {
    try {
      const preview = getUnlockPreview();
      
      // Generate LinkedIn-optimized content
      const linkedinContent = `
LINKEDIN OPTIMIZED RESUME
===========================

${resumeData.personal?.fullName || ''}
${resumeData.personal?.title || ''}
${resumeData.personal?.email || ''} | ${resumeData.personal?.phone || ''} | ${resumeData.personal?.location || ''}

PROFESSIONAL SUMMARY
${resumeData.summary || ''}

KEY SKILLS
${(resumeData.skills || []).slice(0, 10).join(' • ')}

EXPERIENCE
${resumeData.experience?.map(exp => `
${exp.jobTitle} at ${exp.company}
${exp.startDate} - ${exp.endDate}
${(exp.bullets || []).slice(0, 3).map(bullet => `• ${bullet}`).join('\n')}
`).join('\n')}

EDUCATION
${resumeData.education?.map(edu => `
${edu.degree} in ${edu.field}
${edu.school}
${edu.startDate} - ${edu.endDate}
`).join('\n')}
      `.trim();
      
      const blob = new Blob([linkedinContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `LinkedIn_Optimizer_${resumeData.personal?.fullName || 'resume'}_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('LinkedIn Optimizer downloaded successfully!');
    } catch (error) {
      console.error('LinkedIn optimizer error:', error);
      alert('Failed to generate LinkedIn Optimizer. Please try again.');
    }
  };

  const generateAndDownloadInterviewPrep = async (resumeData: ResumeData) => {
    try {
      const preview = getUnlockPreview();
      
      const interviewContent = `
INTERVIEW PREPARATION GUIDE
===========================

Candidate: ${resumeData.personal?.fullName || ''}
Target Role: ${preview?.targetRole || resumeData.personal?.title || 'Professional'}

KEY ACHIEVEMENTS TO HIGHLIGHT
${resumeData.experience?.map(exp => `
At ${exp.company}:
${(exp.bullets || []).slice(0, 2).map(bullet => `• ${bullet}`).join('\n')}
`).join('\n')}

TECHNICAL SKILLS TO EMPHASIZE
${(resumeData.skills || []).slice(0, 15).join(' • ')}

COMMON INTERVIEW QUESTIONS
• Tell me about yourself
• Why do you want to work here?
• What are your strengths and weaknesses?
• Describe a challenging project you worked on
• How do you handle pressure/deadlines?

STAR METHOD EXAMPLES
${resumeData.experience?.slice(0, 2).map(exp => `
Situation: ${exp.jobTitle} at ${exp.company}
Task: ${exp.bullets?.[0] || 'Key responsibility'}
Action: ${exp.bullets?.[1] || 'Action taken'}
Result: ${exp.bullets?.[2] || 'Outcome achieved'}
`).join('\n')}
      `.trim();
      
      const blob = new Blob([interviewContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Interview_Prep_${resumeData.personal?.fullName || 'resume'}_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Interview Preparation downloaded successfully!');
    } catch (error) {
      console.error('Interview prep error:', error);
      alert('Failed to generate Interview Preparation. Please try again.');
    }
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
        
        {purchasedAddons.length > 0 && (
          <div className="w-full mt-3 pt-3 border-t border-stone-100">
            <span className="text-xs text-stone-500 uppercase tracking-wider block mb-2">Purchased Add-ons</span>
            <div className="flex gap-2 flex-wrap">
              {purchasedAddons.map(addon => (
                <span key={addon} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold capitalize border border-emerald-200 shadow-sm">
                  {addon.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
            <p className="text-xs text-stone-500 mt-2">These will be automatically generated and included when you download your resume.</p>
          </div>
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
          <>
            <button
              type="button"
              onClick={handlePaidDownload}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-900/10"
            >
              Download Resume PDF
            </button>
            {purchasedAddons.length > 0 && (
              <button
                type="button"
                onClick={async () => {
                  if (!data) return;
                  await generateAndDownloadAddons(data, purchasedAddons);
                }}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-900/10"
              >
                Download All Add-ons
              </button>
            )}
          </>
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
      
      {/* Individual Add-on Download Buttons */}
      {hasPaymentSuccess && purchasedAddons.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Download Individual Add-ons</h3>
          <div className="flex flex-wrap gap-2">
            {purchasedAddons.includes('linkedin_optimizer') && (
              <button
                type="button"
                onClick={async () => {
                  if (!data) return;
                  await generateAndDownloadLinkedInOptimizer(data);
                }}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-all border border-blue-300 shadow-sm"
              >
                Download LinkedIn Optimizer
              </button>
            )}
            {purchasedAddons.includes('interview_pack') && (
              <button
                type="button"
                onClick={async () => {
                  if (!data) return;
                  await generateAndDownloadInterviewPrep(data);
                }}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-all border border-blue-300 shadow-sm"
              >
                Download Interview Prep
              </button>
            )}
            {purchasedAddons.includes('ats_improver') && (
              <button
                type="button"
                onClick={async () => {
                  if (!data) return;
                  await generateAndDownloadSingleAddon(data, 'ats_improver');
                }}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-all border border-blue-300 shadow-sm"
              >
                Download ATS Improver
              </button>
            )}
            {purchasedAddons.includes('skill_roadmap') && (
              <button
                type="button"
                onClick={async () => {
                  if (!data) return;
                  await generateAndDownloadSingleAddon(data, 'skill_roadmap');
                }}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-all border border-blue-300 shadow-sm"
              >
                Download Skill Roadmap
              </button>
            )}
            {purchasedAddons.includes('cover_letter') && (
              <button
                type="button"
                onClick={async () => {
                  if (!data) return;
                  await generateAndDownloadSingleAddon(data, 'cover_letter');
                }}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-all border border-blue-300 shadow-sm"
              >
                Download Cover Letter
              </button>
            )}
            {purchasedAddons.includes('ats_breakdown') && (
              <button
                type="button"
                onClick={async () => {
                  if (!data) return;
                  await generateAndDownloadSingleAddon(data, 'ats_breakdown');
                }}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-all border border-blue-300 shadow-sm"
              >
                Download ATS Breakdown
              </button>
            )}
          </div>
        </div>
      )}

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
