"use client";

import { motion } from "framer-motion";

const BEFORE_LINES = [
  "Worked on various software projects.",
  "Responsible for coding and debugging.",
  "Good at teamwork and communication.",
  "Used Python and JavaScript.",
];

const AFTER_LINES = [
  "Architected 3 microservices reducing API latency by 40%, serving 2M+ daily requests in production.",
  "Led monolith-to-event-driven migration, cutting deployment time from 4 hours to 12 minutes.",
  "Mentored 5 junior developers through structured code reviews, improving team velocity by 25%.",
  "Built real-time data pipeline in Python processing 500K events/hour with 99.9% uptime.",
];

export function BeforeAfter() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
      <motion.div
        className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50/80 to-white p-5 sm:p-7 relative overflow-hidden"
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-400 to-transparent" />
        <div className="flex items-center gap-2 mb-5">
          <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
          <span className="text-xs font-semibold text-red-600 uppercase tracking-widest">Before</span>
        </div>
        <div className="space-y-3">
          {BEFORE_LINES.map((line, i) => (
            <motion.p
              key={i}
              className="text-sm text-stone-400 leading-relaxed font-mono"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              {line}
            </motion.p>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-stone-100 overflow-hidden">
            <div className="h-full w-[23%] bg-red-300 rounded-full" />
          </div>
          <span className="text-xs text-red-500 font-semibold tabular-nums">23%</span>
          <span className="text-[10px] text-stone-400 uppercase tracking-wider">ATS</span>
        </div>
      </motion.div>

      <motion.div
        className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-5 sm:p-7 relative overflow-hidden"
        initial={{ opacity: 0, x: 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-transparent" />
        <div className="flex items-center gap-2 mb-5">
          <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">After — AI Enhanced</span>
        </div>
        <div className="space-y-3">
          {AFTER_LINES.map((line, i) => (
            <motion.p
              key={i}
              className="text-sm text-stone-800 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.12 }}
            >
              {line}
            </motion.p>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-stone-100 overflow-hidden">
            <motion.div
              className="h-full bg-emerald-400 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: "96%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-emerald-600 font-semibold tabular-nums">96%</span>
          <span className="text-[10px] text-stone-400 uppercase tracking-wider">ATS</span>
        </div>
      </motion.div>
    </div>
  );
}
