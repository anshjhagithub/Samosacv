"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getBasicInfo,
  getExperienceList,
  setExperienceList,
  type ExperienceEntryInput,
} from "@/lib/resumeFlowStorage";

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-colors text-sm";

const JOB_TITLE_SUGGESTIONS = [
  "Software Developer", "Senior Software Developer", "Backend Developer", "Frontend Developer",
  "Full Stack Developer", "Mobile Developer", "React Developer", "Angular Developer",
  "Java Developer", "Python Developer", ".NET Developer", "iOS Developer", "Android Developer",
  "Data Analyst", "Senior Data Analyst", "Business Intelligence Analyst",
  "Data Scientist", "Senior Data Scientist", "ML Engineer", "AI Engineer", "NLP Engineer",
  "Data Engineer", "ETL Developer", "Analytics Engineer",
  "DevOps Engineer", "Site Reliability Engineer", "Platform Engineer", "Cloud Engineer",
  "QA Engineer", "SDET", "Automation Tester", "Performance Tester",
  "Product Manager", "Associate Product Manager", "Senior Product Manager", "Technical Product Manager",
  "Project Manager", "Program Manager", "Delivery Manager",
  "Business Analyst", "Systems Analyst", "Requirements Analyst",
  "UX Designer", "UI Designer", "Product Designer", "UX Researcher", "Interaction Designer",
  "Graphic Designer", "Visual Designer", "Brand Designer", "Motion Designer",
  "Marketing Manager", "Digital Marketing Manager", "Growth Marketing Manager",
  "Content Writer", "Copywriter", "Technical Writer", "Content Strategist",
  "SEO Specialist", "SEM Specialist", "Social Media Manager", "Community Manager",
  "Sales Executive", "Account Executive", "Business Development Representative",
  "Account Manager", "Customer Success Manager", "Key Account Manager",
  "HR Manager", "Talent Acquisition Specialist", "Recruiter", "HRBP",
  "Financial Analyst", "Investment Analyst", "Risk Analyst", "Accountant",
  "Operations Manager", "Supply Chain Analyst", "Logistics Manager",
  "Mechanical Engineer", "Electrical Engineer", "Civil Engineer", "Chemical Engineer",
  "Solutions Architect", "Technical Architect", "Enterprise Architect",
  "Security Engineer", "Cybersecurity Analyst", "Penetration Tester",
  "Network Engineer", "Systems Administrator", "Database Administrator",
  "Scrum Master", "Agile Coach", "Technical Lead", "Engineering Manager",
  "Research Scientist", "Research Associate", "Lab Technician",
  "Teacher", "Professor", "Instructor", "Tutor",
  "Nurse", "Pharmacist", "Medical Officer",
  "Lawyer", "Legal Counsel", "Paralegal",
  "Journalist", "Reporter", "Editor",
  "Video Editor", "Photographer", "Videographer",
  "Intern", "Graduate Trainee", "Fresher",
];

export default function ResumeExperiencePage() {
  const router = useRouter();
  const [list, setList] = useState<ExperienceEntryInput[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [suggestionsFor, setSuggestionsFor] = useState<number | null>(null);

  useEffect(() => {
    const saved = getExperienceList();
    setList(saved.length > 0 ? saved : [{ jobTitle: "", company: "", duration: "" }]);
    setHasChecked(true);
  }, []);

  useEffect(() => {
    if (hasChecked) setExperienceList(list);
  }, [list, hasChecked]);

  const addEntry = () => {
    setList((prev) => [...prev, { jobTitle: "", company: "", duration: "" }]);
  };

  const update = (i: number, field: keyof ExperienceEntryInput, value: string) => {
    setList((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const remove = (i: number) => {
    if (list.length <= 1) return;
    setList((prev) => prev.filter((_, j) => j !== i));
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setExperienceList(list);
    router.push("/resume/template");
  };

  const basic = getBasicInfo();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-stone-900 mb-1">Tell us where you have worked</h1>
      <p className="text-stone-500 text-sm mb-8">Job titles only. We will write the rest.</p>

      <form onSubmit={handleContinue} className="space-y-6">
        {list.map((entry, i) => (
          <div key={i} className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-stone-500">Job {i + 1}</span>
              {list.length > 1 && (
                <button type="button" onClick={() => remove(i)} className="text-stone-400 hover:text-red-600 text-sm">
                  Remove
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                className={inputClass}
                placeholder="Job title (e.g. Software Developer)"
                value={entry.jobTitle}
                onChange={(e) => update(i, "jobTitle", e.target.value)}
                onFocus={() => setSuggestionsFor(i)}
                onBlur={() => setTimeout(() => setSuggestionsFor(null), 200)}
              />
              {suggestionsFor === i && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-stone-200 bg-white shadow-lg py-2 z-10 max-h-48 overflow-auto">
                  {JOB_TITLE_SUGGESTIONS.filter((s) =>
                    s.toLowerCase().includes(entry.jobTitle.trim().toLowerCase())
                  )
                    .slice(0, 6)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-amber-50"
                        onMouseDown={() => {
                          update(i, "jobTitle", s);
                          setSuggestionsFor(null);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <input
              type="text"
              className={inputClass}
              placeholder="Company name (optional)"
              value={entry.company}
              onChange={(e) => update(i, "company", e.target.value)}
            />
            <input
              type="text"
              className={inputClass}
              placeholder="Duration (optional)"
              value={entry.duration}
              onChange={(e) => update(i, "duration", e.target.value)}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addEntry}
          className="w-full rounded-xl border-2 border-dashed border-stone-200 py-3 text-sm font-medium text-stone-500 hover:border-amber-300 hover:text-amber-700 transition-colors"
        >
          + Add another job
        </button>

        <button
          type="submit"
          className="w-full rounded-2xl bg-amber-600 px-6 py-4 text-base font-semibold text-white shadow-lg hover:bg-amber-700 transition-all hover:-translate-y-0.5"
        >
          Continue
        </button>
      </form>

      <p className="mt-6 text-center text-stone-500 text-xs">
        Building resume for <strong className="text-stone-700">{basic.targetRole || "your role"}</strong>.{" "}
        <Link href="/resume/start" className="text-amber-700 hover:underline">Change</Link>
      </p>
    </div>
  );
}
