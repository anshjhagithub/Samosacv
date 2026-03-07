"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  q: string;
  a: string;
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={`rounded-xl border overflow-hidden transition-colors duration-300 ${isOpen ? "border-amber-200 bg-amber-50/40" : "border-stone-200 bg-white"} shadow-sm`}
          >
            <button
              className="w-full px-5 py-4 flex items-center justify-between text-left group"
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className={`font-semibold text-sm pr-4 transition-colors ${isOpen ? "text-stone-900" : "text-stone-700 group-hover:text-stone-900"}`}>
                {item.q}
              </span>
              <span className="shrink-0 ml-2 text-stone-400">
                {isOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                )}
              </span>
            </button>
            <AnimatePresence initial={false} mode="sync">
              {isOpen && (
                <motion.div
                  key={`faq-content-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-stone-500 text-sm leading-relaxed border-t border-stone-100 pt-3">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
