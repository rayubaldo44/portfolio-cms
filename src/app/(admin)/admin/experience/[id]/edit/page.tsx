/**
 * Page: Admin Edit Experience | Type: Server | Deps: db, ExperienceForm, updateExperience
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { toDateInputValueUTC } from "@/lib/utils";
import { ExperienceForm } from "@/components/admin/experience-form";
import { Card, CardContent } from "@/components/ui/card";
import { updateExperience } from "../../actions";

export const dynamic = "force-dynamic";

interface EditExperiencePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExperiencePage({
  params,
}: EditExperiencePageProps) {
  const { id } = await params;
  const experience = await db.experience.findUnique({ where: { id } });

  if (!experience) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link
        href="/admin/experience"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <ArrowLeft size={14} />
        Back to experience
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Edit Experience
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Update the role at {experience.company}.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <ExperienceForm
            action={updateExperience}
            submitLabel="Save Changes"
            id={experience.id}
            initial={{
              company: experience.company,
              role: experience.role,
              description: experience.description ?? "",
              location: experience.location ?? "",
              startDate: toDateInputValueUTC(experience.startDate),
              endDate: toDateInputValueUTC(experience.endDate),
              current: experience.current,
              order: experience.order,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}