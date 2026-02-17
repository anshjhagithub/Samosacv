"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateLinkedInRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/create/job-description");
  }, [router]);
  return (
    <div className="min-h-screen bg-[#0c0a12] flex items-center justify-center">
      <p className="text-gray-400">Redirecting…</p>
    </div>
  );
}
