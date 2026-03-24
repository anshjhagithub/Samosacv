"use client";

import type { ResumeData } from "@/types/resume";
import { PhotoOrInitials } from "./PhotoOrInitials";

// Elegant-style: main content left, dark teal sidebar right; photo in header
const SIDEBAR_BG = "bg-teal-800";
const SIDEBAR_TEXT = "text-white";

export function ProfessionalResume({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, skills, projects = [] } = data;
  return (
    <div className="resume-pdf-source bg-white text-gray-800 text-[11px] leading-[1.45] max-w-[210mm] min-h-[297mm] shadow-lg flex">
      <div className="flex-1 min-w-0 p-7">
        <header className="flex gap-4 justify-between items-start pb-4 mb-5 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h1 className="text-gray-900 text-[1.35rem] font-bold uppercase tracking-tight">
              {personal.fullName || "Your Name"}
            </h1>
            {personal.title && (
              <p className="text-gray-600 mt-1 font-medium">{personal.title}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-0 mt-2 text-gray-500 text-[10px]">
              {personal.email && <span>{personal.email}</span>}
              {personal.phone && <span>{personal.phone}</span>}
              {personal.location && <span>{personal.location}</span>}
              {personal.linkedin && (
                <a href={personal.linkedin} className="text-gray-700 hover:underline">LinkedIn</a>
              )}
              {personal.website && (
                <a href={personal.website} className="text-gray-700 hover:underline">Website</a>
              )}
            </div>
          </div>
          <PhotoOrInitials
            photoUrl={personal.photoUrl}
            fullName={personal.fullName || "Your Name"}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            borderClass="border-2 border-gray-200"
          />
        </header>

        {summary && (
          <section className="mb-5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-2 pb-1 border-b border-gray-300">
              Summary
            </h2>
            <p className="text-gray-700 leading-[1.5]">{summary}</p>
          </section>
        )}

        <section className="mb-5" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-3 pb-1 border-b border-gray-300">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between gap-2 items-baseline">
                  <span className="font-bold text-gray-900">{exp.jobTitle || "Job Title"}</span>
                  <span className="text-gray-500 text-[10px] whitespace-nowrap">
                    {exp.startDate}
                    {exp.endDate && ` – ${exp.current ? "Present" : exp.endDate}`}
                  </span>
                </div>
                <p className="text-gray-600 text-[10px] mt-0.5">
                  {exp.company}
                  {exp.location && ` · ${exp.location}`}
                </p>
                {exp.bullets.filter(Boolean).length > 0 && (
                  <ul className="mt-1.5 space-y-0.5 text-gray-700 pl-4 list-disc leading-[1.45]">
                    {exp.bullets.filter(Boolean).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className={`w-[100px] flex-shrink-0 ${SIDEBAR_BG} ${SIDEBAR_TEXT} p-4 flex flex-col gap-4`}>
        <h2 className="text-[9px] font-bold uppercase tracking-wider text-white/90">Skills</h2>
        {skills.length > 0 ? (
          <div className="space-y-0.5">
            {skills.map((s, i) => (
              <div key={i} className="text-[10px] text-white/95">{s}</div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-white/80">—</p>
        )}

        <h2 className="text-[9px] font-bold uppercase tracking-wider text-white/90 mt-1">Education</h2>
        <div className="space-y-2 text-[10px] text-white/95">
          {education.map((edu) => (
            <div key={edu.id}>
              <span className="font-semibold">{edu.degree}</span>
              {edu.field && <span>, {edu.field}</span>}
              <p className="text-white/80">{edu.school}</p>
              <p className="text-white/70">{edu.startDate} – {edu.endDate}</p>
            </div>
          ))}
        </div>

        {projects.filter((p) => p.title || p.description || (p.bullets && p.bullets.length)).length > 0 && (
          <>
            <h2 className="text-[9px] font-bold uppercase tracking-wider text-white/90">Projects</h2>
            <div className="space-y-2 text-[10px] text-white/95">
              {projects.filter((p) => p.title || p.description || (p.bullets && p.bullets.length)).map((proj) => (
                <div key={proj.id}>
                  <span className="font-semibold">{proj.title || "Project"}</span>
                  {proj.description ? (
                    <p className="text-white/80 text-[9px] mt-0.5">{proj.description}</p>
                  ) : null}
                  {proj.bullets && proj.bullets.length > 0 ? (
                    <ul className="text-white/80 text-[9px] mt-0.5 list-disc pl-4 space-y-0.5">
                      {proj.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                  {proj.links && proj.links.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {proj.links.map((link, i) => (
                        <div key={i} className="text-[9px]">
                          <span className="text-white/60">{link.label}: </span>
                          <a href={link.url} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                            {link.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
