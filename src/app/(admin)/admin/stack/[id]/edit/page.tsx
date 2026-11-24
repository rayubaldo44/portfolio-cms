/**
 * Page: Admin Edit Skill | Type: Server | Deps: db, SkillForm, updateSkill
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { SkillForm } from "@/components/admin/skill-form";
import { Card, CardContent } from "@/components/ui/card";
import { updateSkill } from "../../actions";

export const dynamic = "force-dynamic";

interface EditSkillPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSkillPage({ params }: EditSkillPageProps) {
  const { id } = await params;
  const skill = await db.skill.findUnique({ where: { id } });

  if (!skill) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link
        href="/admin/stack"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <ArrowLeft size={14} />
        Back to stack
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Edit Skill
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Update skill &quot;{skill.name}&quot;.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <SkillForm
            action={updateSkill}
            submitLabel="Save Changes"
            id={skill.id}
            initial={{
              name: skill.name,
              category: skill.category,
              icon: skill.icon ?? "",
              order: skill.order,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}