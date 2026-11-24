/**
 * Route: Sitemap | Type: Metadata
 * Lists public routes for search engine discovery.
 */
import type { MetadataRoute } from "next";

import { siteOrigin } from "@/lib/site";
import { SECTION_OPTIONS } from "@/lib/section-visibility";
import { getPublicSectionVisibility } from "@/lib/section-visibility-server";
import { db } from "@/lib/db";

// Keep newly added projects discoverable without requiring a deployment.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const visibility = await getPublicSectionVisibility();
  const routes = [
    "",
    "/privacy",
    "/resources",
    ...SECTION_OPTIONS.flatMap(section =>
      section.href && visibility[section.key] ? [section.href] : [],
    ),
  ];

  const entries: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${siteOrigin}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  if (!visibility.projects) return entries;

  try {
    const projects = await db.project.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { slug: "asc" },
    });
    entries.push(...projects.map((project) => ({
      url: `${siteOrigin}/projects/${encodeURIComponent(project.slug)}`,
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })));
  } catch {
    // Avoid logging database errors that may contain connection details.
    console.error("Sitemap: project lookup failed; returning static routes.");
  }

  return entries;
}
