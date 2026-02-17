"use client";

import { motion } from "framer-motion";

export function PrecisionGraphic() {
  return (
    <div className="relative w-full aspect-[4/3] max-w-lg rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 w-full h-full opacity-70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="vortex" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </linearGradient>
        </defs>
        {[...Array(20)].map((_, i) => (
          <path
            key={i}
            d={`M 200 150 L ${200 + Math.cos((i / 20) * Math.PI * 2) * 140} ${150 + Math.sin((i / 20) * Math.PI * 2) * 100}`}
            stroke="white"
            strokeWidth="0.4"
            opacity={0.15 + (i % 3) * 0.05}
          />
        ))}
        {[0.3, 0.5, 0.7].map((r, i) => (
          <ellipse
            key={i}
            cx="200"
            cy="150"
            rx={140 * r}
            ry={100 * r}
            stroke="white"
            strokeWidth="0.5"
            fill="none"
            opacity={0.2 - i * 0.05}
          />
        ))}
        <path
          d="M 200 50 Q 280 150 200 250 Q 120 150 200 50"
          stroke="url(#vortex)"
          strokeWidth="1.5"
          fill="none"
          opacity={0.6}
        />
        <path
          d="M 200 70 Q 260 150 200 230 Q 140 150 200 70"
          stroke="rgba(139, 92, 246, 0.5)"
          strokeWidth="1"
          fill="none"
          opacity={0.8}
        />
      </svg>
      <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/5 border border-white/10 p-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>AI PASSAGE RATE</span>
          <span className="text-accent font-medium">99.8%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            whileInView={{ width: "99.8%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
