"use client";

import { type ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SectionCardProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  onImprove?: () => void;
  improveLabel?: string;
  improveTeaser?: string;
  onAdd?: () => void;
  addLabel?: string;
  className?: string;
}

export function SectionCard({
  title,
  children,
  defaultOpen = true,
  onImprove,
  improveLabel = "Improve",
  improveTeaser,
  onAdd,
  addLabel = "Add",
  className = "",
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`
        rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden
        ${className}
      `}
    >
      <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-stone-200">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-center justify-between text-left"
        >
          <span className="font-serif italic text-stone-900 text-lg">{title}</span>
          <span className="text-stone-500 text-sm">
            {open ? "−" : "+"}
          </span>
        </button>
        {onImprove && (
          <button
            type="button"
            onClick={onImprove}
            className="shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
          >
            {improveLabel} <span className="text-amber-600">✨</span>
          </button>
        )}
      </div>
      {improveTeaser && (
        <p className="px-5 pb-2 text-xs text-stone-500">{improveTeaser}</p>
      )}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4">
              {children}
            </div>
            {onAdd && (
              <div className="px-5 pb-4">
                <button
                  type="button"
                  onClick={onAdd}
                  className="text-sm text-amber-700 hover:text-amber-800 font-medium"
                >
                  + {addLabel}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
