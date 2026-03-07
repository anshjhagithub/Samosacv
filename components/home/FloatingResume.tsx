"use client";

import { motion } from "framer-motion";

const SKILLS_FRONT = [
  { label: "React", bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
  { label: "TypeScript", bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  { label: "Python", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  { label: "Node.js", bg: "bg-lime-100", text: "text-lime-700", border: "border-lime-200" },
  { label: "AWS", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  { label: "SQL", bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
];

const SKILLS_BACK = [
  { label: "Figma", bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  { label: "Design Systems", bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  { label: "Prototyping", bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  { label: "Research", bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
];

function ResumeCard({ variant = "front" }: { variant?: "front" | "back" }) {
  const isFront = variant === "front";
  const skills = isFront ? SKILLS_FRONT : SKILLS_BACK;

  return (
    <div
      className={`${isFront ? "w-[280px] sm:w-[320px]" : "w-[260px] sm:w-[300px]"} bg-white rounded-xl overflow-hidden relative`}
      style={{
        boxShadow: isFront
          ? "0 25px 60px -12px rgba(0,0,0,0.15), 0 0 40px -10px rgba(184,134,11,0.1)"
          : "0 15px 40px -12px rgba(0,0,0,0.1)",
      }}
    >
      <div className={`h-1.5 w-full ${isFront ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500" : "bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400"}`} />
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isFront ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" : "bg-gradient-to-br from-pink-400 to-rose-500 text-white"}`}>
            {isFront ? "SJ" : "AK"}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-stone-900 ${isFront ? "text-sm" : "text-xs"}`}>{isFront ? "Sarah Johnson" : "Aisha Khan"}</p>
            <p className="text-[10px] text-stone-500 mt-0.5">{isFront ? "Senior Software Engineer" : "Product Designer"}</p>
            <p className="text-[8px] text-stone-400 mt-0.5">{isFront ? "san.francisco@email.com · (555) 123‑4567" : "aisha.k@email.com · London"}</p>
          </div>
        </div>

        <div className="h-px bg-stone-200 my-2.5" />

        {/* Experience */}
        <div>
          <p className={`text-[9px] font-bold uppercase tracking-wider mb-1.5 ${isFront ? "text-amber-700" : "text-rose-600"}`}>Experience</p>
          <p className="text-[10px] font-semibold text-stone-800">{isFront ? "Senior Engineer · Google" : "Lead Designer · Spotify"}</p>
          <p className="text-[9px] text-stone-400 mb-1">{isFront ? "2021 – Present" : "2022 – Present"}</p>
          <div className="space-y-0.5">
            <p className="text-[9px] text-stone-500 leading-snug">
              {isFront
                ? "• Led migration to microservices, cutting deploy time 75%"
                : "• Redesigned onboarding flow, boosting retention 32%"}
            </p>
            <p className="text-[9px] text-stone-500 leading-snug">
              {isFront
                ? "• Built real-time pipeline processing 2M events/day"
                : "• Built design system adopted by 4 product teams"}
            </p>
          </div>
        </div>

        <div className="h-px bg-stone-200 my-2.5" />

        {/* Skills */}
        <div>
          <p className={`text-[9px] font-bold uppercase tracking-wider mb-1.5 ${isFront ? "text-amber-700" : "text-rose-600"}`}>Skills</p>
          <div className="flex flex-wrap gap-1">
            {skills.map((s, i) => (
              <motion.span
                key={s.label}
                className={`text-[8px] font-medium px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.07, type: "spring", stiffness: 200 }}
              >
                {s.label}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="h-px bg-stone-200 my-2.5" />

        {/* Education */}
        <div>
          <p className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${isFront ? "text-amber-700" : "text-rose-600"}`}>Education</p>
          <p className="text-[10px] font-semibold text-stone-800">{isFront ? "Stanford University" : "Royal College of Art"}</p>
          <p className="text-[9px] text-stone-400">{isFront ? "B.S. Computer Science, 2018" : "MA Design, 2020"}</p>
        </div>
      </div>
    </div>
  );
}

export function FloatingResume() {
  return (
    <div className="relative w-full h-[420px] sm:h-[480px] flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 bg-amber-200/30 rounded-full blur-[80px]" />
      </div>

      {/* Back resume */}
      <motion.div
        className="absolute"
        style={{ transform: "rotate(-6deg) translateX(-30px) translateY(10px)" }}
        initial={{ opacity: 0, y: 40, rotate: -10 }}
        animate={{ opacity: 0.65, y: 0, rotate: -6 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
          <ResumeCard variant="back" />
        </motion.div>
      </motion.div>

      {/* Front resume */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
          <ResumeCard variant="front" />
        </motion.div>
      </motion.div>

      {/* ATS Score badge */}
      <motion.div
        className="absolute top-6 right-2 sm:right-8 z-20 bg-white border border-emerald-200 shadow-lg rounded-xl px-3.5 py-2.5"
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 1.2, type: "spring" }}
        whileHover={{ scale: 1.08 }}
      >
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
          <p className="text-[9px] uppercase tracking-widest text-emerald-600 font-semibold">ATS Score</p>
          <p className="text-xl font-bold text-emerald-600 leading-tight">98%</p>
        </motion.div>
      </motion.div>

      {/* AI Enhanced badge */}
      <motion.div
        className="absolute bottom-16 left-0 sm:left-4 z-20 bg-white border border-amber-200 shadow-lg rounded-xl px-3.5 py-2.5 flex items-center gap-2"
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 1.5, type: "spring" }}
        whileHover={{ scale: 1.08 }}
      >
        <motion.div className="flex items-center gap-2" animate={{ y: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
          <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-xs text-amber-800 font-semibold">AI Enhanced</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
