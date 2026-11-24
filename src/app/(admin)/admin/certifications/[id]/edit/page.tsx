/**
 * Page: Admin Edit Certification | Type: Server | Deps: db, CertificationForm, updateCertification
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { toDateInputValueUTC } from "@/lib/utils";
import { CertificationForm } from "@/components/admin/certification-form";
import { certificateFileUrl } from "@/lib/certificate-file";
import { Card, CardContent } from "@/components/ui/card";
import { updateCertification } from "../../actions";

export const dynamic = "force-dynamic";

interface EditCertificationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCertificationPage({
  params,
}: EditCertificationPageProps) {
  const { id } = await params;
  const certification = await db.certification.findUnique({ where: { id } });

  if (!certification) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link
        href="/admin/certifications"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <ArrowLeft size={14} />
        Back to certifications
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Edit Certification
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Update &quot;{certification.name}&quot;.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <CertificationForm
            action={updateCertification}
            submitLabel="Save Changes"
            id={certification.id}
            initial={{
              name: certification.name,
              issuer: certification.issuer,
              category: certification.category ?? "",
              date: toDateInputValueUTC(certification.date),
              url: certification.url ?? "",
              imageUrl: certification.imageUrl?.startsWith("data:") ? "" : certification.imageUrl ?? "",
              certificateUrl: certification.imageUrl?.startsWith("data:") ? certificateFileUrl(certification.id) : undefined,
              certificateIsPdf: certification.imageUrl?.startsWith("data:application/pdf;") ?? false,
              order: certification.order,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
