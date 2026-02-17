"use client";

import type { ResumeData } from "@/types/resume";

export function ClassicResume({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, skills, projects = [] } = data;
  return (
    <div className="resume-pdf-source bg-white text-gray-800 text-[11px] leading-tight p-6 max-w-[210mm] min-h-[297mm] shadow-lg">
      {/* Header */}
      <header className="border-b-2 border-teal-600 pb-2 mb-4 flex gap-3 justify-between items-start">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {personal.fullName || "Your Name"}
          </h1>
          {(personal.title || personal.email) && (
          <p className="text-gray-600 mt-0.5">
            {[personal.title, personal.email].filter(Boolean).join(" · ")}
          </p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-0 mt-1 text-gray-500">
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && (
            <a href={personal.linkedin} className="text-teal-600 hover:underline">
              LinkedIn
            </a>
          )}
          {personal.website && (
            <a href={personal.website} className="text-teal-600 hover:underline">
              Website
            </a>
          )}
        </div>
        </div>
        {personal.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- user photo can be data URL; next/image doesn't support data URLs
          <img
            src={personal.photoUrl}
            alt=""
            className="w-14 h-14 rounded-full object-cover border-2 border-teal-600/30 flex-shrink-0"
          />
        )}
      </header>

      {summary && (
        <section className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
            Summary
          </h2>
          <p className="text-gray-700">{summary}</p>
        </section>
      )}

      <section className="mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-2">
          Experience
        </h2>
        {experience.map((exp) => (
          <div key={exp.id} className="mb-3">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-gray-900">{exp.jobTitle || "Job Title"}</span>
              <span className="text-gray-500 text-[10px]">
                {exp.startDate}
                {exp.endDate && ` – ${exp.current ? "Present" : exp.endDate}`}
              </span>
            </div>
            <p className="text-gray-600">
              {exp.company}
              {exp.location && ` · ${exp.location}`}
            </p>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-gray-700">
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className="mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-2">
          Education
        </h2>
        {education.map((edu) => (
          <div key={edu.id} className="mb-2">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-gray-900">
                {edu.degree}
                {edu.field && ` in ${edu.field}`}
              </span>
              <span className="text-gray-500 text-[10px]">
                {edu.startDate} – {edu.endDate}
              </span>
            </div>
            <p className="text-gray-600">{edu.school}</p>
            {edu.gpa && <p className="text-gray-500 text-[10px]">GPA: {edu.gpa}</p>}
          </div>
        ))}
      </section>

      {projects.filter((p) => p.title || p.description).length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-2">
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
          <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
            Skills
          </h2>
          <p className="text-gray-700">{skills.join(" · ")}</p>
        </section>
      )}
    </div>
  );
}
