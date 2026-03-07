"use client";

import type { ResumeData } from "@/types/resume";
import { PhotoOrInitials } from "./PhotoOrInitials";

// Stylish-style: strong left vertical accent bar, light gray header band
const ACCENT_BAR = "bg-slate-700";
const HEADER_BG = "bg-gray-100";

export function ExecutiveResume({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, skills, projects = [] } = data;
  const sectionTitle = "text-[10px] font-bold uppercase tracking-widest text-slate-800 mb-2 pb-1 border-b border-slate-300";
  return (
    <div className="resume-pdf-source bg-white text-gray-800 text-[11px] leading-[1.5] max-w-[210mm] min-h-[297mm] shadow-lg flex">
      <div className={`w-1.5 flex-shrink-0 ${ACCENT_BAR} rounded-l`} />
      <div className="flex-1 min-w-0">
        <header className={`${HEADER_BG} px-8 py-5 flex gap-5 justify-between items-center border-b border-gray-200`}>
          <div className="min-w-0 flex-1">
            <h1 className="text-gray-900 text-[1.4rem] font-bold uppercase tracking-tight">
              {personal.fullName || "Your Name"}
            </h1>
            {personal.title && (
              <p className="text-gray-600 text-[11px] font-medium mt-1">{personal.title}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-0 mt-2 text-gray-500 text-[10px]">
              {personal.email && <span>{personal.email}</span>}
              {personal.phone && <span>{personal.phone}</span>}
              {personal.location && <span>{personal.location}</span>}
              {personal.linkedin && (
                <a href={personal.linkedin} className="text-gray-700 font-medium hover:underline">LinkedIn</a>
              )}
              {personal.website && (
                <a href={personal.website} className="text-gray-700 font-medium hover:underline">Website</a>
              )}
            </div>
          </div>
          <PhotoOrInitials
            photoUrl={personal.photoUrl}
            fullName={personal.fullName || "Your Name"}
            className="w-[72px] h-[72px] rounded-full object-cover flex-shrink-0"
            borderClass="border-2 border-slate-300"
          />
        </header>

        <div className="p-8 pl-7">
          {summary && (
            <section className="mb-6">
              <h2 className={sectionTitle}>Executive Summary</h2>
              <p className="text-gray-700 leading-[1.5] mt-2">{summary}</p>
            </section>
          )}

          <section className="mb-6">
            <h2 className={sectionTitle}>Professional Experience</h2>
            <div className="space-y-5 mt-3">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between gap-2 items-baseline">
                    <span className="font-bold text-gray-900">{exp.jobTitle || "Job Title"}</span>
                    <span className="text-gray-500 text-[10px] whitespace-nowrap">
                      {exp.startDate}
                      {exp.endDate && ` – ${exp.current ? "Present" : exp.endDate}`}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-0.5">
                    {exp.company}
                    {exp.location && ` · ${exp.location}`}
                  </p>
                  {exp.bullets.filter(Boolean).length > 0 && (
                    <ul className="mt-2 space-y-0.5 text-gray-700 pl-4 list-disc leading-[1.5]">
                      {exp.bullets.filter(Boolean).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="mb-6">
            <h2 className={sectionTitle}>Education</h2>
            <div className="mt-3 space-y-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between gap-2 items-baseline">
                    <span className="font-bold text-gray-900">
                      {edu.degree}
                      {edu.field && `, ${edu.field}`}
                    </span>
                    <span className="text-gray-500 text-[10px]">{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <p className="text-gray-600">{edu.school}</p>
                  {edu.gpa && <p className="text-gray-500 text-[10px] mt-0.5">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </section>

          {projects.filter((p) => p.title || p.description || (p.bullets && p.bullets.length)).length > 0 && (
            <section className="mb-6">
              <h2 className={sectionTitle}>Key Projects</h2>
              <div className="mt-3 space-y-2">
                {projects.filter((p) => p.title || p.description || (p.bullets && p.bullets.length)).map((proj) => (
                  <div key={proj.id}>
                    <span className="font-bold text-gray-900">{proj.title || "Project"}</span>
                    {proj.description ? (
                      <p className="text-gray-700 mt-0.5 leading-[1.5]">{proj.description}</p>
                    ) : null}
                    {proj.bullets && proj.bullets.length > 0 ? (
                      <ul className="text-gray-700 mt-0.5 leading-[1.5] list-disc pl-4 space-y-0.5">
                        {proj.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section>
              <h2 className={sectionTitle}>Core Competencies</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px] font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
