"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface GlowSelectableCardProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function GlowSelectableCard({
  children,
  selected = false,
  onClick,
  className = "",
}: GlowSelectableCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      className={`
        w-full rounded-2xl border text-left transition-all duration-200
        ${selected
          ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-900/5 ring-2 ring-amber-200/50"
          : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-card"
        }
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
