import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samosacv.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/builder`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${baseUrl}/resume/start`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/templates`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms-and-conditions`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/create`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/onboarding`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
