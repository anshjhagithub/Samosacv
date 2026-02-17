"use client";

import type { ResumeData } from "@/types/resume";

export function ModernResume({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, skills, projects = [] } = data;
  return (
    <div className="resume-pdf-source bg-white text-gray-800 text-[11px] leading-tight max-w-[210mm] min-h-[297mm] shadow-lg flex">
      {/* Left accent bar */}
      <div className="w-1.5 bg-indigo-600 flex-shrink-0 rounded-l" />
      <div className="flex-1 p-6">
        <header className="mb-5 flex gap-3 justify-between items-start">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {personal.fullName || "Your Name"}
            </h1>
            {personal.title && (
              <p className="text-indigo-600 font-medium mt-0.5">{personal.title}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-0 mt-2 text-gray-500 text-[10px]">
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.location && <span>{personal.location}</span>}
            {personal.linkedin && (
              <a href={personal.linkedin} className="text-indigo-600 hover:underline">
                LinkedIn
              </a>
            )}
            {personal.website && (
              <a href={personal.website} className="text-indigo-600 hover:underline">
                Website
              </a>
            )}
          </div>
          </div>
          {personal.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- user photo (data URL or external)
            <img
              src={personal.photoUrl}
              alt=""
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-600/30 flex-shrink-0"
            />
          )}
        </header>

        {summary && (
          <section className="mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-1">
              Summary
            </h2>
            <p className="text-gray-700">{summary}</p>
          </section>
        )}

        <section className="mb-4 pb-3 border-b border-gray-200">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-2">
            Experience
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-gray-900">{exp.jobTitle || "Job Title"}</span>
                <span className="text-gray-400 text-[10px] whitespace-nowrap">
                  {exp.startDate}
                  {exp.endDate && ` – ${exp.current ? "Present" : exp.endDate}`}
                </span>
              </div>
              <p className="text-gray-600 text-[10px]">
                {exp.company}
                {exp.location && ` · ${exp.location}`}
              </p>
              {exp.bullets.filter(Boolean).length > 0 && (
                <ul className="mt-1 space-y-0.5 text-gray-700 pl-4 list-disc">
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>

        <section className="mb-4 pb-3 border-b border-gray-200">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-2">
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-gray-900">
                  {edu.degree}
                  {edu.field && `, ${edu.field}`}
                </span>
                <span className="text-gray-400 text-[10px]">
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
              <p className="text-gray-600">{edu.school}</p>
              {edu.gpa && <p className="text-gray-500 text-[10px]">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>

        {projects.filter((p) => p.title || p.description).length > 0 && (
          <section className="mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-2">
              Projects
            </h2>
            {projects.filter((p) => p.title || p.description).map((proj) => (
              <div key={proj.id} className="mb-2">
                <span className="font-semibold text-gray-900">{proj.title || "Project"}</span>
                {proj.description && (
                  <p className="text-gray-700 text-[10px] mt-0.5">{proj.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-1">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px]"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
