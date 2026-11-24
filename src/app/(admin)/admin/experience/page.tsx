/**
 * Page: Admin Experience List | Type: Server | Deps: db, AdminHeader, AdminTable
 */
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { formatDateRange } from "@/lib/utils";
import { deleteExperience } from "./actions";
import type { Experience } from "@/types";

export const dynamic = "force-dynamic";

const columns: AdminColumn<Experience>[] = [
  {
    key: "role",
    header: "Role",
    className: "font-medium",
    render: (e) => e.role,
  },
  {
    key: "company",
    header: "Company",
    render: (e) => e.company,
  },
  {
    key: "dates",
    header: "Dates",
    render: (e) => formatDateRange(e.startDate, e.endDate, e.current),
  },
  {
    key: "current",
    header: "Current",
    render: (e) => (e.current ? "Yes" : "No"),
  },
  {
    key: "order",
    header: "Order",
    render: (e) => e.order,
  },
];

export default async function AdminExperiencePage() {
  const items = await db.experience.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Experience"
        description="Manage your work history."
        newHref="/admin/experience/new"
        newLabel="New Experience"
      />
      <AdminTable
        columns={columns}
        items={items}
        getEditHref={(e) => `/admin/experience/${e.id}/edit`}
        getDeleteMessage={(e) =>
          `Delete "${e.role} at ${e.company}"? This cannot be undone.`
        }
        deleteAction={deleteExperience}
        deleteIdOf={(e) => e.id}
        emptyLabel="No experience yet. Add your first role."
      />
    </div>
  );
}