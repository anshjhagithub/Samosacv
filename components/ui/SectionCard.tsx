"use client";

import { type ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SectionCardProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  onImprove?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  className?: string;
}

export function SectionCard({
  title,
  children,
  defaultOpen = true,
  onImprove,
  onAdd,
  addLabel = "Add",
  className = "",
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`
        rounded-2xl border border-[#2d2640] bg-[#16121f] shadow-card overflow-hidden
        ${className}
      `}
    >
      <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-white/10">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-center justify-between text-left"
        >
          <span className="font-serif italic text-white text-lg">{title}</span>
          <span className="text-gray-400 text-sm">
            {open ? "−" : "+"}
          </span>
        </button>
        {onImprove && (
          <button
            type="button"
            onClick={onImprove}
            className="shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-accent hover:bg-accent/10 transition-colors"
          >
            Improve <span className="text-accent">✨</span>
          </button>
        )}
      </div>
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
                  className="text-sm text-accent hover:text-accent/80 font-medium"
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
