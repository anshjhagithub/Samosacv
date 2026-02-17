"use client";

import { useState } from "react";

export function ImproveButton({
  onClick,
  label = "Improve with AI",
  size = "sm",
}: {
  onClick: () => Promise<void>;
  label?: string;
  size?: "sm" | "md";
}) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`rounded-lg border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 disabled:opacity-50 ${size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"}`}
    >
      {loading ? "…" : label}
    </button>
  );
}
