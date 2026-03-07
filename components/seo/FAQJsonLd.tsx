"use client";

import { getFAQPageJsonLd } from "@/lib/seo/jsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samosacv.com";

/** Renders FAQPage JSON-LD for homepage (rich results in Google). */
export function FAQJsonLd() {
  const faq = getFAQPageJsonLd(siteUrl);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
    />
  );
}
