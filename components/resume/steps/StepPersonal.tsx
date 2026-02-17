"use client";

import type { PersonalInfo } from "@/types/resume";

export function StepPersonal({
  personal,
  onChange,
}: {
  personal: PersonalInfo;
  onChange: (p: PersonalInfo) => void;
}) {
  return (
    <div className="space-y-5 max-w-xl">
      <p className="text-slate-600">Only name and email are required. Rest helps you get noticed.</p>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Full name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={personal.fullName}
          onChange={(e) => onChange({ ...personal, fullName: e.target.value })}
          placeholder="e.g. Jane Smith"
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={personal.email}
          onChange={(e) => onChange({ ...personal, email: e.target.value })}
          placeholder="jane@example.com"
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Professional title</label>
        <input
          type="text"
          value={personal.title}
          onChange={(e) => onChange({ ...personal, title: e.target.value })}
          placeholder="e.g. Software Engineer"
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
        <input
          type="tel"
          value={personal.phone}
          onChange={(e) => onChange({ ...personal, phone: e.target.value })}
          placeholder="+1 (555) 000-0000"
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
        <input
          type="text"
          value={personal.location}
          onChange={(e) => onChange({ ...personal, location: e.target.value })}
          placeholder="e.g. San Francisco, CA"
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn</label>
        <input
          type="url"
          value={personal.linkedin}
          onChange={(e) => onChange({ ...personal, linkedin: e.target.value })}
          placeholder="https://linkedin.com/in/..."
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
        <input
          type="url"
          value={personal.website}
          onChange={(e) => onChange({ ...personal, website: e.target.value })}
          placeholder="https://..."
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
      </div>
    </div>
  );
}
