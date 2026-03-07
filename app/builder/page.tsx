"use client";

import { useCallback, useEffect, useState } from "react";
import { createEmptyResume, createEmptyProject, type ResumeData } from "@/types/resume";
import { loadResume, saveResume } from "@/lib/storage/resumeStorage";
import { ResumeBuilder } from "@/components/builder/ResumeBuilder";
import { motion } from "framer-motion";

function ensureProjects(data: ResumeData): ResumeData {
  if (data.projects && data.projects.length > 0) return data;
  return {
    ...data,
    projects: [createEmptyProject(crypto.randomUUID?.() ?? "proj-1")],
  };
}

export default function BuilderPage() {
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = loadResume();
    setData(raw ? ensureProjects(raw) : createEmptyResume());
    setLoading(false);
  }, []);

  const persist = useCallback((next: ResumeData) => {
    setData(next);
    saveResume(next);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-stone-600">Loading your resume…</p>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  return <ResumeBuilder data={data} onUpdate={persist} />;
}
