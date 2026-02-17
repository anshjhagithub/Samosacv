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
          ? "border-accent bg-accent/10 shadow-glow"
          : "border-[#2d2640] bg-[#16121f] hover:border-accent/30 hover:shadow-card"
        }
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
