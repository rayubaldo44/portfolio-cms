/**
 * Page: Admin Edit Project | Type: Server | Deps: db, ProjectForm, updateProject
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { parseTags } from "@/lib/utils";
import { ProjectForm } from "@/components/admin/project-form";
import { Card, CardContent } from "@/components/ui/card";
import { updateProject } from "../../actions";
import { parseProjectScreenshots } from "@/lib/project-screenshots";

export const dynamic = "force-dynamic";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });

  if (!project) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link
        href="/admin/projects"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <ArrowLeft size={14} />
        Back to projects
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Edit Project
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Update &quot;{project.title}&quot;.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <ProjectForm
            action={updateProject}
            submitLabel="Save Changes"
            id={project.id}
            initial={{
              title: project.title,
              slug: project.slug,
              description: project.description,
              content: project.content ?? "",
              imageUrl: project.imageUrl ?? "",
              imageData: project.imageData ?? "",
              screenshots: parseProjectScreenshots(project.screenshots),
              liveUrl: project.liveUrl ?? "",
              githubUrl: project.githubUrl ?? "",
              tags: parseTags(project.tags).join(", "),
              featured: project.featured,
              order: project.order,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
