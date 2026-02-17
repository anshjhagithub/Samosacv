"use client";

import { type ReactNode } from "react";

interface DarkCardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function DarkCard({ children, className = "", padding = "md" }: DarkCardProps) {
  return (
    <div
      className={`
        rounded-2xl bg-[#16121f] border border-[#2d2640] shadow-card
        ${paddingMap[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
