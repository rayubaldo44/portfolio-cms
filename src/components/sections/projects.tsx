/**
 * Section: Projects | Type: Server | Deps: db, Section, FeaturedProjectDeck
 */
import { db } from "@/lib/db";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { FeaturedProjectDeck } from "@/components/featured-project-deck";
import { parseTags } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectsSectionProps {
  standalone?: boolean;
}

export async function ProjectsSection({
  standalone = false,
}: ProjectsSectionProps = {}) {
  let projects: Project[] = [];

  try {
    const raw = await db.project.findMany({
      where: { featured: true },
      orderBy: { order: "asc" },
      take: 3,
      omit: { screenshots: true },
    });
    projects = raw.map((p) => ({
      ...p,
      tags: parseTags(p.tags),
    }));
  } catch {
    // DB unavailable during build/prerender
  }

  return (
    <Section id="projects">
      <Reveal>
        <SectionHeading
          title="Featured projects"
          action={
            standalone
              ? { label: "Back to Site", href: "/" }
              : { label: "All Projects", href: "/projects" }
          }
        />
      </Reveal>
      {projects.length === 0 ? (
        <Reveal>
          <p className="type-body-compact mt-8 text-gray-500 dark:text-gray-400">
            No projects yet. Add some in the admin dashboard.
          </p>
        </Reveal>
      ) : (
        <FeaturedProjectDeck
          projects={projects.map((project) => ({
            id: project.id,
            title: project.title,
            slug: project.slug,
            description: project.description,
            imageSrc: project.imageUrl ?? project.imageData,
            tags: project.tags,
          }))}
        />
      )}
    </Section>
  );
}
