/**
 * Page: Admin Projects List | Type: Server | Deps: db, AdminHeader, AdminTable
 */
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { PinButton } from "@/components/admin/pin-button";
import { Badge } from "@/components/ui/badge";
import { parseTags } from "@/lib/utils";
import { deleteProject } from "./actions";
import type { Project } from "@/types";

export const dynamic = "force-dynamic";

const columns: AdminColumn<Project>[] = [
  {
    key: "title",
    header: "Title",
    className: "font-medium",
    render: (p) => p.title,
  },
  {
    key: "tags",
    header: "Tags",
    render: (p) => {
      if (p.tags.length === 0) return <span className="text-gray-400">-</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {p.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    key: "pinned",
    header: "Pinned",
    render: (p) => <PinButton id={p.id} pinned={p.featured} />,
  },
  {
    key: "order",
    header: "Order",
    render: (p) => p.order,
  },
];

export default async function AdminProjectsPage() {
  const raw = await db.project.findMany({ orderBy: { order: "asc" }, omit: { screenshots: true } });
  const projects: Project[] = raw.map((p) => ({ ...p, tags: parseTags(p.tags) }));

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Projects"
        description="Manage your portfolio projects."
        newHref="/admin/projects/new"
        newLabel="New Project"
        secondaryHref="/admin/projects/import"
        secondaryLabel="Import"
      />
      <AdminTable
        columns={columns}
        items={projects}
        getEditHref={(p) => `/admin/projects/${p.id}/edit`}
        getDeleteMessage={(p) =>
          `Delete "${p.title}"? This cannot be undone.`
        }
        deleteAction={deleteProject}
        deleteIdOf={(p) => p.id}
        emptyLabel="No projects yet. Create your first one."
      />
    </div>
  );
}
