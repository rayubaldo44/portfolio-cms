import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ResourceForm } from "@/components/admin/resource-form";
import { Card, CardContent } from "@/components/ui/card";
import { updateResource } from "../../actions";

export const dynamic = "force-dynamic";
export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = await db.resource.findUnique({ where: { id } });
  if (!resource) notFound();
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Link href="/admin/resources" className="type-ui w-fit text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">← Back to resources</Link>
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">Edit Resource</h1>
      <Card><CardContent className="p-6"><ResourceForm action={updateResource} initial={resource} id={resource.id} submitLabel="Save Changes" /></CardContent></Card>
    </div>
  );
}
