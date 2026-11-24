import Link from "next/link";
import { ResourceForm } from "@/components/admin/resource-form";
import { Card, CardContent } from "@/components/ui/card";
import { createResource } from "../actions";

export default function NewResourcePage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Link href="/admin/resources" className="type-ui w-fit text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">← Back to resources</Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">New Resource</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Add a source that helped you learn a skill.</p>
      </div>
      <Card><CardContent className="p-6"><ResourceForm action={createResource} submitLabel="Create Resource" /></CardContent></Card>
    </div>
  );
}
