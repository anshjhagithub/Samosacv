"use client";

export function StepSkills({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const value = skills.join(", ");
  const update = (s: string) => {
    const list = s
      .split(/[,;]/)
      .map((x) => x.trim())
      .filter(Boolean);
    onChange(list);
  };

  return (
    <div className="space-y-5 max-w-xl">
      <p className="text-slate-600">
        List 5–15 skills. Separate by commas. Include tools, languages, and soft skills.
      </p>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Skills</label>
        <textarea
          value={value}
          onChange={(e) => update(e.target.value)}
          placeholder="e.g. JavaScript, React, Project Management, SQL, Agile"
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
        {skills.length > 0 && (
          <p className="mt-1 text-sm text-slate-500">{skills.length} skill(s) added</p>
        )}
      </div>
    </div>
  );
}
