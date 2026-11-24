/**
 * Component: Skill Form | Type: Client | Deps: FormWrapper, Input, Select
 */
"use client";

import { FormWrapper, type FormState } from "@/components/admin/form-wrapper";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const CATEGORY_OPTIONS = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "tools", label: "Dev Tools" },
  { value: "ai_ml", label: "AI & Machine Learning" },
];

interface SkillFormInitial {
  name?: string;
  category?: string;
  icon?: string;
  order?: number;
}

interface SkillFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: SkillFormInitial;
  id?: string;
  submitLabel?: string;
}

export function SkillForm({ action, initial, id, submitLabel }: SkillFormProps) {
  return (
    <FormWrapper action={action} submitLabel={submitLabel}>
      {id && <input type="hidden" name="id" value={id} />}
      <div className="flex flex-col gap-4">
        <Input
          name="name"
          label="Name"
          placeholder="TypeScript"
          required
          defaultValue={initial?.name ?? ""}
        />
        <Select
          name="category"
          label="Category"
          defaultValue={initial?.category ?? "frontend"}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Input
          name="icon"
          label="Icon"
          placeholder="Optional Phosphor icon name"
          helper="Not rendered in the current public UI."
          defaultValue={initial?.icon ?? ""}
        />
        <Input
          name="order"
          label="Order"
          type="number"
          min={0}
          defaultValue={initial?.order ?? 0}
        />
      </div>
    </FormWrapper>
  );
}