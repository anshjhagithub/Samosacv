"use client";

import type { EducationEntry } from "@/types/resume";
import { createEmptyEducation } from "@/types/resume";

export function StepEducation({
  education,
  onChange,
}: {
  education: EducationEntry[];
  onChange: (edu: EducationEntry[]) => void;
}) {
  const updateOne = (id: string, upd: Partial<EducationEntry>) => {
    onChange(education.map((e) => (e.id === id ? { ...e, ...upd } : e)));
  };

  const addEntry = () => {
    onChange([...education, createEmptyEducation(crypto.randomUUID?.() ?? `edu-${Date.now()}`)]);
  };

  const removeEntry = (id: string) => {
    if (education.length <= 1) return;
    onChange(education.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-8 max-w-xl">
      <p className="text-slate-600">Add your degree(s). Most recent first.</p>
      {education.map((edu, idx) => (
        <div key={edu.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-slate-500">Education #{idx + 1}</span>
            {education.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(edu.id)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">School *</label>
              <input
                type="text"
                value={edu.school}
                onChange={(e) => updateOne(edu.id, { school: e.target.value })}
                placeholder="e.g. Stanford University"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Degree *</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateOne(edu.id, { degree: e.target.value })}
                placeholder="e.g. B.S. Computer Science"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Field of study</label>
              <input
                type="text"
                value={edu.field}
                onChange={(e) => updateOne(edu.id, { field: e.target.value })}
                placeholder="e.g. Computer Science"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start</label>
                <input
                  type="text"
                  value={edu.startDate}
                  onChange={(e) => updateOne(edu.id, { startDate: e.target.value })}
                  placeholder="e.g. 2018"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End</label>
                <input
                  type="text"
                  value={edu.endDate}
                  onChange={(e) => updateOne(edu.id, { endDate: e.target.value })}
                  placeholder="e.g. 2022"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GPA (optional)</label>
              <input
                type="text"
                value={edu.gpa}
                onChange={(e) => updateOne(edu.id, { gpa: e.target.value })}
                placeholder="e.g. 3.8"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-slate-600 hover:border-teal-400 hover:text-teal-600 w-full"
      >
        + Add another education
      </button>
    </div>
  );
}
