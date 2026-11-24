"use client";
import { FormWrapper, type FormState } from "@/components/admin/form-wrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { RESOURCE_CATEGORIES } from "@/lib/resources";

interface ResourceFormProps {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  initial?: { title: string; url: string; description: string | null; category: string; order: number };
  id?: string;
  submitLabel: string;
}

export function ResourceForm({ action, initial, id, submitLabel }: ResourceFormProps) {
  return (
    <FormWrapper action={action} submitLabel={submitLabel}>
      {id && <input type="hidden" name="id" value={id} />}
      <Input name="title" label="Resource title" required maxLength={180} defaultValue={initial?.title ?? ""} />
      <Input name="url" label="Resource link" type="url" required maxLength={2048} placeholder="https://…" defaultValue={initial?.url ?? ""} />
      <Textarea name="description" label="What I learned (optional)" maxLength={1000} defaultValue={initial?.description ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="category" label="Skill area" required defaultValue={initial?.category ?? "frontend"}>
          {RESOURCE_CATEGORIES.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </Select>
        <Input name="order" label="Order" type="number" min={0} step={1} defaultValue={initial?.order ?? 0} helper="Lower numbers appear first within the skill area." />
      </div>
    </FormWrapper>
  );
}
