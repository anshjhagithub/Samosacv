import type { MetadataRoute } from "next";

const baseUrl = "https://samosacv.in";

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
