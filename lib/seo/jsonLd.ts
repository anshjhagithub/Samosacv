/**
 * Shared data for JSON-LD and SEO. Keep in sync with app/page.tsx FAQ_ITEMS.
 */
export const FAQ_FOR_JSONLD = [
  { q: "Do I need an account?", a: "Yes, sign-up is required to create and track your resumes. Sign in with Google — it takes 2 seconds." },
  { q: "What do I get for free?", a: "ATS scoring, skill gap analysis, bullet suggestions, 82 role presets, 35+ template previews, and role intelligence — all completely free, no sign-up needed." },
  { q: "Why is it only ₹15?", a: "We use efficient AI models and have no subscription overhead. You pay only when you generate an AI-powered resume. No recurring fees, no hidden charges." },
  { q: "Can I use my existing resume?", a: "Yes. Upload PDF or paste LinkedIn text. Our AI extracts and rewrites with impact-driven language." },
  { q: "How does job matching work?", a: "Paste any job posting. AI analyzes requirements, matches your experience, and generates tailored content with ATS keywords." },
  { q: "Can I switch templates?", a: "Anytime. Switch between 35+ templates in the builder. Your content stays — only design changes." },
  { q: "Is my data safe?", a: "Enterprise-grade encryption. Never shared. Delete everything anytime." },
] as const;

export function getOrganizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Samosa CV",
    url: siteUrl,
    logo: `${siteUrl}/og.png`,
    description: "India's #1 AI resume builder. ATS-ready CV in 60 seconds for ₹15. Free ATS score, 82 role presets, 35+ templates.",
    areaServed: { "@type": "Country", name: "India" },
    servingRegion: "IN",
    sameAs: [],
    foundingDate: "2024",
  };
}

export function getWebApplicationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Samosa CV — AI Resume Builder",
    url: siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "15", priceCurrency: "INR" },
    description: "Create an ATS-ready resume in 60 seconds. AI-powered, 82 role presets, 35+ templates. Used by 50K+ job seekers in India.",
    featureList: [
      "ATS score and keyword optimization",
      "Skill gap analysis",
      "82 role presets for India",
      "35+ professional templates",
      "PDF download",
      "No subscription",
    ],
    inLanguage: "en-IN",
    audience: { "@type": "Audience", geographicArea: { "@type": "Country", name: "India" } },
  };
}

export function getFAQPageJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_FOR_JSONLD.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function getBreadcrumbJsonLd(siteUrl: string, items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
