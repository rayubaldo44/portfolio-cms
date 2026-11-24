/**
 * Page: Admin Certifications List | Type: Server | Deps: db, AdminHeader, AdminTable
 */
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { formatDate } from "@/lib/utils";
import { deleteCertification } from "./actions";
import type { Certification } from "@/types";
import { certificateFileUrl } from "@/lib/certificate-file";
import { certificationCategoryLabel } from "@/lib/certification-categories";

export const dynamic = "force-dynamic";

const columns: AdminColumn<Certification>[] = [
  {
    key: "name",
    header: "Name",
    className: "font-medium",
    render: (c) => c.name,
  },
  {
    key: "issuer",
    header: "Issuer",
    render: (c) => c.issuer,
  },
  {
    key: "category",
    header: "Category",
    render: (c) => certificationCategoryLabel(c.category),
  },
  {
    key: "date",
    header: "Date",
    render: (c) => formatDate(c.date),
  },
  {
    key: "imageUrl",
    header: "Certificate",
    render: (c) => c.imageUrl ? <a href={c.imageUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">View certificate</a> : "—",
  },
  {
    key: "order",
    header: "Order",
    render: (c) => c.order,
  },
];

export default async function AdminCertificationsPage() {
  const items = await db.certification.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Certifications"
        description="Manage your credentials and courses."
        newHref="/admin/certifications/new"
        newLabel="New Certification"
      />
      <AdminTable
        columns={columns}
        items={items.map((item) => ({ ...item, imageUrl: item.imageUrl?.startsWith("data:") ? certificateFileUrl(item.id) : item.imageUrl }))}
        getEditHref={(c) => `/admin/certifications/${c.id}/edit`}
        getDeleteMessage={(c) =>
          `Delete "${c.name}"? This cannot be undone.`
        }
        deleteAction={deleteCertification}
        deleteIdOf={(c) => c.id}
        emptyLabel="No certifications yet. Add your first one."
      />
    </div>
  );
}
