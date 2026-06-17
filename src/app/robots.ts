import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/**
 * /api and /recherche are kept out of crawling.
 *
 * /admin is intentionally NOT disallowed: it carries a `noindex` directive
 * (admin/layout.tsx metadata + X-Robots-Tag header in next.config) and Google
 * only honors noindex on pages it is allowed to crawl. Disallowing it instead
 * would let it appear in results as a bare URL whenever something links to it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/recherche"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
