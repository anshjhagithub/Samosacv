"use client";

import { type ReactNode } from "react";

interface ModuleCardProps {
  id: string;
  title: string;
  headline: string;
  price: number;
  selected: boolean;
  onToggle: () => void;
  preview: ReactNode;
}

export function ModuleCard({ title, headline, price, selected, onToggle, preview }: ModuleCardProps) {
  return (
    <div
      className={`rounded-2xl border bg-[#16121f] overflow-hidden transition-all duration-300 hover:shadow-lg ${
        selected ? "border-amber-500/50 shadow-amber-500/10 shadow-xl" : "border-white/10 hover:border-amber-500/30"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-amber-400/90">{headline}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xl font-bold text-amber-400">₹{price}</span>
            <button
              type="button"
              role="switch"
              aria-checked={selected}
              onClick={onToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[#16121f] ${
                selected ? "bg-amber-500" : "bg-white/20"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                  selected ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
        <div className="mt-4 min-h-[120px]">{preview}</div>
      </div>
    </div>
  );
}
