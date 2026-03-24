"use client";

import type { ResumeData } from "@/types/resume";
import { PhotoOrInitials } from "./PhotoOrInitials";

// Muted teal header band + accent lines (Creative-style)
const HEADER_BG = "bg-teal-700";
const ACCENT = "text-teal-700";
const ACCENT_BORDER = "border-teal-600";

export function ClassicResume({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, skills, projects = [] } = data;
  return (
    <div className="resume-pdf-source bg-white text-gray-800 text-[11px] leading-[1.45] max-w-[210mm] min-h-[297mm] shadow-lg">
      {/* Full-width header band */}
      <header className={`${HEADER_BG} px-8 py-5 flex gap-5 justify-between items-center`}>
        <div className="min-w-0 flex-1">
          <h1 className="text-white text-[1.4rem] font-bold tracking-tight">
            {personal.fullName || "Your Name"}
          </h1>
          {personal.title && (
            <p className="text-white/95 text-[11px] font-medium mt-1">{personal.title}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-0 mt-2 text-white/90 text-[10px]">
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.location && <span>{personal.location}</span>}
            {personal.linkedin && (
              <a href={personal.linkedin} className="text-white hover:underline">LinkedIn</a>
            )}
            {personal.website && (
              <a href={personal.website} className="text-white hover:underline">Website</a>
            )}
          </div>
        </div>
        <PhotoOrInitials
          photoUrl={personal.photoUrl}
          fullName={personal.fullName || "Your Name"}
          className="w-[72px] h-[72px] rounded-full object-cover flex-shrink-0"
          borderClass="border-2 border-white/30"
        />
      </header>

      <div className="p-8">
        {summary && (
          <section className="mb-6">
            <h2 className={`text-[10px] font-bold uppercase tracking-widest ${ACCENT} mb-2 pb-1.5 border-b-2 ${ACCENT_BORDER}`}>
              Summary
            </h2>
            <p className="text-gray-700 leading-[1.5]">{summary}</p>
          </section>
        )}

        <section className="mb-6" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <h2 className={`text-[10px] font-bold uppercase tracking-widest ${ACCENT} mb-3 pb-1.5 border-b-2 ${ACCENT_BORDER}`}>
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline gap-2">
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
                  <ul className="mt-2 space-y-0.5 text-gray-700 pl-4 list-disc leading-[1.45]">
                    {exp.bullets.filter(Boolean).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <h2 className={`text-[10px] font-bold uppercase tracking-widest ${ACCENT} mb-3 pb-1.5 border-b-2 ${ACCENT_BORDER}`}>
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-baseline gap-2">
                <span className="font-bold text-gray-900">
                  {edu.degree}
                  {edu.field && ` in ${edu.field}`}
                </span>
                <span className="text-gray-500 text-[10px]">{edu.startDate} – {edu.endDate}</span>
              </div>
              <p className="text-gray-600">{edu.school}</p>
              {edu.gpa && <p className="text-gray-500 text-[10px] mt-0.5">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>

        {projects.filter((p) => p.title || p.description || (p.bullets && p.bullets.length)).length > 0 && (
          <section className="mb-6" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <h2 className={`text-[10px] font-bold uppercase tracking-widest ${ACCENT} mb-3 pb-1.5 border-b-2 ${ACCENT_BORDER}`}>
              Projects
            </h2>
            {projects.filter((p) => p.title || p.description || (p.bullets && p.bullets.length)).map((proj) => (
              <div key={proj.id} className="mb-2">
                <span className="font-bold text-gray-900">{proj.title || "Project"}</span>
                {proj.description ? (
                  <p className="text-gray-700 mt-0.5 leading-[1.45]">{proj.description}</p>
                ) : null}
                {proj.bullets && proj.bullets.length > 0 ? (
                  <ul className="text-gray-700 mt-0.5 leading-[1.45] list-disc pl-4 space-y-0.5 text-[11px]">
                    {proj.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}
                {proj.links && proj.links.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {proj.links.map((link, i) => (
                      <div key={i} className="text-[11px]">
                        <span className="text-gray-600">{link.label}: </span>
                        <a href={link.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                          {link.url}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {skills.length > 0 && (
          <section style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <h2 className={`text-[10px] font-bold uppercase tracking-widest ${ACCENT} mb-2 pb-1.5 border-b-2 ${ACCENT_BORDER}`}>
              Skills
            </h2>
            <p className="text-gray-700 leading-[1.5]">{skills.join(" · ")}</p>
          </section>
        )}
      </div>
    </div>
  );
}
