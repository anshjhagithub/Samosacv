"use client";

const MOCK = {
  strengths: ["Clear title", "Relevant experience", "Quant in 2 bullets"],
  weak: ["First line is generic", "No company impact in summary"],
  roleFit: 78,
  summaryPreview: "Results-driven engineer with 2+ years in AML and ML. Delivered 23% fraud reduction.",
};

export function RecruiterTestPreview() {
  return (
    <div className="rounded-xl bg-[#0c0a12] border border-amber-500/20 p-4 space-y-3 transition-all hover:border-amber-500/40">
      <p className="text-[10px] text-amber-400/90 uppercase tracking-wider">What recruiter sees in 6 seconds</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Role fit score</span>
        <span className="text-xl font-bold text-amber-400">{MOCK.roleFit}%</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-emerald-400/80 mb-1">Top strengths</p>
          <ul className="text-[10px] text-gray-300 space-y-0.5">
            {MOCK.strengths.map((s, i) => (
              <li key={i}>✓ {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] text-amber-400/80 mb-1">Weak first impression</p>
          <ul className="text-[10px] text-gray-400 space-y-0.5">
            {MOCK.weak.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="pt-2 border-t border-white/10">
        <p className="text-[10px] text-gray-500 mb-1">Instant summary rewrite preview</p>
        <p className="text-xs text-gray-300 italic">&quot;{MOCK.summaryPreview}&quot;</p>
      </div>
    </div>
  );
}
