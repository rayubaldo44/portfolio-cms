/**
 * Page: Admin New Skill | Type: Server | Deps: SkillForm, createSkill
 */
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { SkillForm } from "@/components/admin/skill-form";
import { Card, CardContent } from "@/components/ui/card";
import { createSkill } from "../actions";

export default function NewSkillPage() {
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
          New Skill
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add a skill to your stack.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <SkillForm action={createSkill} submitLabel="Create Skill" />
        </CardContent>
      </Card>
    </div>
  );
}