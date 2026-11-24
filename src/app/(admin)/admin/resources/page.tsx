import type { Resource } from "@prisma/client";
import { db } from "@/lib/db";
import { getResourceCategoryLabel } from "@/lib/resources";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { deleteResource } from "./actions";

export const dynamic = "force-dynamic";
const columns: AdminColumn<Resource>[] = [
  { key: "title", header: "Resource", className: "font-medium", render: resource => resource.title },
  { key: "category", header: "Skill area", render: resource => getResourceCategoryLabel(resource.category) },
  { key: "order", header: "Order", render: resource => resource.order },
];

export default async function AdminResourcesPage() {
  const resources = await db.resource.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Resources" description="Share the courses, documentation, and references you learn from." newHref="/admin/resources/new" newLabel="New Resource" secondaryHref="/resources" secondaryLabel="View page" />
      <AdminTable columns={columns} items={resources} getEditHref={resource => `/admin/resources/${resource.id}/edit`} getDeleteMessage={resource => `Delete "${resource.title}"? This cannot be undone.`} deleteAction={deleteResource} deleteIdOf={resource => resource.id} emptyLabel="No resources yet. Add your first learning resource." />
    </div>
  );
}
