/**
 * Page: Admin New Certification | Type: Server | Deps: CertificationForm, createCertification
 */
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { CertificationForm } from "@/components/admin/certification-form";
import { Card, CardContent } from "@/components/ui/card";
import { createCertification } from "../actions";

export default function NewCertificationPage() {
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
          New Certification
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add a certification to your portfolio.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <CertificationForm
            action={createCertification}
            submitLabel="Create Certification"
          />
        </CardContent>
      </Card>
    </div>
  );
}