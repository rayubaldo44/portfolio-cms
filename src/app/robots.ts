/**
 * Route: Robots | Type: Metadata
 * Blocks crawling of admin/private surfaces so they never show up in search.
 */
import type { MetadataRoute } from "next";

import { siteOrigin } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: ["/admin", "/admin-login", "/dashboard", "/api"],
    },
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}
