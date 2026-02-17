"use client";

export function HeroGraphic() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="w-full h-full min-h-[200px] opacity-40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
          <stop offset="100%" stopColor="rgba(139, 92, 246, 0.1)" />
        </linearGradient>
      </defs>
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const cx = 200 + Math.cos(angle) * 80;
        const cy = 150 + Math.sin(angle) * 60;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={1.5}
            fill="white"
            opacity={0.6}
          />
        );
      })}
      {[...Array(8)].map((_, i) => (
        <path
          key={`path-${i}`}
          d={`M 200 150 Q ${200 + (i - 4) * 40} 50 ${200 + (i - 3) * 35} 150 T 200 250`}
          stroke="url(#lineGrad)"
          strokeWidth="0.5"
          fill="none"
          opacity={0.5 - i * 0.04}
        />
      ))}
      <path
        d="M 100 150 C 150 80, 250 80, 300 150 C 250 220, 150 220, 100 150"
        stroke="white"
        strokeWidth="0.8"
        fill="none"
        opacity={0.2}
      />
    </svg>
  );
}
