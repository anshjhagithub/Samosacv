import { getBreadcrumbJsonLd } from "@/lib/seo/jsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samosacv.com";

type Props = { items: { name: string; path: string }[] };

/** Renders BreadcrumbList JSON-LD. Pass path (e.g. /pricing), we build full URL. */
export function BreadcrumbJsonLd({ items }: Props) {
  const list = [
    { name: "Home", url: siteUrl },
    ...items.map((i) => ({ name: i.name, url: `${siteUrl}${i.path}` })),
  ];
  const json = getBreadcrumbJsonLd(siteUrl, list);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
