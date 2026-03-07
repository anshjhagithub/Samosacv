"use client";

const MOCK = {
  range: "₹8L – ₹12L",
  confidence: 72,
  upgrades: ["Add 1 more metric per bullet", "Lead/ownership language", "Certification or course"],
};

export function SalaryBoostPreview() {
  return (
    <div className="rounded-xl bg-[#0c0a12] border border-amber-500/20 p-4 space-y-3 transition-all hover:border-amber-500/40">
      <p className="text-[10px] text-amber-400/90 uppercase tracking-wider">Estimated range</p>
      <div className="text-2xl font-bold text-amber-400">{MOCK.range}</div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Confidence</span>
        <span className="text-white font-medium">{MOCK.confidence}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-amber-500/80" style={{ width: `${MOCK.confidence}%` }} />
      </div>
      <div className="pt-2 border-t border-white/10">
        <p className="text-[10px] text-gray-500 mb-1.5">3 upgrades to reach top 20% pay</p>
        <ul className="text-xs text-gray-300 space-y-0.5">
          {MOCK.upgrades.map((u, i) => (
            <li key={i}>• {u}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
