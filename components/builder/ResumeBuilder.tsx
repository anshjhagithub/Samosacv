"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type {
  ResumeData,
  PersonalInfo,
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
} from "@/types/resume";
import {
  createEmptyExperience,
  createEmptyEducation,
  createEmptyProject,
} from "@/types/resume";
import { SectionCard } from "@/components/ui/SectionCard";
import { SamosaLogoFull } from "@/components/brand/SamosaLogo";
import { loadOnboarding } from "@/lib/onboardingStorage";
import { getUnlockPreview, setUnlockPreview } from "@/lib/storage/resumeStorage";
import { openCashfreeCheckout } from "@/lib/cashfree";
import { getPrice, ADDON_SLUGS, type FeatureSlug } from "@/lib/pricing";

const ResumePreviewPanel = dynamic(
  () => import("@/components/builder/ResumePreviewPanel").then((m) => ({ default: m.ResumePreviewPanel })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col h-full min-h-[500px] rounded-2xl border border-stone-200 bg-white overflow-hidden animate-pulse shadow-sm">
        <div className="h-14 border-b border-stone-200 bg-stone-50" />
        <div className="flex-1 flex items-center justify-center p-6">
          <span className="text-stone-500 text-sm">Loading preview…</span>
        </div>
      </div>
    ),
  }
);
import { scoreResume } from "@/lib/ats/engine.client";
import { generateDocFile } from "@/lib/export/docx";
import { rolePresets } from "@/lib/rolePresets";

const inputClass =
  "w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all shadow-sm";
const labelClass = "block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5";

const SECTIONS = [
  { id: "personal", label: "Personal", icon: "👤" },
  { id: "summary", label: "Summary", icon: "✏️" },
  { id: "experience", label: "Experience", icon: "💼" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "projects", label: "Projects", icon: "📁" },
  { id: "skills", label: "Skills", icon: "⚡" },
] as const;

interface ResumeBuilderProps {
  data: ResumeData;
  onUpdate: (data: ResumeData) => void;
}

function resumeToText(d: ResumeData): string {
  const parts: string[] = [];
  if (d.personal?.fullName) parts.push(d.personal.fullName);
  if (d.personal?.title) parts.push(d.personal.title);
  if (d.summary) parts.push("\nSummary\n" + d.summary);
  parts.push("\nExperience");
  (d.experience ?? []).forEach((e) => {
    parts.push(`\n${e.jobTitle} at ${e.company}`);
    (e.bullets ?? []).forEach((b) => parts.push("• " + b));
  });
  parts.push("\nSkills\n" + (d.skills ?? []).join(", "));
  return parts.join("\n");
}

