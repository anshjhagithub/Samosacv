"use client";

const MOCK = {
  technical: ["How did you scale a system under load?", "Describe a time you improved latency.", "Explain your ML pipeline end-to-end."],
  behavioral: "Tell me about a conflict with a stakeholder and how you resolved it.",
  star: "Situation: X. Task: Y. Action: Z. Result: 23% improvement.",
};

export function InterviewWeaponPreview() {
  return (
    <div className="rounded-xl bg-[#0c0a12] border border-amber-500/20 p-4 space-y-3 transition-all hover:border-amber-500/40">
      <p className="text-[10px] text-amber-400/90 uppercase tracking-wider">High-probability questions</p>
      <div>
        <p className="text-[10px] text-gray-500 mb-1">3 technical</p>
        <ul className="text-[10px] text-gray-300 space-y-0.5">
          {MOCK.technical.map((q, i) => (
            <li key={i}>• {q}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[10px] text-gray-500 mb-1">1 curveball behavioral</p>
        <p className="text-[10px] text-amber-300/90 italic">&ldquo;{MOCK.behavioral}&rdquo;</p>
      </div>
      <div className="pt-2 border-t border-white/10">
        <p className="text-[10px] text-gray-500 mb-0.5">STAR framework snippet</p>
        <p className="text-[10px] text-emerald-300/90">&quot;{MOCK.star}&quot;</p>
      </div>
    </div>
  );
}
