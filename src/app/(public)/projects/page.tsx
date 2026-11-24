import { requireVisibleSection } from "@/lib/section-visibility-server";
/**
 * Page: Projects | Type: Server | Deps: ProjectsSection
 */
import { publicMetadata } from "@/lib/site";
import { ProjectsSection } from "@/components/sections/projects";

export const metadata = publicMetadata("/projects", "Projects",
  "Explore featured web applications and AI projects by Alex Morgan.",
);

export default async function ProjectsPage() {
  await requireVisibleSection("projects");
  return <ProjectsSection standalone />;
}
