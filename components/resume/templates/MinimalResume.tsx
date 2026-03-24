"use client";

import type { ResumeData } from "@/types/resume";
import { PhotoOrInitials } from "./PhotoOrInitials";

// Ivy League style: centered name & headings, thin centered rules, extreme whitespace
export function MinimalResume({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, skills, projects = [] } = data;
  const sectionTitle = "text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-4";
  return (
    <div className="resume-pdf-source bg-white text-gray-800 text-[11px] leading-[1.5] max-w-[210mm] min-h-[297mm] shadow-lg p-10">
      <header className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <PhotoOrInitials
            photoUrl={personal.photoUrl}
            fullName={personal.fullName || "Your Name"}
            className="w-20 h-20 rounded-full object-cover flex-shrink-0"
            borderClass="border border-gray-200"
          />
        </div>
        <h1 className="text-[1.5rem] font-semibold text-gray-900 tracking-tight">
          {personal.fullName || "Your Name"}
        </h1>
        {personal.title && (
          <p className="text-gray-600 mt-1 font-medium">{personal.title}</p>
        )}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-0 mt-3 text-gray-500 text-[10px]">
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
      </header>

      {summary && (
        <section className="mb-10 text-center">
          <h2 className={sectionTitle}>Summary</h2>
          <div className="w-12 h-px bg-gray-300 mx-auto mb-4" />
          <p className="text-gray-700 leading-[1.5] max-w-[85%] mx-auto">{summary}</p>
        </section>
      )}

      <section className="mb-10 text-center" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <h2 className={sectionTitle}>Experience</h2>
        <div className="w-12 h-px bg-gray-300 mx-auto mb-4" />
        <div className="space-y-5 text-left max-w-[95%] mx-auto">
          {experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between gap-2 items-baseline">
                <span className="font-semibold text-gray-900">{exp.jobTitle || "Job Title"}</span>
                <span className="text-gray-400 text-[10px] whitespace-nowrap">
                  {exp.startDate}
                  {exp.endDate && ` – ${exp.current ? "Present" : exp.endDate}`}
                </span>
              </div>
              <p className="text-gray-500 text-[10px] mt-0.5">
                {exp.company}
                {exp.location && ` · ${exp.location}`}
              </p>
              {exp.bullets.filter(Boolean).length > 0 && (
                <ul className="mt-2 space-y-1 text-gray-700 pl-4 list-disc leading-[1.5]">
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10 text-center" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <h2 className={sectionTitle}>Education</h2>
        <div className="w-12 h-px bg-gray-300 mx-auto mb-4" />
        <div className="text-left max-w-[95%] mx-auto space-y-3">
          {education.map((edu) => (
            <div key={edu.id}>
              <div className="flex justify-between gap-2 items-baseline">
                <span className="font-semibold text-gray-900">
                  {edu.degree}
                  {edu.field && `, ${edu.field}`}
                </span>
                <span className="text-gray-400 text-[10px]">{edu.startDate} – {edu.endDate}</span>
              </div>
              <p className="text-gray-600">{edu.school}</p>
              {edu.gpa && <p className="text-gray-500 text-[10px] mt-0.5">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      </section>

      {projects.filter((p) => p.title || p.description || (p.bullets && p.bullets.length)).length > 0 && (
        <section className="mb-10 text-center" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <h2 className={sectionTitle}>Projects</h2>
          <div className="w-12 h-px bg-gray-300 mx-auto mb-4" />
          <div className="text-left max-w-[95%] mx-auto space-y-3">
            {projects.filter((p) => p.title || p.description || (p.bullets && p.bullets.length)).map((proj) => (
              <div key={proj.id}>
                <span className="font-semibold text-gray-900">{proj.title || "Project"}</span>
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
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="text-center" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <h2 className={sectionTitle}>Skills</h2>
          <div className="w-12 h-px bg-gray-300 mx-auto mb-4" />
          <p className="text-gray-700 leading-[1.5]">{skills.join(" · ")}</p>
        </section>
      )}
    </div>
  );
}
