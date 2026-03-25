import { getOrganizationJsonLd, getWebApplicationJsonLd } from "@/lib/seo/jsonLd";

const siteUrl = "https://samosacv.in";

/** Renders Organization + WebApplication JSON-LD in head. Use in root layout. */
export function JsonLdScript() {
  const org = getOrganizationJsonLd(siteUrl);
  const webApp = getWebApplicationJsonLd(siteUrl);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }}
      />
    </>
  );
}