export function ResumeBuilder({ data, onUpdate }: ResumeBuilderProps) {
  const router = useRouter();
  const persist = useCallback((next: ResumeData) => onUpdate(next), [onUpdate]);
  const [isPaid, setIsPaid] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [purchasedAddons, setPurchasedAddons] = useState<FeatureSlug[]>([]);
  const [addonCart, setAddonCart] = useState<Partial<Record<FeatureSlug, boolean>>>({});
  const handleDownloadResume = useCallback(() => {
    // Persist builder addon selections so the unlock page can pre-select them
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('samosa_builder_addon_cart', JSON.stringify(addonCart));
      } catch {}
    }
    router.push("/unlock");
  }, [router, addonCart]);
  const [improvingSummary, setImprovingSummary] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [regenCredits, setRegenCredits] = useState(0);
  const [regenUnlimited, setRegenUnlimited] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenPayLoading, setRegenPayLoading] = useState(false);
  const [summaryImproveCredits, setSummaryImproveCredits] = useState(0);
  const [projectImproveCredits, setProjectImproveCredits] = useState(0);
  const [improveUnlimited, setImproveUnlimited] = useState(false);
  const [improvePayLoading, setImprovePayLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeIdRef = useRef<string | null>(null);

  // Free ATS score + skill suggestions (no API cost)
  const [freeAtsScore, setFreeAtsScore] = useState<number | null>(null);
  const [freeAtsBd, setFreeAtsBd] = useState<Record<string, number>>({});
  const [freeMissing, setFreeMissing] = useState<string[]>([]);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [roleIntelSkills, setRoleIntelSkills] = useState<string[]>([]);
  const [roleIntelVerbs, setRoleIntelVerbs] = useState<string[]>([]);
  const atsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if user already paid for this resume
  useEffect(() => {
    const checkPaidStatus = async () => {
      try {
        const preview = getUnlockPreview();
        if (!preview?.resumeId) return;
        const res = await fetch(`/api/feature-gate?resumeId=${encodeURIComponent(preview.resumeId)}&feature=resume_pdf`);
        if (res.ok) {
          const j = await res.json();
          if (j.granted) {
            setIsPaid(true);
            if (j.purchasedAddons) {
              setPurchasedAddons(j.purchasedAddons);
            }
          }
        }
      } catch {}
    };
    checkPaidStatus();
  }, []);

  // Auto-compute free ATS score whenever resume data changes (debounced)
  useEffect(() => {
    if (atsTimerRef.current) clearTimeout(atsTimerRef.current);
    atsTimerRef.current = setTimeout(() => {
      const targetRole = data.personal?.title || "";
      if (!targetRole) return;
      const text = resumeToText(data);
      if (text.length < 50) return;
      fetch("/api/free/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text, targetRole }),
      })
        .then((r) => r.json())
        .then((j) => {
          if (typeof j.score === "number") setFreeAtsScore(j.score);
          if (j.breakdown) setFreeAtsBd(j.breakdown);
          if (j.missingSkills) setFreeMissing(j.missingSkills);
        })
        .catch(() => {});

      fetch("/api/free/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: data.skills, targetRole }),
      })
        .then((r) => r.json())
        .then((j) => {
          setSuggestedSkills(Array.isArray(j.missingSkills) ? j.missingSkills.slice(0, 10) : []);
        })
        .catch(() => setSuggestedSkills([]));

      fetch(`/api/free/role-intel?role=${encodeURIComponent(targetRole)}`)
        .then((r) => r.json())
        .then((j) => {
          setRoleIntelSkills(Array.isArray(j.topSkills) ? j.topSkills : []);
          setRoleIntelVerbs(Array.isArray(j.actionVerbs) ? j.actionVerbs : []);
        })
        .catch(() => {
          setRoleIntelSkills([]);
          setRoleIntelVerbs([]);
        });
    }, 1500);
    return () => { if (atsTimerRef.current) clearTimeout(atsTimerRef.current); };
  }, [data]);

  const refreshImproveCredits = useCallback(() => {
    fetch("/api/improve/credits")
      .then((r) => r.json())
      .then((j) => {
        setSummaryImproveCredits(j.summary_improve ?? 0);
        setProjectImproveCredits(j.project_improve ?? 0);
        setImproveUnlimited(!!j.unlimited);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const p = getUnlockPreview();
    if (p?.resumeId) {
      resumeIdRef.current = p.resumeId;
      fetch(`/api/regeneration/credits?resumeId=${encodeURIComponent(p.resumeId)}`)
        .then((r) => r.json())
        .then((j) => {
          setRegenCredits(j.count ?? 0);
          setRegenUnlimited(!!j.unlimited);
        })
        .catch(() => setRegenCredits(0));
    } else {
      const id = crypto.randomUUID?.() ?? `res-${Date.now()}`;
      resumeIdRef.current = id;
      setUnlockPreview({ resumeId: id, atsScore: 0, missingSkills: [] });
    }
    refreshImproveCredits();
  }, [refreshImproveCredits]);

  const payForImprove = useCallback(async (feature: "summary_improve" | "project_improve") => {
    if (improvePayLoading) return;
    setImprovePayLoading(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "builder_improve", feature }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.payment_session_id) {
        await openCashfreeCheckout(j.payment_session_id);
        window.location.href = `/payment-status?order_id=${encodeURIComponent(j.order_id ?? "")}&return=builder`;
      }
    } finally {
      setImprovePayLoading(false);
    }
  }, [improvePayLoading]);

  const improveSummary = useCallback(async () => {
    const hasCredit = improveUnlimited || summaryImproveCredits > 0;
    if (!hasCredit) {
      await payForImprove("summary_improve");
      return;
    }
    setImprovingSummary(true);
    try {
      const res = await fetch("/api/resume/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: data.summary || "Experienced professional.",
          prompt: "improve_summary",
        }),
      });
      const json = await res.json();
      if (res.status === 402) {
        await payForImprove("summary_improve");
        return;
      }
      if (res.ok && json.text) {
        persist({ ...data, summary: json.text });
        if (!improveUnlimited) setSummaryImproveCredits((c) => Math.max(0, c - 1));
      }
    } finally {
      setImprovingSummary(false);
    }
  }, [data, persist, summaryImproveCredits, improveUnlimited, payForImprove]);

  const improveProject = useCallback(async (proj: ProjectEntry) => {
    const hasCredit = improveUnlimited || projectImproveCredits > 0;
    if (!hasCredit) {
      await payForImprove("project_improve");
      return;
    }
    try {
      const res = await fetch("/api/resume/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: proj.description || proj.title || "Project",
          prompt: "improve_project",
        }),
      });
      const json = await res.json();
      if (res.status === 402) {
        await payForImprove("project_improve");
        return;
      }
      if (res.ok && json.text) {
        updateProject(proj.id, { description: json.text });
        if (!improveUnlimited) setProjectImproveCredits((c) => Math.max(0, c - 1));
      }
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectImproveCredits, improveUnlimited, payForImprove]);

  const handleRegeneratePay = useCallback(async () => {
    const rid = resumeIdRef.current;
    if (!rid || regenPayLoading) return;
    setRegenPayLoading(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "regeneration", resumeId: rid }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) return;
      if (j.payment_session_id) await openCashfreeCheckout(j.payment_session_id);
      window.location.href = `/payment-status?order_id=${encodeURIComponent(j.order_id ?? "")}`;
    } finally {
      setRegenPayLoading(false);
    }
  }, [regenPayLoading]);

  const handleRegenerateUse = useCallback(async () => {
    const rid = resumeIdRef.current;
    if (!rid || (regenCredits < 1 && !regenUnlimited) || regenLoading) return;
    setRegenLoading(true);
    try {
      const res = await fetch("/api/resume/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: rid, content: resumeToText(data) }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.resume) {
        persist(j.resume);
        setRegenCredits((c) => Math.max(0, c - 1));
      }
    } finally {
      setRegenLoading(false);
    }
  }, [data, regenCredits, regenUnlimited, regenLoading, persist]);

  const onboarding = typeof window !== "undefined" ? loadOnboarding() : null;
  const roleLabel = onboarding?.roleId ? rolePresets[onboarding.roleId].label : data.personal.title || "Professional";
  const experienceLabel = onboarding?.experienceLevel ?? null;

  const personal = data.personal;
  const setPersonal = (p: PersonalInfo) => persist({ ...data, personal: p });

  const experience = data.experience ?? [];
  const setExperience = (exp: ExperienceEntry[]) => persist({ ...data, experience: exp });

  const education = data.education ?? [];
  const setEducation = (edu: EducationEntry[]) => persist({ ...data, education: edu });

  const projects = data.projects ?? [];
  const setProjects = (proj: ProjectEntry[]) => persist({ ...data, projects: proj });

  const addExperience = () =>
    setExperience([...experience, createEmptyExperience(crypto.randomUUID?.() ?? `exp-${Date.now()}`)]);
  const addEducation = () =>
    setEducation([...education, createEmptyEducation(crypto.randomUUID?.() ?? `edu-${Date.now()}`)]);
  const addProject = () =>
    setProjects([...projects, createEmptyProject(crypto.randomUUID?.() ?? `proj-${Date.now()}`)]);

  const updateExperience = (id: string, upd: Partial<ExperienceEntry>) =>
    setExperience(experience.map((e) => (e.id === id ? { ...e, ...upd } : e)));
  const removeExperience = (id: string) =>
    experience.length > 1 && setExperience(experience.filter((e) => e.id !== id));

  const updateEducation = (id: string, upd: Partial<EducationEntry>) =>
    setEducation(education.map((e) => (e.id === id ? { ...e, ...upd } : e)));
  const removeEducation = (id: string) =>
    education.length > 1 && setEducation(education.filter((e) => e.id !== id));

  const updateProject = (id: string, upd: Partial<ProjectEntry>) =>
    setProjects(projects.map((p) => (p.id === id ? { ...p, ...upd } : p)));
  const removeProject = (id: string) =>
    projects.length > 1 && setProjects(projects.filter((p) => p.id !== id));

  const addProjectLink = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const newLinks = [...(project.links || []), { url: "", label: "" }];
      updateProject(projectId, { links: newLinks });
    }
  };

  const updateProjectLink = (projectId: string, linkIndex: number, field: 'url' | 'label', value: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const newLinks = [...(project.links || [])];
      newLinks[linkIndex] = { ...newLinks[linkIndex], [field]: value };
      updateProject(projectId, { links: newLinks });
    }
  };

  const removeProjectLink = (projectId: string, linkIndex: number) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const newLinks = (project.links || []).filter((_, i) => i !== linkIndex);
      updateProject(projectId, { links: newLinks });
    }
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (s) {
      persist({ ...data, skills: [...data.skills, s] });
      setNewSkill("");
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen " ref={containerRef}>
      {/* Top bar – like big resume builders */}
      <header className="sticky top-0 z-30 border-b border-amber-900/5 bg-gradient-to-b from-amber-50/98 to-white/95 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-0 shrink-0"
          >
            <SamosaLogoFull />
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToSection(s.id)}
                className="shrink-0 px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                <span className="hidden sm:inline mr-1.5">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {experienceLabel && (
              <span className="hidden md:inline text-xs px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                {experienceLabel}
              </span>
            )}
            <span className="hidden lg:inline text-sm text-stone-500">{roleLabel}</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-10">
          {/* Left: form sections */}
          <div className="space-y-6">
            {/* Enhanced Teaser for Free Tools */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <a
                href="#free-tools"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("free-tools")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="block rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-emerald-50/80 to-white p-5 text-center no-underline hover:from-emerald-100/80 transition-all hover:shadow-lg hover:scale-[1.02] group"
              >
                <motion.div 
                  className="flex items-center justify-center gap-2 mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-2xl">🎉</span>
                  <span className="text-lg font-bold text-emerald-700">6 FREE Career Tools</span>
                </motion.div>
                <p className="text-sm font-medium text-stone-800 mb-2">ATS Optimizer • Interview Prep • LinkedIn Optimizer • Cover Letter • Skill Roadmap • ATS Breakdown</p>
                <p className="text-xs text-stone-500 mb-3">All completely free - no payment required. Boost your career with professional tools!</p>
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Try Free Tools Now</span>
                  <motion.span
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >↓</motion.span>
                </motion.div>
              </a>
            </motion.div>

            <section id="personal" className="scroll-mt-24">
              <SectionCard title="Personal information" defaultOpen onImprove={undefined} addLabel="" onAdd={undefined}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Full name</label>
                      <input
                        type="text"
                        value={personal.fullName}
                        onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                        placeholder="Your name"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Professional title</label>
                      <input
                        type="text"
                        value={personal.title}
                        onChange={(e) => setPersonal({ ...personal, title: e.target.value })}
                        placeholder="e.g. Software Engineer"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      value={personal.email}
                      onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input
                        type="tel"
                        value={personal.phone}
                        onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                        placeholder="+1 555 000 0000"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Location</label>
                      <input
                        type="text"
                        value={personal.location}
                        onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                        placeholder="City, Country"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>LinkedIn</label>
                      <input
                        type="url"
                        value={personal.linkedin}
                        onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Website</label>
                      <input
                        type="url"
                        value={personal.website}
                        onChange={(e) => setPersonal({ ...personal, website: e.target.value })}
                        placeholder="https://..."
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Profile photo (optional)</label>
                    <p className="text-stone-500 text-xs mb-2">
                      Add a photo to your resume. Many templates show it in the header or sidebar.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="url"
                        value={personal.photoUrl ?? ""}
                        onChange={(e) =>
                          setPersonal({
                            ...personal,
                            photoUrl: e.target.value.trim() || undefined,
                          })
                        }
                        placeholder="Image URL or upload below"
                        className={`${inputClass} flex-1 min-w-0`}
                      />
                      <label className="shrink-0 cursor-pointer rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              const dataUrl = reader.result as string;
                              setPersonal({ ...personal, photoUrl: dataUrl });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        Upload image
                      </label>
                    </div>
                    {personal.photoUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element -- user upload (data URL) */}
                        <img
                          src={personal.photoUrl}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover border border-stone-200"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPersonal({ ...personal, photoUrl: undefined })
                          }
                          className="text-xs text-stone-500 hover:text-red-600"
                        >
                          Remove photo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            </section>

            <section id="summary" className="scroll-mt-24">
              <SectionCard
                title="Professional summary"
                defaultOpen
                onImprove={improveSummary}
                improveLabel={improveUnlimited || summaryImproveCredits > 0 ? "Improve" : "Improve — ₹1"}
                improveTeaser={!(improveUnlimited || summaryImproveCredits > 0) ? "Mini preview: Stronger verbs, ATS-friendly. Pay ₹1 to see full improvement." : undefined}
                addLabel=""
                onAdd={undefined}
              >
                <div>
                  <label className={labelClass}>Summary</label>
                  <textarea
                    value={data.summary}
                    onChange={(e) => persist({ ...data, summary: e.target.value })}
                    placeholder="2–4 sentences about your experience and goals."
                    rows={5}
                    className={`${inputClass} resize-y min-h-[120px]`}
                  />
                  {improvingSummary && <p className="mt-1.5 text-xs text-accent">Improving with AI…</p>}
                </div>
              </SectionCard>
            </section>

            <section id="experience" className="scroll-mt-24">
              <SectionCard
                title="Work experience"
                defaultOpen
                onImprove={undefined}
                addLabel="Add position"
                onAdd={addExperience}
              >
                <div className="space-y-5">
                  {experience.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="rounded-xl border border-stone-200 bg-white p-4 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-500 font-medium">Position {idx + 1}</span>
                        {experience.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExperience(exp.id)}
                            className="text-xs text-red-400/90 hover:text-red-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                        placeholder="Company name"
                        className={inputClass}
                      />
                      <input
                        type="text"
                        value={exp.jobTitle}
                        onChange={(e) => updateExperience(exp.id, { jobTitle: e.target.value })}
                        placeholder="Job title"
                        className={inputClass}
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                          placeholder="Start (e.g. Jan 2020)"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                          placeholder="End or Present"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Key achievements</label>
                        {exp.bullets?.map((b, i) => (
                          <input
                            key={i}
                            type="text"
                            value={b}
                            onChange={(e) => {
                              const bullets = [...(exp.bullets || [""])];
                              bullets[i] = e.target.value;
                              if (i === bullets.length - 1 && e.target.value) bullets.push("");
                              updateExperience(exp.id, { bullets });
                            }}
                            placeholder={`Bullet ${i + 1}`}
                            className={`${inputClass} mb-2`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </section>

            <section id="education" className="scroll-mt-24">
              <SectionCard
                title="Education"
                defaultOpen
                onImprove={undefined}
                addLabel="Add education"
                onAdd={addEducation}
              >
                <div className="space-y-5">
                  {education.map((edu, idx) => (
                    <div
                      key={edu.id}
                      className="rounded-xl border border-stone-200 bg-white p-4 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-500 font-medium">Education {idx + 1}</span>
                        {education.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEducation(edu.id)}
                            className="text-xs text-red-400/90 hover:text-red-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                        placeholder="School / University"
                        className={inputClass}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                          placeholder="Degree (e.g. B.S.)"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                          placeholder="Field of study"
                          className={inputClass}
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                          placeholder="Start year"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                          placeholder="End year"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={edu.gpa}
                          onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                          placeholder="GPA (optional)"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </section>

            <section id="projects" className="scroll-mt-24">
              <SectionCard
                title="Projects"
                defaultOpen
                onImprove={undefined}
                improveTeaser={!(improveUnlimited || projectImproveCredits > 0) ? "Mini preview: Impact-focused bullets. Pay ₹1 per project to see full improvement." : undefined}
                addLabel="Add project"
                onAdd={addProject}
              >
                <div className="space-y-4">
                  {projects.map((proj, idx) => (
                    <div
                      key={proj.id}
                      className="rounded-xl border border-stone-200 bg-white p-4 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-500 font-medium">Project {idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => improveProject(proj)}
                            className="shrink-0 rounded-lg px-2 py-1 text-xs text-accent hover:bg-accent/10"
                          >
                            {improveUnlimited || projectImproveCredits > 0 ? "Improve ✨" : "Improve — ₹1"}
                          </button>
                          {projects.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeProject(proj.id)}
                              className="text-xs text-red-400/90 hover:text-red-300"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => updateProject(proj.id, { title: e.target.value })}
                        placeholder="Project title"
                        className={inputClass}
                      />
                      <textarea
                        value={proj.description}
                        onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                        placeholder="Brief project description"
                        rows={2}
                        className={`${inputClass} resize-y`}
                      />
                      <div>
                        <label className={labelClass}>Key achievements</label>
                        {proj.bullets?.map((b, i) => (
                          <input
                            key={i}
                            type="text"
                            value={b}
                            onChange={(e) => {
                              const bullets = [...(proj.bullets || [""])];
                              bullets[i] = e.target.value;
                              if (i === bullets.length - 1 && e.target.value) bullets.push("");
                              updateProject(proj.id, { bullets });
                            }}
                            placeholder={`Bullet ${i + 1}`}
                            className={`${inputClass} mb-2`}
                          />
                        ))}
                      </div>
                      <div>
                        <label className={labelClass}>Project Links</label>
                        {proj.links?.map((link, i) => (
                          <div key={i} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={link.label}
                              onChange={(e) => updateProjectLink(proj.id, i, 'label', e.target.value)}
                              placeholder="Label (e.g. GitHub, Demo)"
                              className={`${inputClass} flex-1`}
                            />
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => updateProjectLink(proj.id, i, 'url', e.target.value)}
                              placeholder="https://..."
                              className={`${inputClass} flex-2`}
                            />
                            {(proj.links?.length || 0) > 1 && (
                              <button
                                type="button"
                                onClick={() => removeProjectLink(proj.id, i)}
                                className="text-xs text-red-400/90 hover:text-red-300 px-2 py-1"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addProjectLink(proj.id)}
                          className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                        >
                          + Add Link
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </section>

            <section id="skills" className="scroll-mt-24">
              <SectionCard title="Skills" defaultOpen onImprove={undefined} addLabel="" onAdd={undefined}>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="Add a skill (e.g. Python, React)"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="shrink-0 px-4 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-sm text-stone-900"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() =>
                            persist({ ...data, skills: data.skills.filter((_, j) => j !== i) })
                          }
                          className="text-stone-500 hover:text-stone-900 leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {/* Free skill suggestions from 27K+ resumes */}
                  {suggestedSkills.length > 0 && (
                    <div className="pt-3 border-t border-stone-100">
                      <p className="text-xs font-medium text-amber-700 mb-2">
                        Suggested skills for {data.personal?.title || "this role"} (free)
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedSkills
                          .filter((s) => !data.skills.some((sk) => sk.toLowerCase() === s.toLowerCase()))
                          .slice(0, 8)
                          .map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => persist({ ...data, skills: [...data.skills, s] })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800 hover:bg-amber-100 transition-colors"
                            >
                              <span>+</span> {s}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                  {data.skills.length === 0 && (
                      <p className="text-stone-500 text-sm">Add skills above. They’ll appear as tags on your resume.</p>
                    )}
                  </div>
                </div>
              </SectionCard>
            </section>

            {/* Free tools — apply and see the effect (show when role set or any data) */}
            {(() => {
              const targetRole = data.personal?.title?.trim();
              const hasAnyData = freeAtsScore !== null || suggestedSkills.length > 0 || roleIntelSkills.length > 0 || roleIntelVerbs.length > 0;
              if (!targetRole && !hasAnyData) return null;
              return (
            <section id="free-tools" className="scroll-mt-24 space-y-4">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                Free tools — apply and see the effect
              </h2>

              {/* 1. ATS Score — always show card */}
              <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 p-5">
                <h3 className="text-sm font-bold text-stone-900 mb-2">ATS Score</h3>
                {freeAtsScore !== null ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-stone-500">Weighted from 6 factors. Add missing keywords below to see score go up.</span>
                      <div className={`text-2xl font-black ${freeAtsScore >= 70 ? "text-emerald-600" : freeAtsScore >= 50 ? "text-amber-600" : "text-red-500"}`}>
                        {freeAtsScore}<span className="text-sm font-normal text-stone-400">/100</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                      {Object.entries(freeAtsBd).map(([key, val]) => (
                        <div key={key} className="text-center p-2 rounded-lg bg-white border border-stone-100">
                          <div className={`text-base font-bold ${Number(val) >= 70 ? "text-emerald-600" : Number(val) >= 50 ? "text-amber-600" : "text-red-500"}`}>
                            {String(val)}
                          </div>
                          <div className="text-[10px] text-stone-500 uppercase tracking-wide">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                    {freeMissing.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-stone-600 mb-1.5">Missing keywords — click to add and boost score:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {freeMissing.slice(0, 8).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                if (!data.skills.some((sk) => sk.toLowerCase() === s.toLowerCase())) {
                                  persist({ ...data, skills: [...data.skills, s] });
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 hover:bg-red-100 transition-colors"
                            >
                              <span>+</span> {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-stone-500">Add your role (Personal) and enough content; your ATS score will appear here.</p>
                )}
              </div>

              {/* 2. Skill Gap Analysis — always show card */}
              <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/50 via-white to-sky-50/30 p-5">
                <h3 className="text-sm font-bold text-stone-900 mb-2">Skill Gap Analysis</h3>
                <p className="text-xs text-stone-500 mb-3">Skills often missing for {targetRole || "your role"} (27K+ resumes). Click to add and see your ATS score improve.</p>
                {suggestedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedSkills
                      .filter((s) => !data.skills.some((sk) => sk.toLowerCase() === s.toLowerCase()))
                      .slice(0, 10)
                      .map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => persist({ ...data, skills: [...data.skills, s] })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-xs text-sky-800 hover:bg-sky-100 transition-colors"
                        >
                          + {s}
                        </button>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">No missing skills suggested for this role — or set your role in Personal to load suggestions.</p>
                )}
              </div>

              {/* 3. Role Intelligence — always show card */}
              <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/50 via-white to-violet-50/30 p-5">
                <h3 className="text-sm font-bold text-stone-900 mb-2">Role Intelligence</h3>
                <p className="text-xs text-stone-500 mb-3">Top skills and power verbs for {targetRole || "your role"} from 27K+ resumes. Use these in your bullets to improve match.</p>
                {roleIntelSkills.length > 0 || roleIntelVerbs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {roleIntelSkills.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">Top skills for role — use in resume</p>
                        <p className="text-stone-600">{roleIntelSkills.slice(0, 8).join(", ")}</p>
                      </div>
                    )}
                    {roleIntelVerbs.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">Power verbs to use in bullets</p>
                        <p className="text-stone-600">{roleIntelVerbs.slice(0, 8).join(", ")}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">Set your role in Personal to see top skills and power verbs for your target role.</p>
                )}
              </div>
            </section>
          );
        })()}

            {/* New: Free Tools Showcase */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="scroll-mt-24 space-y-4"
            >
              <motion.div 
                className="text-center mb-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl font-bold text-stone-900 flex items-center justify-center gap-2 mb-2">
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >🚀</motion.span>
                  All Career Tools - Completely FREE
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >🎉</motion.span>
                </h2>
                <p className="text-sm text-stone-600">No payment required. Boost your job search with professional tools.</p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: "🎯 Interview Prep",
                    desc: "Role-specific questions & STAR method answers",
                    features: ["Common questions", "STAR examples", "Salary negotiation tips"],
                    color: "violet",
                    delay: 0
                  },
                  {
                    title: "🤖 ATS Optimizer", 
                    desc: "Get 90+ ATS score with keyword optimization",
                    features: ["Action verbs", "Keyword suggestions", "Format fixes"],
                    color: "emerald",
                    delay: 0.1
                  },
                  {
                    title: "💼 LinkedIn Optimizer",
                    desc: "Get found by recruiters with optimized profile",
                    features: ["Headline rewrite", "About section", "Skills optimization"],
                    color: "blue",
                    delay: 0.2
                  },
                  {
                    title: "📄 Cover Letter",
                    desc: "Professional cover letter template",
                    features: ["Tailored content", "Professional format", "Easy customization"],
                    color: "sky",
                    delay: 0.3
                  },
                  {
                    title: "🗺️ Skill Roadmap",
                    desc: "Personalized 3-month learning plan",
                    features: ["Skill gaps", "Learning resources", "Timeline"],
                    color: "amber",
                    delay: 0.4
                  },
                  {
                    title: "📊 ATS Breakdown",
                    desc: "Detailed analysis of your resume score",
                    features: ["Section analysis", "Improvement tips", "Score breakdown"],
                    color: "emerald",
                    delay: 0.5
                  }
                ].map((tool, index) => (
                  <motion.div
                    key={tool.title}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: tool.delay }}
                    whileHover={{ 
                      scale: 1.03, 
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                    }}
                    className={`rounded-xl border-2 border-${tool.color}-200 bg-gradient-to-br from-${tool.color}-50/60 via-white to-${tool.color}-50/30 p-4 cursor-pointer group`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <motion.div 
                        className={`w-8 h-8 rounded-lg bg-white border border-${tool.color}-300 flex items-center justify-center`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <span className="text-sm">{tool.title.split(' ')[0]}</span>
                      </motion.div>
                      <h3 className="text-sm font-bold text-stone-900">{tool.title.split(' ').slice(1).join(' ')}</h3>
                    </div>
                    <p className="text-xs text-stone-600 mb-3">{tool.desc}</p>
                    <div className="space-y-1">
                      {tool.features.map((feature, i) => (
                        <motion.div 
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: tool.delay + 0.1 + i * 0.1 }}
                          className="flex items-center gap-1"
                        >
                          <svg className={`w-3 h-3 text-${tool.color}-600 shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs text-stone-700">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                    <motion.div 
                      className={`mt-3 pt-3 border-t border-${tool.color}-200`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: tool.delay + 0.4 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600">FREE</span>
                        <motion.span 
                          className="text-xs text-stone-500"
                          whileHover={{ scale: 1.1 }}
                        >
                          Available on review page →
                        </motion.span>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="text-center mt-6 p-4 bg-gradient-to-r from-emerald-50 to-sky-50 rounded-xl border border-emerald-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <p className="text-sm font-medium text-stone-800 mb-2">
                  🎯 <span className="text-emerald-700 font-bold">Pro Tip:</span> Complete your resume first, then visit the review page to access all these free tools!
                </p>
                <motion.a
                  href="/resume/review"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Go to Review Page
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >→</motion.span>
                </motion.a>
              </motion.div>
            </motion.section>
          </div>

          {/* Right: add-ons + cart first (above fold), then unlock CTA + preview */}
          <div className="xl:sticky xl:top-24 xl:self-start xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto xl:overflow-x-hidden scrollbar-hide rounded-2xl space-y-4">
            {/* Single checkout: add-ons + one total + one CTA */}
            <section id="builder-checkout" className="scroll-mt-24 rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Boost your chances</h3>
                    <p className="text-[10px] text-stone-500">Optional add-ons. Resume PDF &#x20B9;15.</p>
                  </div>
                </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-4">
                {([
                  { slug: "ats_improver" as FeatureSlug, label: "ATS Optimizer", benefit: "Get past every ATS. We rewrite keywords so recruiters see you.", color: "emerald", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                  { slug: "cover_letter" as FeatureSlug, label: "Cover Letter", benefit: "One tailored letter per application. Stand out in the inbox.", color: "sky", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                  { slug: "interview_pack" as FeatureSlug, label: "Interview Pack", benefit: "15 role-specific Q&As + STAR answers. Walk in prepared.", color: "violet", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
                  { slug: "ats_breakdown" as FeatureSlug, label: "ATS Breakdown", benefit: "See exactly why you scored X and how to fix each section.", color: "emerald", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                  { slug: "linkedin_optimizer" as FeatureSlug, label: "LinkedIn Optimizer", benefit: "Get found by recruiters. Headline + About rewritten for search.", color: "blue", icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" },
                  { slug: "skill_roadmap" as FeatureSlug, label: "Skill Roadmap", benefit: "Your 3-month plan to close the gap and get interview-ready.", color: "amber", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
                ] as const).map((addon) => {
                  const sel = !!addonCart[addon.slug];
                  const cMap: Record<string, string> = { emerald: "border-emerald-200 bg-emerald-50 text-emerald-600", sky: "border-sky-200 bg-sky-50 text-sky-600", violet: "border-violet-200 bg-violet-50 text-violet-600", blue: "border-blue-200 bg-blue-50 text-blue-600", amber: "border-amber-200 bg-amber-50 text-amber-600" };
                  const cSel: Record<string, string> = { emerald: "border-emerald-300 bg-emerald-50/50", sky: "border-sky-300 bg-sky-50/50", violet: "border-violet-300 bg-violet-50/50", blue: "border-blue-300 bg-blue-50/50", amber: "border-amber-300 bg-amber-50/50" };
                  return (
                    <button
                      key={addon.slug}
                      type="button"
                      onClick={() => setAddonCart(c => ({ ...c, [addon.slug]: !c[addon.slug] }))}
                      className={`rounded-xl border-2 bg-white p-2.5 sm:p-3 transition-all text-left flex items-start gap-2 ${sel ? cSel[addon.color] || "" : "border-stone-200 hover:border-amber-200"}`}
                    >
                      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${sel ? cMap[addon.color] || "" : "border-stone-300"}`}>
                        {sel && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </span>
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${cMap[addon.color] || ""}`}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={addon.icon} /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-stone-900">{addon.label}</p>
                        <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-2">{addon.benefit}</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1">FREE</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-stone-200">
                {(() => {
                  const total = 15; // Only resume PDF, all add-ons are free
                  const addonCount = ADDON_SLUGS.filter(s => addonCart[s]).length;
                  return (
                    <>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold text-stone-800">Total</span>
                        <span className="text-xl font-bold text-amber-700">&#x20B9;{total}</span>
                      </div>
                      <p className="text-xs text-stone-500 mb-4">
                        Resume PDF (&#x20B9;15){addonCount > 0 ? ` + ${addonCount} add-on(s)` : ""}
                      </p>
                      <button
                        type="button"
                        onClick={handleDownloadResume}
                        className="w-full rounded-xl bg-amber-600 px-4 py-3.5 text-base font-bold text-white hover:bg-amber-700 transition-all shadow-lg shadow-amber-900/20"
                      >
                        Pay ₹15 to unlock resume
                      </button>
                    </>
                  );
                })()}
              </div>
            </section>

            <ResumePreviewPanel
              data={data}
              onTemplateChange={(templateId) => persist({ ...data, templateId })}
              onDownload={isPaid ? undefined : handleDownloadResume}
              onDownloadDocx={() => data && generateDocFile(data)}
              isPaid={isPaid}
              purchasedAddons={purchasedAddons}
              toolbarExtra={
                isPaid ? (
                  (regenCredits > 0 || regenUnlimited) ? (
                    <button
                      type="button"
                      onClick={handleRegenerateUse}
                      disabled={regenLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 disabled:opacity-50 transition-all"
                    >
                      {regenLoading ? "Regenerating…" : regenUnlimited ? "Regenerate" : `Regenerate (${regenCredits})`}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRegeneratePay}
                      disabled={regenPayLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-500/50 text-amber-700 font-semibold text-sm hover:bg-amber-50 disabled:opacity-50 transition-all"
                    >
                      {regenPayLoading ? "Opening…" : "Regenerate – ₹2"}
                    </button>
                  )
                ) : null
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
