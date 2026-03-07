"use client";

import type { ResumeData } from "@/types/resume";
import type { ResumeTheme } from "./themes";
import { PhotoOrInitials } from "./PhotoOrInitials";

function SectionHeader({
  theme,
  children,
}: {
  theme: ResumeTheme;
  children: React.ReactNode;
}) {
  return (
    <h2
      className={`text-xs font-semibold uppercase tracking-wider ${theme.accent} mb-2`}
    >
      {children}
    </h2>
  );
}

export function ThemedResume({
  data,
  theme,
}: {
  data: ResumeData;
  theme: ResumeTheme;
}) {
  const { personal, summary, experience, education, skills, projects = [] } = data;
  const textSize = theme.compact ? "text-[10px]" : "text-[11px]";
  const headingFont = theme.serif ? "font-serif" : "";

  const contact = (
    <div className={`flex flex-wrap gap-x-3 gap-y-0 mt-1 text-gray-500 ${textSize}`}>
      {personal.phone && <span>{personal.phone}</span>}
      {personal.location && <span>{personal.location}</span>}
      {personal.linkedin && (
        <a href={personal.linkedin} className={`${theme.accentLink} hover:underline`}>
          LinkedIn
        </a>
      )}
      {personal.website && (
        <a href={personal.website} className={`${theme.accentLink} hover:underline`}>
          Website
        </a>
      )}
    </div>
  );

  const mainContent = (
    <>
      {summary && (
        <section className="mb-4">
          <SectionHeader theme={theme}>Summary</SectionHeader>
          <p className="text-gray-700">{summary}</p>
        </section>
      )}

      <section className="mb-4">
        <SectionHeader theme={theme}>Experience</SectionHeader>
        <div className={theme.compact ? "space-y-2" : "space-y-3"}>
          {experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline">
                <span className={`font-semibold text-gray-900 ${headingFont}`}>
                  {exp.jobTitle || "Job Title"}
                </span>
                <span className={`text-gray-500 ${textSize}`}>
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
        </div>
      </section>

      <section className="mb-4">
        <SectionHeader theme={theme}>Education</SectionHeader>
        {education.map((edu) => (
          <div key={edu.id} className="mb-2">
            <div className="flex justify-between items-baseline">
              <span className={`font-semibold text-gray-900 ${headingFont}`}>
                {edu.degree}
                {edu.field && ` in ${edu.field}`}
              </span>
              <span className={`text-gray-500 ${textSize}`}>
                {edu.startDate} – {edu.endDate}
              </span>
            </div>
            <p className="text-gray-600">{edu.school}</p>
            {edu.gpa && <p className={`text-gray-500 ${textSize}`}>GPA: {edu.gpa}</p>}
          </div>
        ))}
      </section>

      {projects.filter((p) => p.title || p.description || (p.bullets && p.bullets.length)).length > 0 && (
        <section className="mb-4">
          <SectionHeader theme={theme}>Projects</SectionHeader>
          {projects.filter((p) => p.title || p.description || (p.bullets && p.bullets.length)).map((proj) => (
            <div key={proj.id} className="mb-2">
              <span className={`font-semibold text-gray-900 ${headingFont}`}>
                {proj.title || "Project"}
              </span>
              {proj.bullets && proj.bullets.length > 0 ? (
                <ul className={`text-gray-700 ${textSize} mt-0.5 list-disc pl-4 space-y-0.5`}>
                  {proj.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : proj.description ? (
                <p className={`text-gray-700 ${textSize} mt-0.5`}>{proj.description}</p>
              ) : null}
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <SectionHeader theme={theme}>Skills</SectionHeader>
          <p className="text-gray-700">{skills.join(" · ")}</p>
        </section>
      )}
    </>
  );

  if (theme.twoColumn && theme.sidebarBg && theme.sidebarText) {
    return (
      <div
        className={`resume-pdf-source bg-white text-gray-800 ${textSize} leading-tight max-w-[210mm] min-h-[297mm] shadow-lg flex`}
      >
        <div
          className={`w-20 flex-shrink-0 ${theme.sidebarBg} ${theme.sidebarText} p-4 rounded-l`}
        >
          <div className="flex justify-center mb-2">
            <PhotoOrInitials
              photoUrl={personal.photoUrl}
              fullName={personal.fullName || "Your Name"}
              className="w-12 h-12 rounded-full object-cover"
              borderClass="border-2 border-white/30"
            />
          </div>
          <h1 className="text-sm font-bold leading-tight">
            {personal.fullName || "Your Name"}
          </h1>
          {personal.title && (
            <p className="text-white/90 text-[10px] mt-1">{personal.title}</p>
          )}
          <div className="mt-4 space-y-2 text-[10px] text-white/80">
            {personal.email && <div>{personal.email}</div>}
            {personal.phone && <div>{personal.phone}</div>}
            {personal.location && <div>{personal.location}</div>}
            {personal.linkedin && (
              <a href={personal.linkedin} className="underline">LinkedIn</a>
            )}
            {personal.website && (
              <a href={personal.website} className="underline">Website</a>
            )}
          </div>
        </div>
        <div className="flex-1 p-5">{mainContent}</div>
      </div>
    );
  }

  return (
    <div
      className={`resume-pdf-source bg-white text-gray-800 ${textSize} leading-tight p-6 max-w-[210mm] min-h-[297mm] shadow-lg`}
    >
      <header className={`border-b-2 ${theme.headerBorder} pb-2 mb-4 flex gap-3 justify-between items-start`}>
        <div className="min-w-0 flex-1">
          <h1
            className={`${theme.compact ? "text-lg" : "text-xl"} font-bold text-gray-900 tracking-tight ${headingFont}`}
          >
            {personal.fullName || "Your Name"}
          </h1>
          {(personal.title || personal.email) && (
            <p className="text-gray-600 mt-0.5">
              {[personal.title, personal.email].filter(Boolean).join(" · ")}
            </p>
          )}
          {contact}
        </div>
        <PhotoOrInitials
          photoUrl={personal.photoUrl}
          fullName={personal.fullName || "Your Name"}
          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
          borderClass="border-2 border-gray-300"
        />
      </header>
      {mainContent}
    </div>
  );
}
