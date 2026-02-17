"use client";

import type { ExperienceEntry } from "@/types/resume";
import { createEmptyExperience } from "@/types/resume";
import { ImproveButton } from "../ImproveButton";

export function StepExperience({
  experience,
  onChange,
  onImproveBullet,
  onSuggestBullets,
}: {
  experience: ExperienceEntry[];
  onChange: (exp: ExperienceEntry[]) => void;
  onImproveBullet?: (text: string) => Promise<string>;
  onSuggestBullets?: (context: string) => Promise<string[]>;
}) {
  const updateOne = (id: string, upd: Partial<ExperienceEntry>) => {
    onChange(experience.map((e) => (e.id === id ? { ...e, ...upd } : e)));
  };

  const addEntry = () => {
    onChange([...experience, createEmptyExperience(crypto.randomUUID?.() ?? "exp-1")]);
  };

  const removeEntry = (id: string) => {
    if (experience.length <= 1) return;
    onChange(experience.filter((e) => e.id !== id));
  };

  const setBullet = (entryId: string, index: number, value: string) => {
    const entry = experience.find((e) => e.id === entryId);
    if (!entry) return;
    const bullets = [...entry.bullets];
    bullets[index] = value;
    if (index === bullets.length - 1 && value) bullets.push("");
    updateOne(entryId, { bullets });
  };

  return (
    <div className="space-y-8 max-w-xl">
      <p className="text-slate-600">
        Add at least one role. Use 2–4 bullet points per job; start with action verbs.
      </p>
      {experience.map((exp, idx) => (
        <div key={exp.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-slate-500">Experience #{idx + 1}</span>
            {experience.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(exp.id)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job title *</label>
              <input
                type="text"
                value={exp.jobTitle}
                onChange={(e) => updateOne(exp.id, { jobTitle: e.target.value })}
                placeholder="e.g. Software Engineer"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company *</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => updateOne(exp.id, { company: e.target.value })}
                placeholder="e.g. Acme Inc."
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start date</label>
                <input
                  type="text"
                  value={exp.startDate}
                  onChange={(e) => updateOne(exp.id, { startDate: e.target.value })}
                  placeholder="e.g. Jan 2022"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End date</label>
                <input
                  type="text"
                  value={exp.endDate}
                  onChange={(e) => updateOne(exp.id, { endDate: e.target.value })}
                  placeholder="Present or e.g. Dec 2024"
                  disabled={exp.current}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 disabled:bg-slate-50"
                />
                <label className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => updateOne(exp.id, { current: e.target.checked })}
                    className="rounded border-slate-300 text-teal-600"
                  />
                  I currently work here
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={exp.location}
                onChange={(e) => updateOne(exp.id, { location: e.target.value })}
                placeholder="e.g. Remote"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Bullet points</label>
                {onSuggestBullets && (
                  <ImproveButton
                    label="Suggest bullets"
                    onClick={async () => {
                      const context = `${exp.jobTitle} at ${exp.company}`;
                      const suggested = await onSuggestBullets(context);
                      if (suggested.length) {
                        const existing = exp.bullets.filter(Boolean);
                        updateOne(exp.id, { bullets: [...existing, ...suggested].length ? [...existing, ...suggested] : [""] });
                      }
                    }}
                  />
                )}
              </div>
              {exp.bullets.map((b, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={b}
                    onChange={(e) => setBullet(exp.id, i, e.target.value)}
                    placeholder={"Achievement or responsibility " + (i + 1)}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5"
                  />
                  {onImproveBullet && b.trim() && (
                    <ImproveButton
                      label="Improve"
                      onClick={async () => {
                        const next = await onImproveBullet(b);
                        if (next) setBullet(exp.id, i, next);
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-slate-600 hover:border-teal-400 hover:text-teal-600 w-full"
      >
        + Add another experience
      </button>
    </div>
  );
}
