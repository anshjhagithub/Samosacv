# AI Resume Builder

Paste your LinkedIn profile, upload a PDF resume, or add a job description. AI generates a tailored resume with most fields prefilled. Use smart suggestions to improve bullets and summary. No sign-up required.

## Features

- **AI-generated resume** — Paste LinkedIn/resume text or upload a PDF. Optionally paste a job description; the resume is tailored to the role (keywords, emphasis).
- **Prefilled builder** — After generation, the builder opens with personal info, experience, education, skills, and summary already filled. Edit anything.
- **Smart suggestions** — **Improve with AI** on any bullet or the summary. **Suggest bullets** for a role to get 3 new bullet ideas.
- **PDF upload** — Upload a PDF resume; text is extracted on the server and fed to the AI.
- **Templates & export** — Classic and Modern templates, live preview, one-click PDF download.
- **Progress saved** — All data is stored in your browser (localStorage).

## Quick start

1. Set `MISTRAL_API_KEY` in `.env` (get a key at [console.mistral.ai](https://console.mistral.ai)).
2. `npm install` then `npm run dev`.
3. Open [http://localhost:3000](http://localhost:3000):
   - Paste your resume/LinkedIn text (or upload a PDF) and optionally a job description.
   - Click **Generate my resume with AI**.
   - Review and edit in the builder; use **Improve** / **Suggest bullets** / **Improve with AI** (summary) as needed.
   - Download PDF.

## Tech

- Next.js 14, React, TypeScript, Tailwind
- Mistral (extract + improve) via Vercel AI SDK
- PDF parsing: pdf-parse (server); PDF export: html2canvas + jspdf
- Persistence: localStorage
