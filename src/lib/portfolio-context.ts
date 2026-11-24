/**
 * Knowledge base builder | Type: Server | Deps: db, utils
 *
 * Fetches the full CMS contents and serializes them into a compact
 * text block that is injected into the chatbot's system prompt on every
 * request. Because this runs per-request, answers always reflect the
 * latest content saved via the admin panel — no indexing, no RAG.
 */
import { getSectionVisibility } from "@/lib/section-visibility";
import { db } from "@/lib/db";
import { getAvailabilityLabel } from "@/lib/availability";
import { formatDate, formatDateRange, parseTags } from "@/lib/utils";

const FALLBACK_CONTEXT = "The portfolio is currently empty.";

function joinLines(lines: (string | null | undefined)[]) {
  return lines.filter((line) => line && line.trim() !== "").join("\n");
}

function serializeProjects(
  rows: Omit<Awaited<ReturnType<typeof db.project.findMany>>[number], "screenshots">[],
): string {
  if (rows.length === 0) return "";

  const blocks = rows.map((project) => {
    const tags = parseTags(project.tags);
    const tagLine = tags.length > 0 ? `\n   Tags: ${tags.join(", ")}` : "";
    const links = [
      project.liveUrl ? `Live: ${project.liveUrl}` : "",
      project.githubUrl ? `GitHub: ${project.githubUrl}` : "",
    ].filter(Boolean);

    return joinLines([
      `- ${project.title}${project.featured ? " (featured)" : ""}`,
      `  Description: ${project.description}`,
      project.content ? `  Details: ${project.content.replace(/\s+/g, " ")}` : "",
      tagLine,
      links.length > 0 ? `  Links: ${links.join(" | ")}` : "",
    ]);
  });

  return joinLines(["## Projects", ...blocks]);
}

function serializeExperience(
  rows: Awaited<ReturnType<typeof db.experience.findMany>>,
): string {
  if (rows.length === 0) return "";

  const blocks = rows.map((entry) => {
    const period = formatDateRange(
      entry.startDate,
      entry.endDate,
      entry.current,
    );
    const location = entry.location ? ` - ${entry.location}` : "";

    return joinLines([
      `- ${entry.role} @ ${entry.company}${location}`,
      `  Period: ${period}`,
      entry.description
        ? `  Details: ${entry.description.replace(/\s+/g, " ")}`
        : "",
    ]);
  });

  return joinLines(["## Experience", ...blocks]);
}

function serializeSkills(
  rows: Awaited<ReturnType<typeof db.skill.findMany>>,
): string {
  if (rows.length === 0) return "";

  const byCategory = new Map<string, string[]>();
  for (const skill of rows) {
    const list = byCategory.get(skill.category) ?? [];
    list.push(skill.name);
    byCategory.set(skill.category, list);
  }

  const lines = ["## Skills"];
  for (const [category, names] of byCategory) {
    lines.push(`- ${category}: ${names.join(", ")}`);
  }

  return lines.join("\n");
}

function serializeCertifications(
  rows: Awaited<ReturnType<typeof db.certification.findMany>>,
): string {
  if (rows.length === 0) return "";

  const blocks = rows.map((cert) => {
    const date = formatDate(cert.date);
    const url = cert.url ? ` (${cert.url})` : "";
    return `- ${cert.name} - ${cert.issuer}, ${date}${url}`;
  });

  return joinLines(["## Certifications", ...blocks]);
}

export async function buildPortfolioContext(): Promise<string> {
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: "singleton" } });
    const visibility = getSectionVisibility(settings);
    const [projects, experience, skills, certifications] = await Promise.all([
      visibility.projects ? db.project.findMany({ orderBy: { order: "asc" }, omit: { screenshots: true } }) : [],
      visibility.experience ? db.experience.findMany({ orderBy: { order: "asc" } }) : [],
      visibility.stack ? db.skill.findMany({ orderBy: { order: "asc" } }) : [],
      visibility.certifications ? db.certification.findMany({ orderBy: { order: "asc" } }) : [],
    ]);

    const sections = [
      visibility.about && settings?.bio ? `## About\n${settings.bio.trim()}` : "",
      serializeProjects(projects),
      serializeExperience(experience),
      serializeSkills(skills),
      serializeCertifications(certifications),
      settings
        ? `## Availability\n${getAvailabilityLabel(settings.availabilityStatus)}`
        : "",
      settings &&
      (settings.email || settings.github || settings.linkedin || settings.twitter)
        ? ["## Contact", [
            settings.email ? `Email: ${settings.email}` : "",
            settings.github ? `GitHub: ${settings.github}` : "",
            settings.linkedin ? `LinkedIn: ${settings.linkedin}` : "",
            settings.twitter ? `Twitter: ${settings.twitter}` : "",
          ]
            .filter(Boolean)
            .join("\n")]
        : "",
    ];

    const context = sections.filter(Boolean).join("\n\n");
    return context === "" ? FALLBACK_CONTEXT : context;
  } catch {
    return FALLBACK_CONTEXT;
  }
}
