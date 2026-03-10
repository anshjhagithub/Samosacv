"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getBasicInfo,
  getEducationList,
  setEducationList,
  type EducationEntryInput,
} from "@/lib/resumeFlowStorage";

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-colors text-sm";

const DEGREE_SUGGESTIONS = [
  "Bachelor of Technology (B.Tech)", "Bachelor of Engineering (B.E.)", "Bachelor of Science (B.Sc)",
  "Master of Technology (M.Tech)", "Master of Engineering (M.E.)", "Master of Science (M.Sc)",
  "Bachelor of Computer Applications (BCA)", "Master of Computer Applications (MCA)",
  "Bachelor of Business Administration (BBA)", "Master of Business Administration (MBA)",
  "Bachelor of Arts (B.A.)", "Master of Arts (M.A.)",
  "Bachelor of Commerce (B.Com)", "Master of Commerce (M.Com)",
  "Doctor of Philosophy (Ph.D.)", "Integrated Master's",
  "Diploma in Engineering", "Diploma in Computer Science",
  "12th Grade (Higher Secondary)", "10th Grade (Secondary)",
];

export default function ResumeEducationPage() {
  const router = useRouter();
  const [list, setList] = useState<EducationEntryInput[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [suggestionsFor, setSuggestionsFor] = useState<number | null>(null);

  useEffect(() => {
    const saved = getEducationList();
    setList(saved.length > 0 ? saved : [{ degree: "", field: "", school: "", duration: "" }]);
    setHasChecked(true);
  }, []);

  useEffect(() => {
    if (hasChecked) setEducationList(list);
  }, [list, hasChecked]);

  const addEntry = () => {
    setList((prev) => [...prev, { degree: "", field: "", school: "", duration: "" }]);
  };

  const update = (i: number, field: keyof EducationEntryInput, value: string) => {
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
    setEducationList(list);
    router.push("/resume/projects");
  };

  const basic = getBasicInfo();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-stone-900 mb-1">Tell us about your education</h1>
      <p className="text-stone-500 text-sm mb-8">Degree, field, school, and duration. We will format it professionally.</p>

      <form onSubmit={handleContinue} className="space-y-6">
        {list.map((entry, i) => (
          <div key={i} className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-stone-500">Education {i + 1}</span>
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
                placeholder="Degree (e.g. B.Tech, M.Sc)"
                value={entry.degree}
                onChange={(e) => update(i, "degree", e.target.value)}
                onFocus={() => setSuggestionsFor(i)}
                onBlur={() => setTimeout(() => setSuggestionsFor(null), 200)}
              />
              {suggestionsFor === i && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-stone-200 bg-white shadow-lg py-2 z-10 max-h-48 overflow-auto">
                  {DEGREE_SUGGESTIONS.filter((s) =>
                    s.toLowerCase().includes(entry.degree.trim().toLowerCase())
                  )
                    .slice(0, 6)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-amber-50"
                        onMouseDown={() => {
                          update(i, "degree", s);
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
              placeholder="Field of study (e.g. Computer Science, Mechanical Engineering)"
              value={entry.field}
              onChange={(e) => update(i, "field", e.target.value)}
            />
            <input
              type="text"
              className={inputClass}
              placeholder="School/University name"
              value={entry.school}
              onChange={(e) => update(i, "school", e.target.value)}
            />
            <input
              type="text"
              className={inputClass}
              placeholder="Duration (e.g. 2018-2022, 2020-Present)"
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
          + Add another education
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