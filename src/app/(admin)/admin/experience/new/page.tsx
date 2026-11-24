/**
 * Page: Admin New Experience | Type: Server | Deps: ExperienceForm, createExperience
 */
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { ExperienceForm } from "@/components/admin/experience-form";
import { Card, CardContent } from "@/components/ui/card";
import { createExperience } from "../actions";

export default function NewExperiencePage() {
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
          New Experience
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add a role to your work history.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <ExperienceForm
            action={createExperience}
            submitLabel="Create Experience"
          />
        </CardContent>
      </Card>
    </div>
  );
}