/**
 * Page: Project Detail | Type: Server | Deps: db, notFound, Badge
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  ArrowLeft,
  ArrowSquareOut,
  GithubLogo,
} from "@phosphor-icons/react/dist/ssr";
import { getPublicSectionVisibility, requireVisibleSection } from "@/lib/section-visibility-server";
import { db } from "@/lib/db";
import { parseTags } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { ProjectImage } from "@/components/project-image";
import { parseProjectScreenshots } from "@/lib/project-screenshots";
import { publicMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";

const getProject = cache(async (slug: string) => {
  try {
    return await db.project.findUnique({ where: { slug } });
  } catch {
    // DB unavailable during build/prerender
    return null;
  }
});

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">) {
  const visibility = await getPublicSectionVisibility();
  if (!visibility.projects) return { title: "Project", robots: { index: false, follow: false } };
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return { title: "Project", robots: { index: false, follow: false } };
  }

  return publicMetadata(
    `/projects/${encodeURIComponent(project.slug)}`,
    project.title,
    project.description,
  );
}

export default async function ProjectDetailPage({
  params,
}: PageProps<"/projects/[slug]">) {
  await requireVisibleSection("projects");
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  const tags = parseTags(project.tags);
  const imageSrc = project.imageUrl ?? project.imageData;
  const images = [
    ...(imageSrc ? [{ src: imageSrc, caption: "" }] : []),
    ...parseProjectScreenshots(project.screenshots),
  ];

  const linkClasses =
    "type-ui inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 transition-all duration-200 active:scale-[0.98]";

  return (
    <div className="flex flex-col gap-10 py-20 md:py-28">
      <Reveal delay={0}>
        <Link
          href="/projects"
          className="type-ui inline-flex w-fit items-center gap-1.5 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft size={14} />
          All Projects
        </Link>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="flex flex-col gap-3">
          <span className="type-label text-accent">Project</span>
          <h1 className="type-page-title type-break text-gray-900 dark:text-gray-50">
            {project.title}
          </h1>
          <p className="type-body type-break text-gray-600 dark:text-gray-400">
            {project.description}
          </p>
        </div>
      </Reveal>

      {tags.length > 0 && (
        <Reveal delay={0.16}>
          <div className="-mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="type-caption">
                {tag}
              </Badge>
            ))}
          </div>
        </Reveal>
      )}

      {images.length > 0 && (
        <Reveal delay={0.24}>
          <ProjectImage images={images} title={project.title} />
        </Reveal>
      )}

      {project.content && (
        <Reveal delay={0.32}>
          <div className="flex flex-col gap-4">
            <h2 className="type-content-title text-gray-900 dark:text-gray-50">
              About
            </h2>
            <p className="type-body type-break whitespace-pre-wrap text-gray-600 dark:text-gray-400">
              {project.content}
            </p>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.4}>
        <div className="flex flex-wrap gap-3">
          {project.liveUrl ? (
            <Link
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkClasses} bg-gray-900 text-white shadow-sm hover:-translate-y-0.5 hover:bg-gray-700 hover:shadow-md dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200`}
            >
              <ArrowSquareOut size={16} />
              Visit live site
            </Link>
          ) : (
            <span className="type-ui inline-flex h-10 items-center rounded-lg border border-gray-200 px-4 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              Offline Demo only
            </span>
          )}
          {project.githubUrl && (
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkClasses} border border-gray-300 bg-transparent text-gray-900 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800`}
            >
              <GithubLogo size={16} />
              View source
            </Link>
          )}
        </div>
      </Reveal>
    </div>
  );
}
