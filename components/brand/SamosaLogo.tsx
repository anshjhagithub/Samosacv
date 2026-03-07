"use client";

function SamosaSVG({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="samosa-body" x1="14" y1="6" x2="36" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fcd34d" />
          <stop offset=".45" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="samosa-shine" x1="20" y1="6" x2="28" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity=".45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="24" cy="43" rx="11" ry="2.5" fill="#92400e" opacity=".12" />
      {/* Main samosa body */}
      <path
        d="M24 5C22.5 9 12 28 11 34c-.6 3.5 5.5 6.5 13 6.5s13.6-3 13-6.5C36 28 25.5 9 24 5z"
        fill="url(#samosa-body)"
        stroke="#b45309"
        strokeWidth=".8"
      />
      {/* Highlight / shine */}
      <path
        d="M24 7c-1 3-7 17-9 25 3-1.5 7-2 9-2V7z"
        fill="url(#samosa-shine)"
      />
      {/* Crispy ridges */}
      <path
        d="M17.5 33.5q3-2 6.5-.5 3.5-1.5 6.5.5"
        stroke="#b45309"
        strokeWidth=".7"
        fill="none"
        opacity=".35"
      />
      <path
        d="M15 36q4-1.5 9 0 5-1.5 9 0"
        stroke="#b45309"
        strokeWidth=".5"
        fill="none"
        opacity=".2"
      />
      {/* Top crimp detail */}
      <path
        d="M22 12q2-1 4 0"
        stroke="#fcd34d"
        strokeWidth=".8"
        fill="none"
        opacity=".6"
      />
    </svg>
  );
}

export function SamosaIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 animate-float`}>
      <SamosaSVG className="w-full h-full drop-shadow-md" />
    </div>
  );
}

export function SamosaLogoFull({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <SamosaIcon className="w-8 h-8" />
      <span className="font-bold text-stone-900 tracking-tight text-lg">
        Samosa<span className="text-amber-600">&nbsp;CV</span>
      </span>
    </span>
  );
}
