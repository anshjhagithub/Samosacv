"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBasicInfo, getExperienceList, getEducationList, getProjectList, setProjectList, type ProjectEntryInput } from "@/lib/resumeFlowStorage";
import { saveResume, loadResume, setUnlockPreview } from "@/lib/storage/resumeStorage";
import { createClient } from "@/lib/supabase/client";
import { rolePresets, ROLE_IDS } from "@/lib/rolePresets";

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-colors text-sm";

export default function ResumeProjectsPage() {
  const router = useRouter();
  const [list, setList] = useState<ProjectEntryInput[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [building, setBuilding] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);

  useEffect(() => {
    const saved = getProjectList();
    if (saved.length > 0) setList(saved);
    else setList([{ title: "", oneLiner: "" }]);
    setHasChecked(true);
  }, []);

  useEffect(() => {
    if (hasChecked) setProjectList(list);
  }, [list, hasChecked]);

  const addEntry = () => {
    setList((prev) => [...prev, { title: "", oneLiner: "" }]);
  };

  const update = (i: number, field: keyof ProjectEntryInput, value: string) => {
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

  const handleBuildResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuildError(null);

    const basic = getBasicInfo();
    const experiences = getExperienceList();
    const projectsFiltered = list.filter((p) => p.title.trim());

    const existing = loadResume();
    const templateId = existing?.templateId ?? "classic";

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    setBuilding(true);
    try {
      const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
      let generationToken: string | null = null;

      if (session?.access_token) {
        authHeaders.Authorization = `Bearer ${session.access_token}`;
        const allocateRes = await fetch("/api/allocate", { method: "POST", headers: authHeaders, body: JSON.stringify({}) });
        if (allocateRes.ok) {
          const allocateData = await allocateRes.json();
          generationToken = allocateData.token ?? null;
        }
        if (allocateRes.status === 402) {
          setBuildError("Payment required to generate. Please complete payment and try again.");
          setBuilding(false);
          return;
        }
      }
      if (generationToken) authHeaders["X-Generation-Token"] = generationToken;

      const payload = {
        fullName: basic.fullName,
        targetRole: basic.targetRole,
        experienceLevel: basic.experienceLevel,
        location: basic.location || undefined,
        jobDescription: basic.jobDescription || undefined,
        experiences: experiences.map((e) => ({ jobTitle: e.jobTitle, company: e.company, duration: e.duration })),
        education: getEducationList().filter((e) => e.degree.trim()).map((e) => ({ degree: e.degree, field: e.field, school: e.school, duration: e.duration })),
        projects: projectsFiltered.map((p) => ({ title: p.title, oneLiner: p.oneLiner || undefined })),
      };
      if (typeof window !== "undefined") {
        console.log("[Build My Resume] Calling API /api/resume/generate-from-minimal", payload);
      }

      const res = await fetch("/api/resume/generate-from-minimal", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (typeof window !== "undefined") {
        console.log("[Build My Resume] API response", res.status, data?.resume ? "resume received" : data?.error ?? data);
      }

      if (res.status === 401) {
        setBuildError("Please sign in again.");
        setBuilding(false);
        return;
      }
      if (res.status === 402) {
        setBuildError(data.message || data.error || "Payment required to generate.");
        setBuilding(false);
        return;
      }
      if (!res.ok) {
        setBuildError(data.error || "Failed to generate resume. Please try again.");
        setBuilding(false);
        return;
      }

      const resume = { ...data.resume, templateId };
      saveResume(resume);
      setUnlockPreview({
        resumeId: crypto.randomUUID?.() ?? `res-${Date.now()}`,
        atsScore: data.atsScore ?? 0,
        missingSkills: data.missingSkills ?? [],
        targetRole: data.targetRole,
      });
      router.push("/builder");
    } catch (err) {
      setBuildError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBuilding(false);
    }
  };

  const basic = getBasicInfo();

  const matchedRole = ROLE_IDS.find((id) => {
    const label = rolePresets[id].label.toLowerCase();
    const target = basic.targetRole.toLowerCase();
    return target.includes(label) || label.includes(target);
  });
  const suggestedProjects = matchedRole ? rolePresets[matchedRole].suggestedProjects : rolePresets["other"].suggestedProjects;

  const addSuggested = (proj: { title: string; oneLiner: string }) => {
    setList((prev) => {
      if (prev.length === 1 && !prev[0].title.trim() && !prev[0].oneLiner.trim()) {
        return [{ title: proj.title, oneLiner: proj.oneLiner }];
      }
      return [...prev, { title: proj.title, oneLiner: proj.oneLiner }];
    });
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-stone-900 mb-1">List your key projects</h1>
      <p className="text-stone-500 text-sm mb-4">Project titles. Optional one-line description.</p>
      <p className="text-amber-700 text-xs font-medium mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
        AI will generate your full resume (3+ bullets per project, ATS keywords). Click &quot;Build My Resume&quot; to call the API.
      </p>

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
          Suggested for {basic.targetRole || "your role"}
        </p>
        <div className="space-y-2">
          {suggestedProjects.map((proj) => (
            <button
              key={proj.title}
              type="button"
              onClick={() => addSuggested(proj)}
              className="w-full text-left rounded-lg border border-amber-200/60 bg-white px-3 py-2.5 hover:border-amber-300 hover:bg-amber-50 transition-all group"
            >
              <p className="text-sm font-medium text-stone-800 group-hover:text-amber-800">{proj.title}</p>
              <p className="text-xs text-stone-500 mt-0.5">{proj.oneLiner}</p>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-amber-700/60 mt-2">Click to add. Edit details to match your experience.</p>
      </div>

      <form onSubmit={handleBuildResume} className="space-y-6">
        {buildError && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm" role="alert">
            {buildError}
          </div>
        )}
        {list.map((entry, i) => (
          <div key={i} className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-stone-500">Project {i + 1}</span>
              {list.length > 1 && (
                <button type="button" onClick={() => remove(i)} className="text-stone-400 hover:text-red-600 text-sm">
                  Remove
                </button>
              )}
            </div>
            <input
              type="text"
              className={inputClass}
              placeholder="Project title"
              value={entry.title}
              onChange={(e) => update(i, "title", e.target.value)}
            />
            <input
              type="text"
              className={inputClass}
              placeholder="One-line description (optional)"
              value={entry.oneLiner}
              onChange={(e) => update(i, "oneLiner", e.target.value)}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addEntry}
          className="w-full rounded-xl border-2 border-dashed border-stone-200 py-3 text-sm font-medium text-stone-500 hover:border-amber-300 hover:text-amber-700 transition-colors"
        >
          + Add another project
        </button>

        <button
          type="submit"
          disabled={building}
          className="w-full rounded-2xl bg-amber-600 px-6 py-4 text-base font-semibold text-white shadow-lg hover:bg-amber-700 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {building ? "Generating your resume…" : "Build My Resume"}
        </button>
      </form>

      <p className="mt-6 text-center text-stone-500 text-xs">
        <Link href="/resume/template" className="text-amber-700 hover:underline">
          ← Back to template
        </Link>
      </p>
    </div>
  );
}
