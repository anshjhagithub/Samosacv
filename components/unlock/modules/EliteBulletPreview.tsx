"use client";

const MOCK = {
  before: "Worked on backend APIs",
  after: "Built scalable REST APIs handling 10k+ daily requests, reducing response latency by 35%",
};

export function EliteBulletPreview() {
  return (
    <div className="rounded-xl bg-[#0c0a12] border border-amber-500/20 p-4 space-y-3 transition-all hover:border-amber-500/40">
      <p className="text-[10px] text-amber-400/90 uppercase tracking-wider">Before → After</p>
      <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-200/90">
        Before: {MOCK.before}
      </div>
      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-200/90">
        After: {MOCK.after}
      </div>
      <p className="text-[10px] text-amber-400/70">+ Metrics & impact highlighted</p>
    </div>
  );
}
