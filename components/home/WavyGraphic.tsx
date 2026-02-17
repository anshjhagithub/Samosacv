"use client";

export function WavyGraphic() {
  return (
    <div className="relative w-full aspect-[4/3] max-w-lg rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 w-full h-full opacity-60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320, 350, 380].map((y, i) => (
          <path
            key={i}
            d={`M 0 ${y} Q 50 ${y + 15} 100 ${y} T 200 ${y} T 300 ${y} T 400 ${y}`}
            stroke="white"
            strokeWidth="0.5"
            opacity={0.08 + (i % 3) * 0.04}
          />
        ))}
      </svg>
      <div className="absolute top-4 right-4 rounded-lg bg-black/40 border border-white/10 backdrop-blur p-4 max-w-[180px]">
        <div className="h-1 w-8 bg-accent rounded-full mb-2" />
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Real-time</p>
        <p className="text-xs text-white font-medium mt-0.5">AI Narrative Evolution</p>
      </div>
    </div>
  );
}
