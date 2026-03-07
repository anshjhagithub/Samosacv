"use client";

const MOCK = {
  score: 72,
  keywordMatch: 68,
  formattingRisk: "Medium",
  gaps: ["Missing 'machine learning' (12× in JD)", "Weak quant in bullets", "Summary too generic"],
  before: "Developed ML models for fraud detection.",
  after: "Built ML models that cut fraud by 23% and saved ₹40L annually.",
};

export function ATSDominationPreview() {
  return (
    <div className="rounded-xl bg-[#0c0a12] border border-amber-500/20 p-4 space-y-3 transition-all hover:border-amber-500/40">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">ATS Score</span>
        <span className="text-2xl font-bold text-amber-400">{MOCK.score}/100</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Keyword match</span>
          <span className="text-white font-medium">{MOCK.keywordMatch}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-amber-500/80 transition-all" style={{ width: `${MOCK.keywordMatch}%` }} />
        </div>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">Formatting risk</span>
        <span className="text-amber-400">{MOCK.formattingRisk}</span>
      </div>
      <div className="pt-2 border-t border-white/10">
        <p className="text-[10px] text-gray-500 uppercase mb-1.5">3 critical gaps</p>
        <ul className="text-xs text-gray-300 space-y-0.5">
          {MOCK.gaps.slice(0, 2).map((g, i) => (
            <li key={i}>• {g}</li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded bg-red-500/10 border border-red-500/30 p-1.5 text-red-300">Before: {MOCK.before}</div>
        <div className="rounded bg-emerald-500/10 border border-emerald-500/30 p-1.5 text-emerald-300">After: {MOCK.after}</div>
      </div>
    </div>
  );
}
