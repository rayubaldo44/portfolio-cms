/**
 * Page: Admin Stack List | Type: Server | Deps: db, AdminHeader, AdminTable
 */
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { deleteSkill } from "./actions";
import type { Skill } from "@/types";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  tools: "Dev Tools",
  ai_ml: "AI & Machine Learning",
};

const columns: AdminColumn<Skill>[] = [
  {
    key: "name",
    header: "Name",
    className: "font-medium",
    render: (s) => s.name,
  },
  {
    key: "category",
    header: "Category",
    render: (s) => (
      <Badge variant="outline">
        {categoryLabels[s.category] ?? s.category}
      </Badge>
    ),
  },
  {
    key: "order",
    header: "Order",
    render: (s) => s.order,
  },
];

export default async function AdminStackPage() {
  const raw = await db.skill.findMany({ orderBy: { order: "asc" } });
  const items = raw as Skill[];

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Stack"
        description="Manage the skills shown in your stack."
        newHref="/admin/stack/new"
        newLabel="New Skill"
      />
      <AdminTable
        columns={columns}
        items={items}
        getEditHref={(s) => `/admin/stack/${s.id}/edit`}
        getDeleteMessage={(s) => `Delete skill "${s.name}"? This cannot be undone.`}
        deleteAction={deleteSkill}
        deleteIdOf={(s) => s.id}
        emptyLabel="No skills yet. Add your first one."
      />
    </div>
  );
}