/**
 * Page: Admin New Project | Type: Server | Deps: ProjectForm, createProject
 */
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { ProjectForm } from "@/components/admin/project-form";
import { Card, CardContent } from "@/components/ui/card";
import { createProject } from "../actions";

export default function NewProjectPage() {
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
          New Project
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add a project to your portfolio.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <ProjectForm action={createProject} submitLabel="Create Project" />
        </CardContent>
      </Card>
    </div>
  );
}