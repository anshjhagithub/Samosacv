"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
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
import { loadOnboarding } from "@/lib/onboardingStorage";
import { getUnlockPreview, setUnlockPreview } from "@/lib/storage/resumeStorage";
import { openCashfreeCheckout } from "@/lib/cashfree";

const ResumePreviewPanel = dynamic(
  () => import("@/components/builder/ResumePreviewPanel").then((m) => ({ default: m.ResumePreviewPanel })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col h-full min-h-[500px] rounded-2xl border border-white/10 bg-[#0c0a12] overflow-hidden animate-pulse">
        <div className="h-14 border-b border-white/10 bg-[#16121f]" />
        <div className="flex-1 flex items-center justify-center p-6">
          <span className="text-gray-500 text-sm">Loading preview…</span>
        </div>
      </div>
    ),
  }
);
import { rolePresets } from "@/lib/rolePresets";

const inputClass =
  "w-full rounded-lg border border-white/15 bg-[#1a1625] px-4 py-2.5 text-white placeholder-gray-500 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all";
const labelClass = "block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5";

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
  const persist = useCallback((next: ResumeData) => onUpdate(next), [onUpdate]);
  const [improvingSummary, setImprovingSummary] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [regenCredits, setRegenCredits] = useState(0);
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenPayLoading, setRegenPayLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeIdRef = useRef<string | null>(null);

  useEffect(() => {
    const p = getUnlockPreview();
    if (p?.resumeId) {
      resumeIdRef.current = p.resumeId;
      fetch(`/api/regeneration/credits?resumeId=${encodeURIComponent(p.resumeId)}`)
        .then((r) => r.json())
        .then((j) => setRegenCredits(j.count ?? 0))
        .catch(() => setRegenCredits(0));
    } else {
      const id = crypto.randomUUID?.() ?? `res-${Date.now()}`;
      resumeIdRef.current = id;
      setUnlockPreview({ resumeId: id, atsScore: 0, missingSkills: [] });
    }
  }, []);

  const improveSummary = useCallback(async () => {
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
      if (res.ok && json.text) persist({ ...data, summary: json.text });
    } finally {
      setImprovingSummary(false);
    }
  }, [data, persist]);

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
    if (!rid || regenCredits < 1 || regenLoading) return;
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
  }, [data, regenCredits, regenLoading, persist]);

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
    <div className="min-h-screen bg-[#0c0a12] theme-dark" ref={containerRef}>
      {/* Top bar – like big resume builders */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c0a12]/95 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors shrink-0"
          >
            <span className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-sm font-bold">
              A
            </span>
            <span className="font-semibold text-white hidden sm:inline">ARTICULATED</span>
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToSection(s.id)}
                className="shrink-0 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="hidden sm:inline mr-1.5">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {experienceLabel && (
              <span className="hidden md:inline text-xs px-2.5 py-1 rounded-lg bg-accent/20 text-accent border border-accent/40">
                {experienceLabel}
              </span>
            )}
            <span className="hidden lg:inline text-sm text-gray-500">{roleLabel}</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-10">
          {/* Left: form sections */}
          <div className="space-y-6">
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
                    <p className="text-gray-500 text-xs mb-2">
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
                      <label className="shrink-0 cursor-pointer rounded-lg border border-white/15 bg-[#1a1625] px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
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
                          className="w-12 h-12 rounded-full object-cover border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPersonal({ ...personal, photoUrl: undefined })
                          }
                          className="text-xs text-gray-400 hover:text-red-400"
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
                      className="rounded-xl border border-white/10 bg-[#1a1625]/80 p-4 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-medium">Position {idx + 1}</span>
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
                      className="rounded-xl border border-white/10 bg-[#1a1625]/80 p-4 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-medium">Education {idx + 1}</span>
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
                addLabel="Add project"
                onAdd={addProject}
              >
                <div className="space-y-4">
                  {projects.map((proj, idx) => (
                    <div
                      key={proj.id}
                      className="rounded-xl border border-white/10 bg-[#1a1625]/80 p-4 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-medium">Project {idx + 1}</span>
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
                        placeholder="Brief description and impact"
                        rows={2}
                        className={`${inputClass} resize-y`}
                      />
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
                      className="shrink-0 px-4 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1625] border border-white/15 text-sm text-white"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() =>
                            persist({ ...data, skills: data.skills.filter((_, j) => j !== i) })
                          }
                          className="text-gray-400 hover:text-white leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {data.skills.length === 0 && (
                      <p className="text-gray-500 text-sm">Add skills above. They’ll appear as tags on your resume.</p>
                    )}
                  </div>
                </div>
              </SectionCard>
            </section>
          </div>

          {/* Right: sticky preview panel */}
          <div className="xl:sticky xl:top-24 xl:self-start xl:max-h-[calc(100vh-7rem)] space-y-3">
            <ResumePreviewPanel
              data={data}
              onTemplateChange={(templateId) => persist({ ...data, templateId })}
              onDownload={undefined}
            />
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
              <p className="text-xs text-gray-400 mb-2">Most users improve 2–3 times before applying.</p>
              {regenCredits > 0 ? (
                <button
                  type="button"
                  onClick={handleRegenerateUse}
                  disabled={regenLoading}
                  className="rounded-lg bg-amber-500 text-black px-4 py-2 text-sm font-semibold hover:bg-amber-400 disabled:opacity-50"
                >
                  {regenLoading ? "Regenerating…" : `Regenerate (${regenCredits} credit${regenCredits !== 1 ? "s" : ""})`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRegeneratePay}
                  disabled={regenPayLoading}
                  className="rounded-lg bg-amber-500 text-black px-4 py-2 text-sm font-semibold hover:bg-amber-400 disabled:opacity-50"
                >
                  {regenPayLoading ? "Opening…" : "Improve & Regenerate – ₹2"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
