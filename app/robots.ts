import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samosacv.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/auth/", "/unlock", "/payment-status"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/api/", "/auth/", "/unlock", "/payment-status"] },
      { userAgent: "Bingbot", allow: "/", disallow: ["/api/", "/auth/", "/unlock", "/payment-status"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
