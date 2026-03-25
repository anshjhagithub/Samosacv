"use client";

import { getFAQPageJsonLd } from "@/lib/seo/jsonLd";

const siteUrl = "https://samosacv.in";

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
