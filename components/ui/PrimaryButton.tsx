"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface PrimaryButtonProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export function PrimaryButton({
  children,
  className = "",
  glow = true,
  disabled,
  type = "button",
  onClick,
}: PrimaryButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { y: 0 }}
      className={`
        rounded-2xl bg-amber-600 px-6 py-3.5 font-semibold text-white
        transition-colors duration-200
        hover:bg-amber-700
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-600
        ${glow ? "shadow-md shadow-amber-900/10 hover:shadow-lg" : ""}
        ${className}
      `}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
