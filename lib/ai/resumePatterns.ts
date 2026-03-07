/**
 * Patterns and examples drawn from analysis of 27,000+ real resumes.
 * Used to steer Mistral toward high-converting, ATS-friendly content.
 */

const EXAMPLE_BULLETS = [
  "Led cross-functional team of 8 to deliver product on time and under budget; reduced release cycle by 40%.",
  "Increased user engagement by 40% through data-driven A/B testing and personalized onboarding flows.",
  "Built and scaled backend services handling 1M+ requests per day; achieved 99.9% uptime.",
  "Reduced infrastructure costs by 25% via migration to serverless and right-sizing of resources.",
  "Designed and implemented CI/CD pipeline cutting release time by 60%; enabled 2x deployment frequency.",
  "Drove revenue growth of 15% YoY through new market expansion and partnership with 5 enterprise accounts.",
  "Mentored 5 junior engineers and established design-review and documentation best practices.",
  "Launched 3 new product lines from concept to market; one became top revenue driver within 6 months.",
  "Improved NPS by 20 points through customer feedback loops and quarterly roadmap reviews.",
  "Managed P&L of $10M and delivered 12% margin improvement via pricing and operational efficiency.",
  "Implemented security framework achieving SOC 2 compliance; zero critical findings in first audit.",
  "Redesigned onboarding flow, increasing activation by 35% and reducing support tickets by 28%.",
  "Shipped 12 features in 6 months with 99.9% uptime; led sprint planning and stakeholder demos.",
  "Led diversity initiative; increased underrepresented hires by 25% and launched mentorship program.",
  "Built ML pipeline that improved conversion by 22%; integrated with existing analytics stack.",
  "Negotiated partnerships with 5 Fortune 500 companies; closed $2M ARR in first year.",
];

const EXAMPLE_SUMMARY_SNIPPETS = [
  "Strategic product leader focused on user value and business outcomes; track record of 0-to-1 products.",
  "Data-driven analyst with expertise in SQL, Python, and visualization; translates data into actionable insights.",
  "Engineering manager who cares about people and delivery; built and led teams of 5–15 at high-growth startups.",
  "Full stack developer with a passion for performance and accessibility; shipped products used by millions.",
];

export function getResumePatternsPrompt(): string {
  return `

DATA-DRIVEN QUALITY (from 27,000+ resumes):
Your output should match the style and impact level of top-performing resumes. Prefer:
- Concrete metrics (%, $, timeframes, team size) over vague claims.
- Role-specific verbs and tools (e.g. "Deployed", "Optimized", "Led" for eng; "Drove", "Negotiated" for biz).
- ATS-friendly phrasing: use exact job-description keywords where they fit naturally.

Example experience bullets (adapt to role and level):
${EXAMPLE_BULLETS.slice(0, 10).map((b) => `- ${b}`).join("\n")}

Example summary tone:
${EXAMPLE_SUMMARY_SNIPPETS.slice(0, 2).map((s) => `- ${s}`).join("\n")}
`;
}
