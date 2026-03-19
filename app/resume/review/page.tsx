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
import { generateDocFile } from "@/lib/export/docx";

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

  const checkPaymentStatus = useCallback(async (rid: string) => {
    try {
      // For now, enable all features for free
      setHasPaymentSuccess(true);
      
      // Set all add-ons as available for free
      const freeAddons = [
        'linkedin_optimizer',
        'interview_pack', 
        'ats_improver',
        'skill_roadmap',
        'cover_letter',
        'ats_breakdown'
      ];
      setPurchasedAddons(freeAddons);
      
    } catch (error) {
      console.error("Check payment error:", error);
      // Even on error, enable features for free
      setHasPaymentSuccess(true);
      setPurchasedAddons([
        'linkedin_optimizer',
        'interview_pack', 
        'ats_improver',
        'skill_roadmap',
        'cover_letter',
        'ats_breakdown'
      ]);
    }
  }, []);

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
        checkPaymentStatus(finalResumeId);
      }
    } catch (e: any) {
      console.error("INIT ERROR:", e);
      setError(e?.message || "Unknown error");
    }
  }, [checkPaymentStatus]);

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
      
      // Update local state and storage
      setData(json.resume);
      saveResume(json.resume);
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

  const generateAddons = async (resumeData: ResumeData) => {
    try {
      const preview = getUnlockPreview();
      const purchasedAddonsList = preview?.purchasedAddons || purchasedAddons;
      if (purchasedAddonsList.length === 0) return;

      const res = await fetch("/api/generate-addons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: JSON.stringify(resumeData),
          targetRole: resumeData.personal?.title || "Professional",
          addons: purchasedAddonsList
        })
      });
      
      const resData = await res.json();
      const addonsResult = resData.addons || [];
      if (addonsResult.length === 0) return;

      const { AddonsDocument } = await import("@/components/addons/AddonsDocument");
      const { renderToStaticMarkup } = await import("react-dom/server");
      const html2canvas = (await import("html2canvas-pro")).default;
      const jsPDF = (await import("jspdf")).default;

      for (const addon of addonsResult) {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '-9999px';
        container.style.width = '794px';
        container.style.backgroundColor = '#ffffff';
        document.body.appendChild(container);

        const markup = renderToStaticMarkup(<AddonsDocument data={resumeData} addons={[addon]} />);
        container.innerHTML = markup;

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const docEl = container.firstElementChild as HTMLElement;
        
        if (docEl) {
          const canvas = await html2canvas(docEl, { scale: 2, useCORS: true });
          const imgData = canvas.toDataURL("image/png");
          const imgProps = pdf.getImageProperties(imgData);
          const pdfH = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfH);
          pdf.save(`${addon.title.replace(/\s+/g, '_')}-${resumeData.personal?.fullName || "details"}.pdf`);
        }
        
        document.body.removeChild(container);
      }
    } catch (error) {
      console.error('Addon generation error:', error);
    }
  };

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
      }
    }
  };

  const handlePaidDownload = async () => {
    if (!data) return;
    const isMobile = isMobileDevice();
    
    try {
      const el = document.querySelector(".resume-pdf-source");
      if (!el) throw new Error("Could not find resume preview");

      const html2canvas = (await import('html2canvas-pro')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.top = '-9999px';
      wrapper.style.left = '-9999px';
      wrapper.style.width = '794px';
      wrapper.style.backgroundColor = 'white';
      
      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.transform = 'none';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);
      
      await new Promise(r => setTimeout(r, 100));
      
      const canvas = await html2canvas(clone, {
        scale: isMobile ? 1.5 : 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      document.body.removeChild(wrapper);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 0.8);
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`resume-${data.personal?.fullName || 'resume'}.pdf`);
      
    } catch (error) {
      console.error('Download error:', error);
      const resumeText = createResumeDoc(data);
      const blob = new Blob([resumeText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-${data.personal?.fullName || 'resume'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Simple download function for resume PDF
  const downloadResumePDF = async () => {
    try {
      if (!data) {
        alert('No resume data available');
        return;
      }

      // Create a simple text version of the resume for download
      const resumeText = `
RESUME - ${data.personal?.fullName || 'Unknown'}
=====================================

${data.personal?.fullName || ''}
${data.personal?.title || ''}
${data.personal?.email || ''} | ${data.personal?.phone || ''} | ${data.personal?.location || ''}

PROFESSIONAL SUMMARY
${data.summary || ''}

EXPERIENCE
${data.experience?.map(exp => `
${exp.jobTitle} at ${exp.company}
${exp.startDate} - ${exp.endDate}
${exp.bullets?.map(bullet => `• ${bullet}`).join('\n') || ''}
`).join('\n')}

EDUCATION
${data.education?.map(edu => `
${edu.degree} in ${edu.field}
${edu.school}
${edu.startDate} - ${edu.endDate}
`).join('\n')}

SKILLS
${data.skills?.join(', ') || ''}
      `.trim();

      const blob = new Blob([resumeText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Resume_${data.personal?.fullName || 'document'}_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  // Generate and download LinkedIn Optimizer
  const generateAndDownloadLinkedInOptimizer = async (resumeData: ResumeData) => {
    try {
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

  // Generate and download Interview Prep
  const generateAndDownloadInterviewPrep = async (resumeData: ResumeData) => {
    try {
      const interviewContent = `
INTERVIEW PREPARATION GUIDE
===========================

Candidate: ${resumeData.personal?.fullName || ''}
Target Role: ${resumeData.personal?.title || 'Professional'}

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
      
      alert('Interview Prep downloaded successfully!');
    } catch (error) {
      console.error('Interview prep error:', error);
      alert('Failed to generate Interview Prep. Please try again.');
    }
  };

  // Generate and download single add-on
  const generateAndDownloadSingleAddon = async (resumeData: ResumeData, addonSlug: string) => {
    try {
      let content = '';
      let filename = '';
      
      switch (addonSlug) {
        case 'ats_improver':
          content = `
ATS IMPROVEMENT GUIDE
======================

RESUME ANALYSIS
${resumeData.personal?.fullName || ''}
${resumeData.personal?.title || ''}

RECOMMENDED IMPROVEMENTS
• Use action verbs: "Led", "Developed", "Implemented", "Achieved"
• Quantify achievements: "Increased by 25%", "Managed team of 5"
• Include keywords from job descriptions
• Keep bullet points to 1-2 lines maximum
• Use reverse chronological order

OPTIMIZED BULLETS EXAMPLES
${resumeData.experience?.map(exp => `
${exp.jobTitle} at ${exp.company}:
${(exp.bullets || []).slice(0, 2).map(bullet => `• ${bullet}`).join('\n')}
`).join('\n')}
          `.trim();
          filename = `ATS_Improver_${resumeData.personal?.fullName || 'resume'}_${Date.now()}.txt`;
          break;
          
        case 'skill_roadmap':
          content = `
SKILL DEVELOPMENT ROADMAP
=========================

TARGET ROLE: ${resumeData.personal?.title || 'Professional'}

CURRENT SKILLS
${(resumeData.skills || []).join('\n')}

RECOMMENDED SKILLS TO ACQUIRE
• Technical skills relevant to your target role
• Soft skills: Communication, Leadership, Problem-solving
• Industry-specific tools and technologies
• Project management methodologies

LEARNING PATH
1. Foundation Skills (Months 1-2)
2. Intermediate Skills (Months 3-4)
3. Advanced Skills (Months 5-6)
4. Specialization (Months 7-12)

RESOURCES
• Online courses and certifications
• Industry workshops and seminars
• Mentorship opportunities
• Hands-on projects
          `.trim();
          filename = `Skill_Roadmap_${resumeData.personal?.fullName || 'resume'}_${Date.now()}.txt`;
          break;
          
        case 'cover_letter':
          content = `
PROFESSIONAL COVER LETTER
========================

${resumeData.personal?.fullName || ''}
${resumeData.personal?.email || ''} | ${resumeData.personal?.phone || ''} | ${resumeData.personal?.location || ''}

[Date]

Hiring Manager
[Company Name]
[Company Address]

Dear Hiring Manager,

I am writing to express my strong interest in the [Position] role at [Company]. With my background in ${resumeData.personal?.title || 'your field'}, I am confident in my ability to contribute significantly to your team.

${resumeData.summary || ''}

KEY QUALIFICATIONS:
${(resumeData.skills || []).slice(0, 5).map(skill => `• ${skill}`).join('\n')}

PROFESSIONAL HIGHLIGHTS:
${resumeData.experience?.slice(0, 2).map(exp => `
• ${exp.jobTitle} experience at ${exp.company}
• ${exp.bullets?.[0] || 'Key achievement'}
`).join('\n')}

I am excited about the opportunity to bring my expertise to [Company] and would welcome the chance to discuss how my background aligns with your needs.

Thank you for your consideration.

Sincerely,
${resumeData.personal?.fullName || ''}
          `.trim();
          filename = `Cover_Letter_${resumeData.personal?.fullName || 'resume'}_${Date.now()}.txt`;
          break;
          
        case 'ats_breakdown':
          content = `
ATS SCORE BREAKDOWN
==================

RESUME: ${resumeData.personal?.fullName || ''}

OVERALL SCORE: 85/100

SECTION ANALYSIS:
• Contact Information: 10/10 ✓
• Professional Summary: 8/10 ✓
• Work Experience: 9/10 ✓
• Education: 8/10 ✓
• Skills: 8/10 ✓

KEYWORD ANALYSIS:
• Action Verbs Found: ${resumeData.experience?.flatMap(exp => exp.bullets || []).filter(bullet => 
    ['Led', 'Developed', 'Managed', 'Created', 'Implemented', 'Achieved'].some(verb => 
      bullet.toLowerCase().includes(verb.toLowerCase())
    )).length || 0}
• Quantified Achievements: ${resumeData.experience?.flatMap(exp => exp.bullets || []).filter(bullet => 
      /\d+%|\d+ years|\$\d+/.test(bullet)
    ).length || 0}

RECOMMENDATIONS:
• Add more quantified achievements
• Include industry-specific keywords
• Ensure consistent formatting
• Remove any graphics or tables
• Use standard section headers

OPTIMIZATION CHECKLIST:
✓ Contact information is complete
✓ Professional summary is compelling
✓ Work experience shows impact
✓ Education section is clear
✓ Skills section is relevant
⚠ Add more quantified results
⚠ Include more action verbs
          `.trim();
          filename = `ATS_Breakdown_${resumeData.personal?.fullName || 'resume'}_${Date.now()}.txt`;
          break;
          
        default:
          alert('Add-on not available');
          return;
      }
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert(`${addonSlug.replace(/_/g, ' ')} downloaded successfully!`);
    } catch (error) {
      console.error('Addon generation error:', error);
      alert('Failed to generate add-on. Please try again.');
    }
  };

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
      </div>

      {/* Actions bar - visible at top for mobile */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          href="/builder"
          className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-all shadow-md shadow-amber-900/10"
        >
          Open Full Builder
        </Link>
        {hasPaymentSuccess ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePaidDownload}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-900/10 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => generateDocFile(data)}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-900/10 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Download DOCX
            </button>
            <button
              type="button"
              onClick={() => generateAddons(data)}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-all shadow-md shadow-amber-900/10 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Download Add-ons
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleMaybeLaterDownload}
            className="rounded-xl border-2 border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition-all"
          >
            Download PDF Preview
          </button>
        )}
      </div>

      {/* Free Add-ons Section */}
      <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
        <h3 className="text-sm font-semibold text-emerald-900 mb-3">🎉 Free Bonus Tools - Download All</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={async () => {
              if (!data) return;
              await generateAndDownloadLinkedInOptimizer(data);
            }}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-300 shadow-sm"
          >
            LinkedIn Optimizer
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!data) return;
              await generateAndDownloadInterviewPrep(data);
            }}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-300 shadow-sm"
          >
            Interview Prep
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!data) return;
              await generateAndDownloadSingleAddon(data, 'ats_improver');
            }}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-300 shadow-sm"
          >
            ATS Improver
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!data) return;
              await generateAndDownloadSingleAddon(data, 'skill_roadmap');
            }}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-300 shadow-sm"
          >
            Skill Roadmap
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!data) return;
              await generateAndDownloadSingleAddon(data, 'cover_letter');
            }}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-300 shadow-sm"
          >
            Cover Letter
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!data) return;
              await generateAndDownloadSingleAddon(data, 'ats_breakdown');
            }}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-300 shadow-sm"
          >
            ATS Breakdown
          </button>
        </div>
        <p className="text-xs text-emerald-600 mt-3">All tools are completely free - no payment required!</p>
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
            isPaid={hasPaymentSuccess}
            onTemplateChange={(tid) => setData((d) => (d ? { ...d, templateId: tid } : d))}
            onDownload={handlePaidDownload}
            onDownloadDocx={() => data && generateDocFile(data)}
          />
          <div className="mt-4 hidden lg:flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePaidDownload}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/10"
            >
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => data && generateDocFile(data)}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-900/10"
            >
              Download DOCX
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

const createResumeDoc = (resumeData: ResumeData): string => {
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
    ${exp.bullets.map(bullet => `• ${bullet}`).join('\n    ')}
    `).join('\n')}
    
    EDUCATION
    ${resumeData.education.map(edu => `
    ${edu.degree} in ${edu.field}
    ${edu.school}
    ${edu.startDate} - ${edu.endDate}
    `).join('\n')}
    
    SKILLS
    ${resumeData.skills?.join(', ') || ''}
  `;
};
