/**
 * Page: Admin Import Projects | Type: Server | Deps: ProjectImportForm
 */
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { ProjectImportForm } from "@/components/admin/project-import-form";
import { Card, CardContent } from "@/components/ui/card";

export default function ImportProjectsPage() {
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
          Import Projects
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Bulk-add many projects by pasting a JSON array.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <ProjectImportForm />
        </CardContent>
      </Card>
    </div>
  );
}